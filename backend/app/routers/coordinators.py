import os
import uuid

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.deps import require_admin
from app.models import Coordinator
from app.schemas import CoordinatorOut

router = APIRouter(tags=["coordinators"])

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
MAX_UPLOAD_BYTES = 5 * 1024 * 1024  # 5 MB


def _delete_file_for_url(image_url: str | None) -> None:
    if not image_url:
        return
    if image_url.startswith(settings.MEDIA_URL_PREFIX):
        relative = image_url[len(settings.MEDIA_URL_PREFIX):].lstrip("/")
        path = os.path.join(settings.MEDIA_ROOT, relative)
        if os.path.isfile(path):
            try:
                os.remove(path)
            except OSError:
                pass


@router.get("/api/coordinators", response_model=list[CoordinatorOut])
def list_coordinators(db: Session = Depends(get_db)):
    return db.query(Coordinator).order_by(Coordinator.display_order.asc(), Coordinator.created_at.asc()).all()


@router.post("/api/admin/coordinators", response_model=CoordinatorOut, status_code=status.HTTP_201_CREATED)
async def create_coordinator(
    name: str = Form(...),
    designation: str = Form(...),
    display_order: int = Form(0),
    image: UploadFile | None = File(None),
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
):
    if not name.strip() or not designation.strip():
        raise HTTPException(status_code=422, detail="Name and designation are required")

    image_url = None
    if image is not None and image.filename:
        image_url = await _save_coordinator_image(image)

    coordinator = Coordinator(
        name=name.strip(), designation=designation.strip(), display_order=display_order, image_url=image_url
    )
    db.add(coordinator)
    db.commit()
    db.refresh(coordinator)
    return coordinator


@router.put("/api/admin/coordinators/{coordinator_id}", response_model=CoordinatorOut)
async def update_coordinator(
    coordinator_id: str,
    name: str = Form(...),
    designation: str = Form(...),
    display_order: int = Form(0),
    image: UploadFile | None = File(None),
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
):
    coordinator = db.query(Coordinator).filter(Coordinator.id == coordinator_id).first()
    if not coordinator:
        raise HTTPException(status_code=404, detail="Coordinator not found")

    if not name.strip() or not designation.strip():
        raise HTTPException(status_code=422, detail="Name and designation are required")

    if image is not None and image.filename:
        new_url = await _save_coordinator_image(image)
        _delete_file_for_url(coordinator.image_url)
        coordinator.image_url = new_url

    coordinator.name = name.strip()
    coordinator.designation = designation.strip()
    coordinator.display_order = display_order
    db.commit()
    db.refresh(coordinator)
    return coordinator


@router.delete("/api/admin/coordinators/{coordinator_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_coordinator(coordinator_id: str, db: Session = Depends(get_db), _admin=Depends(require_admin)):
    coordinator = db.query(Coordinator).filter(Coordinator.id == coordinator_id).first()
    if not coordinator:
        raise HTTPException(status_code=404, detail="Coordinator not found")
    _delete_file_for_url(coordinator.image_url)
    db.delete(coordinator)
    db.commit()
    return None


async def _save_coordinator_image(image: UploadFile) -> str:
    ext = os.path.splitext(image.filename or "")[1].lower()
    if image.content_type not in ALLOWED_IMAGE_TYPES or ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=415, detail="Profile image must be jpg, png, or webp")

    contents = await image.read()
    if len(contents) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="Profile image exceeds the 5MB upload limit")

    coord_dir = os.path.join(settings.MEDIA_ROOT, "coordinators")
    os.makedirs(coord_dir, exist_ok=True)
    stored_name = f"{uuid.uuid4().hex}{ext}"
    with open(os.path.join(coord_dir, stored_name), "wb") as f:
        f.write(contents)

    return f"{settings.MEDIA_URL_PREFIX}/coordinators/{stored_name}"

import os
import uuid

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.deps import require_admin
from app.models import Media, MediaFolder
from app.schemas import MediaFolderCreate, MediaFolderOut, MediaFolderUpdate, MediaOut

router = APIRouter(tags=["media"])

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
MAX_UPLOAD_BYTES = 10 * 1024 * 1024  # 10 MB


def _folder_with_count(db: Session, folder: MediaFolder) -> dict:
    count = db.query(func.count(Media.id)).filter(Media.folder_id == folder.id).scalar() or 0
    data = MediaFolderOut.model_validate(folder).model_dump()
    data["media_count"] = count
    return data


# ---------- Folders ----------

@router.get("/api/media/folders", response_model=list[MediaFolderOut])
def list_folders(db: Session = Depends(get_db)):
    folders = db.query(MediaFolder).order_by(MediaFolder.name.asc()).all()
    return [_folder_with_count(db, f) for f in folders]


@router.post("/api/admin/media/folders", response_model=MediaFolderOut, status_code=status.HTTP_201_CREATED)
def create_folder(payload: MediaFolderCreate, db: Session = Depends(get_db), _admin=Depends(require_admin)):
    existing = db.query(MediaFolder).filter(func.lower(MediaFolder.name) == payload.name.lower()).first()
    if existing:
        raise HTTPException(status_code=409, detail="A folder with this name already exists")
    folder = MediaFolder(name=payload.name)
    db.add(folder)
    db.commit()
    db.refresh(folder)
    return _folder_with_count(db, folder)


@router.put("/api/admin/media/folders/{folder_id}", response_model=MediaFolderOut)
def rename_folder(
    folder_id: str,
    payload: MediaFolderUpdate,
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
):
    folder = db.query(MediaFolder).filter(MediaFolder.id == folder_id).first()
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")
    duplicate = (
        db.query(MediaFolder)
        .filter(func.lower(MediaFolder.name) == payload.name.lower(), MediaFolder.id != folder_id)
        .first()
    )
    if duplicate:
        raise HTTPException(status_code=409, detail="A folder with this name already exists")
    folder.name = payload.name
    db.commit()
    db.refresh(folder)
    return _folder_with_count(db, folder)


@router.delete("/api/admin/media/folders/{folder_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_folder(folder_id: str, db: Session = Depends(get_db), _admin=Depends(require_admin)):
    folder = db.query(MediaFolder).filter(MediaFolder.id == folder_id).first()
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")
    # Remove files from disk for all media in this folder
    for item in folder.media_items:
        _delete_file_for_url(item.image_url)
    db.delete(folder)  # cascades to media rows
    db.commit()
    return None


# ---------- Media ----------

def _delete_file_for_url(image_url: str) -> None:
    if image_url.startswith(settings.MEDIA_URL_PREFIX):
        relative = image_url[len(settings.MEDIA_URL_PREFIX):].lstrip("/")
        path = os.path.join(settings.MEDIA_ROOT, relative)
        if os.path.isfile(path):
            try:
                os.remove(path)
            except OSError:
                pass


@router.get("/api/media", response_model=list[MediaOut])
def list_media(db: Session = Depends(get_db)):
    return db.query(Media).order_by(Media.created_at.desc()).all()


@router.get("/api/media/preview", response_model=list[MediaOut])
def preview_media(limit: int = 4, db: Session = Depends(get_db)):
    return db.query(Media).order_by(Media.created_at.desc()).limit(limit).all()


@router.get("/api/media/folder/{folder_id}", response_model=list[MediaOut])
def list_media_by_folder(folder_id: str, db: Session = Depends(get_db)):
    folder = db.query(MediaFolder).filter(MediaFolder.id == folder_id).first()
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")
    return (
        db.query(Media)
        .filter(Media.folder_id == folder_id)
        .order_by(Media.created_at.desc())
        .all()
    )


@router.post("/api/admin/media/upload", response_model=list[MediaOut], status_code=status.HTTP_201_CREATED)
async def upload_media(
    folder_id: str = Form(...),
    files: list[UploadFile] = File(...),
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
):
    folder = db.query(MediaFolder).filter(MediaFolder.id == folder_id).first()
    if not folder:
        raise HTTPException(status_code=404, detail="Selected folder does not exist")

    created: list[Media] = []
    gallery_dir = os.path.join(settings.MEDIA_ROOT, "gallery")
    os.makedirs(gallery_dir, exist_ok=True)

    for upload in files:
        ext = os.path.splitext(upload.filename or "")[1].lower()
        if upload.content_type not in ALLOWED_IMAGE_TYPES or ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=415,
                detail=f"'{upload.filename}' is not a supported image format (jpg, png, webp, gif only)",
            )

        contents = await upload.read()
        if len(contents) > MAX_UPLOAD_BYTES:
            raise HTTPException(status_code=413, detail=f"'{upload.filename}' exceeds the 10MB upload limit")

        stored_name = f"{uuid.uuid4().hex}{ext}"
        disk_path = os.path.join(gallery_dir, stored_name)
        with open(disk_path, "wb") as f:
            f.write(contents)

        image_url = f"{settings.MEDIA_URL_PREFIX}/gallery/{stored_name}"
        media = Media(folder_id=folder_id, image_url=image_url, image_name=upload.filename or stored_name)
        db.add(media)
        created.append(media)

    db.commit()
    for item in created:
        db.refresh(item)
    return created


@router.delete("/api/admin/media/{media_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_media(media_id: str, db: Session = Depends(get_db), _admin=Depends(require_admin)):
    media = db.query(Media).filter(Media.id == media_id).first()
    if not media:
        raise HTTPException(status_code=404, detail="Media not found")
    _delete_file_for_url(media.image_url)
    db.delete(media)
    db.commit()
    return None

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import require_admin
from app.models import Countdown
from app.schemas import CountdownCreate, CountdownOut, CountdownUpdate

router = APIRouter(tags=["countdown"])


@router.get("/api/countdown/active", response_model=CountdownOut | None)
def get_active_countdown(db: Session = Depends(get_db)):
    return db.query(Countdown).filter(Countdown.is_active.is_(True)).first()


@router.post("/api/admin/countdown", response_model=CountdownOut, status_code=status.HTTP_201_CREATED)
def create_countdown(
    payload: CountdownCreate,
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
):
    # Business rule: only one countdown may be active at a time.
    db.query(Countdown).filter(Countdown.is_active.is_(True)).update({"is_active": False})
    countdown = Countdown(**payload.model_dump(), is_active=True)
    db.add(countdown)
    db.commit()
    db.refresh(countdown)
    return countdown


@router.put("/api/admin/countdown/{countdown_id}", response_model=CountdownOut)
def update_countdown(
    countdown_id: str,
    payload: CountdownUpdate,
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
):
    countdown = db.query(Countdown).filter(Countdown.id == countdown_id).first()
    if not countdown:
        raise HTTPException(status_code=404, detail="Countdown not found")
    for field, value in payload.model_dump().items():
        setattr(countdown, field, value)
    db.commit()
    db.refresh(countdown)
    return countdown


@router.delete("/api/admin/countdown/{countdown_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_countdown(
    countdown_id: str,
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
):
    countdown = db.query(Countdown).filter(Countdown.id == countdown_id).first()
    if not countdown:
        raise HTTPException(status_code=404, detail="Countdown not found")
    db.delete(countdown)
    db.commit()
    return None


@router.get("/api/admin/countdown", response_model=list[CountdownOut])
def list_countdowns(db: Session = Depends(get_db), _admin=Depends(require_admin)):
    return db.query(Countdown).order_by(Countdown.created_at.desc()).all()

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import require_admin
from app.models import Event
from app.schemas import EventCreate, EventOut, EventUpdate

router = APIRouter(tags=["events"])


@router.get("/api/events", response_model=list[EventOut])
def list_events(db: Session = Depends(get_db)):
    return db.query(Event).order_by(Event.event_datetime.asc()).all()


@router.get("/api/events/upcoming", response_model=list[EventOut])
def upcoming_events(limit: int = 3, db: Session = Depends(get_db)):
    return (
        db.query(Event)
        .filter(Event.event_datetime >= datetime.utcnow())
        .order_by(Event.event_datetime.asc())
        .limit(limit)
        .all()
    )


@router.post("/api/admin/events", response_model=EventOut, status_code=status.HTTP_201_CREATED)
def create_event(payload: EventCreate, db: Session = Depends(get_db), _admin=Depends(require_admin)):
    event = Event(**payload.model_dump())
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


@router.put("/api/admin/events/{event_id}", response_model=EventOut)
def update_event(
    event_id: str,
    payload: EventUpdate,
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    for field, value in payload.model_dump().items():
        setattr(event, field, value)
    db.commit()
    db.refresh(event)
    return event


@router.delete("/api/admin/events/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(event_id: str, db: Session = Depends(get_db), _admin=Depends(require_admin)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    db.delete(event)
    db.commit()
    return None

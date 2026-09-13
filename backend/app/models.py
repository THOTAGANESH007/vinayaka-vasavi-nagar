import enum
import uuid
from datetime import datetime

from sqlalchemy import (
    Boolean, Column, DateTime, Enum, ForeignKey, Integer, String, Text, UniqueConstraint
)
from sqlalchemy.orm import relationship

from app.database import Base


def gen_uuid() -> str:
    return str(uuid.uuid4())


class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    USER = "USER"


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=gen_uuid)
    username = Column(String(80), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.USER)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Countdown(Base):
    __tablename__ = "countdowns"

    id = Column(String, primary_key=True, default=gen_uuid)
    event_name = Column(String(200), nullable=False)
    event_datetime = Column(DateTime, nullable=False)
    description_before_event = Column(Text, nullable=True)
    completion_title = Column(String(200), nullable=False)
    completion_description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Event(Base):
    __tablename__ = "events"

    id = Column(String, primary_key=True, default=gen_uuid)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    event_datetime = Column(DateTime, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class MediaFolder(Base):
    __tablename__ = "media_folders"
    __table_args__ = (UniqueConstraint("name", name="uq_media_folder_name"),)

    id = Column(String, primary_key=True, default=gen_uuid)
    name = Column(String(120), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    media_items = relationship("Media", back_populates="folder", cascade="all, delete-orphan")


class Media(Base):
    __tablename__ = "media"

    id = Column(String, primary_key=True, default=gen_uuid)
    folder_id = Column(String, ForeignKey("media_folders.id", ondelete="CASCADE"), nullable=False)
    image_url = Column(String(500), nullable=False)
    image_name = Column(String(255), nullable=False)
    cloudinary_public_id = Column(String(500), nullable=True)  # used for Cloudinary deletion
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    folder = relationship("MediaFolder", back_populates="media_items")


class Coordinator(Base):
    __tablename__ = "coordinators"

    id = Column(String, primary_key=True, default=gen_uuid)
    name = Column(String(150), nullable=False)
    designation = Column(String(150), nullable=False)
    image_url = Column(String(500), nullable=True)
    cloudinary_public_id = Column(String(500), nullable=True)  # used for Cloudinary deletion
    display_order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

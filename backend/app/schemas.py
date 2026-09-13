from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, ConfigDict, field_validator

from app.models import UserRole


# ---------- Auth / Users ----------

class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    username: str
    email: str
    role: UserRole


class LoginRequest(BaseModel):
    username: str
    password: str


class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

    @field_validator("name")
    @classmethod
    def name_not_blank(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Name is required")
        return v.strip()

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters")
        return v


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ---------- Countdown ----------

class CountdownBase(BaseModel):
    event_name: str
    event_datetime: datetime
    description_before_event: Optional[str] = None
    completion_title: str
    completion_description: Optional[str] = None

    @field_validator("event_name", "completion_title")
    @classmethod
    def not_blank(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("This field cannot be empty")
        return v.strip()


class CountdownCreate(CountdownBase):
    pass


class CountdownUpdate(CountdownBase):
    pass


class CountdownOut(CountdownBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
    is_active: bool
    created_at: datetime
    updated_at: datetime


# ---------- Events ----------

class EventBase(BaseModel):
    title: str
    description: Optional[str] = None
    event_datetime: datetime

    @field_validator("title")
    @classmethod
    def title_not_blank(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Event title is required")
        return v.strip()


class EventCreate(EventBase):
    pass


class EventUpdate(EventBase):
    pass


class EventOut(EventBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
    created_at: datetime
    updated_at: datetime


# ---------- Media Folders ----------

class MediaFolderBase(BaseModel):
    name: str

    @field_validator("name")
    @classmethod
    def name_not_blank(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Folder name is required")
        return v.strip()


class MediaFolderCreate(MediaFolderBase):
    pass


class MediaFolderUpdate(MediaFolderBase):
    pass


class MediaFolderOut(MediaFolderBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
    created_at: datetime
    updated_at: datetime
    media_count: int = 0


# ---------- Media ----------

class MediaOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    folder_id: str
    image_url: str
    image_name: str
    created_at: datetime


# ---------- Coordinators ----------

class CoordinatorBase(BaseModel):
    name: str
    designation: str
    display_order: int = 0

    @field_validator("name", "designation")
    @classmethod
    def field_not_blank(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("This field is required")
        return v.strip()


class CoordinatorUpdate(CoordinatorBase):
    pass


class CoordinatorOut(CoordinatorBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
    image_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime

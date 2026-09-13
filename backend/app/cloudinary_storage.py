from typing import Any

import cloudinary
import cloudinary.uploader

from app.config import settings


cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True,
)


def upload_image(contents: bytes, folder: str) -> tuple[str, str]:
    result: dict[str, Any] = cloudinary.uploader.upload(
        contents,
        folder=folder,
        resource_type="image",
    )
    return result["secure_url"], result["public_id"]


def delete_image(public_id: str | None) -> None:
    if public_id:
        cloudinary.uploader.destroy(public_id, resource_type="image", invalidate=True)
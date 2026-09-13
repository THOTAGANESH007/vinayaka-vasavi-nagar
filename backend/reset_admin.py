"""
Resets (or creates) the admin account using the ADMIN_USERNAME / ADMIN_EMAIL /
ADMIN_PASSWORD values currently in your .env file.

Run this any time you change admin credentials in .env and want them to
actually take effect in the database (the app only auto-creates an admin
once, on the very first run — editing .env afterward doesn't update it):

    cd backend
    source venv/bin/activate          # Windows: venv\\Scripts\\activate
    python reset_admin.py
"""
from app.database import SessionLocal
from app.models import User, UserRole
from app.security import hash_password
from app.config import settings


def reset_admin():
    db = SessionLocal()
    try:
        admin = db.query(User).filter(User.role == UserRole.ADMIN).first()

        if admin:
            admin.username = settings.ADMIN_USERNAME
            admin.email = settings.ADMIN_EMAIL
            admin.password_hash = hash_password(settings.ADMIN_PASSWORD)
            db.commit()
            print(f"Updated existing admin -> username: {settings.ADMIN_USERNAME}, email: {settings.ADMIN_EMAIL}")
        else:
            admin = User(
                username=settings.ADMIN_USERNAME,
                email=settings.ADMIN_EMAIL,
                password_hash=hash_password(settings.ADMIN_PASSWORD),
                role=UserRole.ADMIN,
            )
            db.add(admin)
            db.commit()
            print(f"Created new admin -> username: {settings.ADMIN_USERNAME}, email: {settings.ADMIN_EMAIL}")
    finally:
        db.close()


if __name__ == "__main__":
    reset_admin()

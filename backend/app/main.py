from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import Base, SessionLocal, engine
from app.models import User, UserRole
from app.routers import auth, coordinators, countdown, events, media
from app.security import hash_password


def seed_admin_user() -> None:
    """Create the initial admin account from .env if no admin exists yet."""
    db = SessionLocal()
    try:
        existing_admin = db.query(User).filter(User.role == UserRole.ADMIN).first()
        if existing_admin:
            return
        admin = User(
            username=settings.ADMIN_USERNAME,
            email=settings.ADMIN_EMAIL,
            password_hash=hash_password(settings.ADMIN_PASSWORD),
            role=UserRole.ADMIN,
        )
        db.add(admin)
        db.commit()
        print(f"Created initial admin user '{settings.ADMIN_USERNAME}'. "
              f"Login with the credentials set in your .env file.")
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    seed_admin_user()
    yield


app = FastAPI(
    title="Vinayaka Youth Vasavi Nagar API",
    description="Backend API for the Vinayaka Youth Vasavi Nagar (Podalakur) Ganesh Chaturthi community site.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# app.mount(settings.MEDIA_URL_PREFIX, StaticFiles(directory=settings.MEDIA_ROOT), name="media")
# app.mount("/assets", StaticFiles(directory="./assets"), name="assets")

app.include_router(auth.router)
app.include_router(countdown.router)
app.include_router(events.router)
app.include_router(media.router)
app.include_router(coordinators.router)


@app.get("/api/health")
def health_check():
    return {"status": "ok"}

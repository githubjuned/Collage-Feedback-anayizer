from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.database import engine, Base, SessionLocal
from app.models import User, Feedback
from app.auth import hash_password
from app.seed_data import generate_seed_feedbacks
from app.routes import auth_routes, feedback_routes, analytics_routes, export_routes

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Create tables
    Base.metadata.create_all(bind=engine)
    
    # 2. Check and seed default admin account
    db = SessionLocal()
    try:
        admin_user = db.query(User).filter(User.email == settings.ADMIN_EMAIL).first()
        if not admin_user:
            admin_user = User(
                email=settings.ADMIN_EMAIL,
                hashed_password=hash_password(settings.ADMIN_PASSWORD),
                full_name=settings.ADMIN_NAME,
                role="admin",
                department="Student Affairs"
            )
            db.add(admin_user)
            db.commit()
            print(f"[CampusPulse AI] Created default admin user: {settings.ADMIN_EMAIL}")

        # 3. Seed demo feedback if database is completely empty
        count = db.query(Feedback).count()
        if count == 0:
            seeds = generate_seed_feedbacks()
            db.add_all(seeds)
            db.commit()
            print(f"[CampusPulse AI] Seeded {len(seeds)} multilingual feedback responses.")
    finally:
        db.close()

    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Intelligent College Feedback Analyzer with Multilingual AI Triage (EN, HI, MR)",
    version="2.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routes
app.include_router(auth_routes.router, prefix=settings.API_V1_STR)
app.include_router(feedback_routes.router, prefix=settings.API_V1_STR)
app.include_router(analytics_routes.router, prefix=settings.API_V1_STR)
app.include_router(export_routes.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "app": "CampusPulse AI",
        "status": "online",
        "version": "2.0.0",
        "docs": "/docs"
    }

@app.get("/api/health")
def health():
    return {"status": "healthy", "service": "campuspulse-api"}

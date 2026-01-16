from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import Base, engine
from app.api import auth, novels, chapters, merge_requests

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost",  # 允许从 nginx (80端口) 访问
        "http://127.0.0.1",  # 允许从 nginx (80端口) 访问
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(novels.router, prefix="/api/novels", tags=["Novels"])
app.include_router(chapters.router, prefix="/api", tags=["Chapters"])
app.include_router(merge_requests.router, prefix="/api", tags=["Merge Requests"])


@app.get("/")
def root():
    return {
        "message": "AI Vision Novel Platform API",
        "version": settings.VERSION,
        "docs": "/docs"
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}

from fastapi import FastAPI, Request
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


@app.get("/api")
def list_api_routes(request: Request):
    """
    自动获取所有 API 路由列表
    当添加新的路由时，会自动出现在这个列表中
    """
    app = request.app
    routes = []

    for route in app.routes:
        # 排除健康检查、文档等非 API 路由
        if hasattr(route, 'path') and hasattr(route, 'methods'):
            # 只包含 /api 开头的路径和根路径
            if route.path.startswith('/api') or route.path == '/':
                # 排除 /api 自身
                if route.path != '/api':
                    routes.append({
                        "path": route.path,
                        "methods": list(route.methods),
                        "name": getattr(route, 'name', 'unknown')
                    })

    return {
        "message": "AI Vision Novel Platform API",
        "version": settings.VERSION,
        "total_endpoints": len(routes),
        "endpoints": routes,
        "docs": "/docs",
        "redoc": "/redoc",
        "openapi": "/openapi.json"
    }

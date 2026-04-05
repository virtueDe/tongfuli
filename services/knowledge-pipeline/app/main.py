from fastapi import FastAPI

from app.api.health import router as health_router


def create_application() -> FastAPI:
    """创建知识处理服务应用实例。"""
    app = FastAPI(title="Tongfuli Knowledge Pipeline", version="0.1.0")
    app.include_router(health_router)
    return app


app = create_application()

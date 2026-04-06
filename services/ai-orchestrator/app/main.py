from fastapi import FastAPI

from app.api.conversation import router as conversation_router
from app.api.health import router as health_router


def create_application() -> FastAPI:
    """创建 AI 编排服务应用实例。"""
    app = FastAPI(title="Tongfuli AI Orchestrator", version="0.1.0")
    app.include_router(health_router)
    app.include_router(conversation_router)
    return app


app = create_application()

from fastapi import APIRouter

router = APIRouter(prefix="/health", tags=["health"])


@router.get("")
def health_check() -> dict[str, str]:
    """健康检查接口。"""
    return {"service": "knowledge-pipeline", "status": "ok"}

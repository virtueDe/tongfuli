from dataclasses import dataclass


@dataclass(slots=True)
class OrchestrationRequest:
    user_input: str
    session_id: str


class OrchestrationService:
    """AI 编排服务占位，后续会串联分类、检索、生成与校验。"""

    def summarize_request(self, request: OrchestrationRequest) -> dict[str, str]:
        return {
            "sessionId": request.session_id,
            "inputPreview": request.user_input[:120],
        }

from typing import Literal

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.orchestration.service import (
    OrchestrationAnswer,
    OrchestrationRequest,
    OrchestrationService,
)

router = APIRouter(prefix="/internal/orchestration", tags=["conversation"])


class ConversationRequest(BaseModel):
    sessionId: str = Field(min_length=1)
    userInput: str = Field(min_length=1)
    actingCharacterId: str = Field(min_length=1)
    mode: Literal["canon", "extended", "fun"]


class ConversationResponse(BaseModel):
    turnId: str
    answer: str
    actingCharacterId: str
    mode: Literal["canon", "extended", "fun"]
    questionType: str
    retrievalLayers: list[str]
    retrievalStrategies: list[str]
    postcheckChecks: list[str]
    degraded: bool
    blockReason: str | None

    @classmethod
    def from_answer(cls, answer: OrchestrationAnswer) -> "ConversationResponse":
        return cls(
            turnId=answer.turn_id,
            answer=answer.answer,
            actingCharacterId=answer.acting_character_id,
            mode=answer.mode,
            questionType=answer.question_type,
            retrievalLayers=answer.retrieval_plan.layers,
            retrievalStrategies=answer.retrieval_plan.strategies,
            postcheckChecks=answer.postcheck.checks,
            degraded=answer.postcheck.degraded,
            blockReason=answer.postcheck.block_reason,
        )


service = OrchestrationService()


@router.post("/answers", response_model=ConversationResponse)
def generate_answer(payload: ConversationRequest) -> ConversationResponse:
    answer = service.generate_answer(
        OrchestrationRequest(
            session_id=payload.sessionId,
            user_input=payload.userInput,
            acting_character_id=payload.actingCharacterId,
            mode=payload.mode,
        )
    )
    return ConversationResponse.from_answer(answer)

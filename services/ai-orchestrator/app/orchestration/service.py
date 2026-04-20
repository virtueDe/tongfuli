from dataclasses import dataclass
from uuid import uuid4

from app.gateway.service import GatewayRequest, ModelGateway
from app.postcheck.service import PostCheckResult, PostCheckService
from app.retrieval.service import RetrievalPlan, RetrievalService


@dataclass(slots=True)
class OrchestrationRequest:
    session_id: str
    user_input: str
    acting_character_id: str
    mode: str


@dataclass(slots=True)
class OrchestrationAnswer:
    turn_id: str
    answer: str
    acting_character_id: str
    mode: str
    question_type: str
    retrieval_plan: RetrievalPlan
    postcheck: PostCheckResult


class OrchestrationService:
    """首版 AI 编排链路：问题分类 -> 检索规划 -> 回答拼装 -> 后校验。"""

    _CHARACTER_OPENINGS = {
        "char_baizhantang": "展堂我先把话撂这儿",
        "char_tongxiangyu": "额跟你把这事掰扯清楚",
        "char_guofurong": "本女侠看这事一点都不复杂",
    }

    def __init__(
        self,
        retrieval_service: RetrievalService | None = None,
        model_gateway: ModelGateway | None = None,
        postcheck_service: PostCheckService | None = None,
    ) -> None:
        self.retrieval_service = retrieval_service or RetrievalService()
        self.model_gateway = model_gateway or ModelGateway()
        self.postcheck_service = postcheck_service or PostCheckService()

    def classify_question(self, user_input: str) -> str:
        normalized = user_input.strip()
        if any(token in normalized for token in ["为什么", "第几集", "谁", "哪里", "关系"]):
            return "fact"
        if any(token in normalized for token in ["梗", "吐槽", "好笑", "玩笑"]):
            return "meme"
        return "roleplay"

    def generate_answer(self, request: OrchestrationRequest) -> OrchestrationAnswer:
        normalized_input = request.user_input.strip()
        rate_limit = self.postcheck_service.rate_limit(max(1, len(normalized_input) // 4))
        if not rate_limit.allowed:
            blocked_answer = "这轮问得有点急，我先收一收，你稍后再接着问。"
            postcheck = PostCheckResult(
                answer_length=len(blocked_answer),
                needs_rewrite=False,
                checks=["rate_limit"],
                degraded=True,
                block_reason=rate_limit.reason,
            )
            return OrchestrationAnswer(
                turn_id=f"turn_{uuid4().hex[:12]}",
                answer=blocked_answer,
                acting_character_id=request.acting_character_id,
                mode=request.mode,
                question_type="rate_limited",
                retrieval_plan=RetrievalPlan(
                    question_type="rate_limited",
                    layers=[],
                    strategies=[],
                ),
                postcheck=postcheck,
            )

        question_type = self.classify_question(normalized_input)
        retrieval_plan = self.retrieval_service.plan(question_type, request.mode)
        opening = self._CHARACTER_OPENINGS.get(
            request.acting_character_id,
            self._CHARACTER_OPENINGS["char_baizhantang"],
        )

        prompt = (
            f"{opening}，你问的是“{normalized_input}”。"
            f" 本轮判定问题类型是 {question_type}，"
            f"会优先查这些知识层：{', '.join(retrieval_plan.layers)}，"
            f"采用这些检索策略：{', '.join(retrieval_plan.strategies)}。"
        )
        answer_text = self.model_gateway.generate(
            GatewayRequest(
                prompt=prompt,
                mode=request.mode,
                acting_character_id=request.acting_character_id,
            )
        )
        postcheck = self.postcheck_service.evaluate(answer_text)
        if postcheck.block_reason == "unsafe_content":
            answer_text = "这类内容我不接，咱还是回到《武林外传》的剧情和人物上来聊。"

        return OrchestrationAnswer(
            turn_id=f"turn_{uuid4().hex[:12]}",
            answer=answer_text,
            acting_character_id=request.acting_character_id,
            mode=request.mode,
            question_type=question_type,
            retrieval_plan=retrieval_plan,
            postcheck=postcheck,
        )

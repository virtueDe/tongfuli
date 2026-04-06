from dataclasses import dataclass
from uuid import uuid4


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


class OrchestrationService:
    """生成第一版角色化回答，后续再替换成真实检索与模型链路。"""

    _CHARACTER_OPENINGS = {
        "char_baizhantang": "展堂我先把话撂这儿",
        "char_tongxiangyu": "额跟你把这事掰扯清楚",
        "char_guofurong": "本女侠看这事一点都不复杂",
    }

    _MODE_SUFFIX = {
        "canon": "，这话尽量照着原剧的人情世故来讲。",
        "extended": "，我顺手把背景和前因后果也给你补齐。",
        "fun": "，要是你非得图个乐呵，那我就说得俏皮一点。",
    }

    def generate_answer(self, request: OrchestrationRequest) -> OrchestrationAnswer:
        opening = self._CHARACTER_OPENINGS.get(
            request.acting_character_id,
            self._CHARACTER_OPENINGS["char_baizhantang"],
        )
        mode_suffix = self._MODE_SUFFIX.get(request.mode, self._MODE_SUFFIX["canon"])
        normalized_input = request.user_input.strip()
        answer = (
            f"{opening}，你问的是“{normalized_input}”。"
            " 现在这版编排先把角色口吻和主链路跑通，"
            f"{mode_suffix}"
        )

        return OrchestrationAnswer(
            turn_id=f"turn_{uuid4().hex[:12]}",
            answer=answer,
            acting_character_id=request.acting_character_id,
            mode=request.mode,
        )

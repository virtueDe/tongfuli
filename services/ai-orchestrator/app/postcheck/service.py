from dataclasses import dataclass


@dataclass(slots=True)
class PostCheckResult:
    answer_length: int
    needs_rewrite: bool
    checks: list[str]


class PostCheckService:
    """首版后校验摘要。"""

    def evaluate(self, answer_text: str) -> PostCheckResult:
        checks = ["character_consistency", "evidence_presence", "boundary_guard"]
        return PostCheckResult(
            answer_length=len(answer_text),
            needs_rewrite=False,
            checks=checks,
        )

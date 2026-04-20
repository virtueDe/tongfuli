from dataclasses import dataclass


@dataclass(slots=True)
class PostCheckResult:
    answer_length: int
    needs_rewrite: bool
    checks: list[str]
    degraded: bool
    block_reason: str | None


@dataclass(slots=True)
class RateLimitDecision:
    allowed: bool
    reason: str


class PostCheckService:
    """首版后校验、降级和限流判断。"""

    def evaluate(self, answer_text: str) -> PostCheckResult:
        normalized = answer_text.strip()
        checks = ["character_consistency", "evidence_presence", "boundary_guard"]

        if any(token in normalized for token in ["违法", "暴力教程", "绕过限制"]):
            return PostCheckResult(
                answer_length=len(normalized),
                needs_rewrite=True,
                checks=checks + ["safety_block"],
                degraded=True,
                block_reason="unsafe_content",
            )

        degraded = len(normalized) > 180
        return PostCheckResult(
            answer_length=len(normalized),
            needs_rewrite=False,
            checks=checks,
            degraded=degraded,
            block_reason=None,
        )

    def rate_limit(self, request_count: int) -> RateLimitDecision:
        if request_count >= 6:
            return RateLimitDecision(allowed=False, reason="rate_limited")

        return RateLimitDecision(allowed=True, reason="ok")

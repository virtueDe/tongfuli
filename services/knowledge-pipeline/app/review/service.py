from dataclasses import dataclass


@dataclass(slots=True)
class ReviewDecision:
    review_task_id: str
    status: str
    note: str
    publishable: bool


class ReviewService:
    """审核决策的第一版实现。"""

    def states(self) -> list[str]:
        return ["draft", "reviewing", "approved", "rejected", "published", "archived"]

    def decide(self, review_task_id: str, trust_level: str, approve: bool) -> ReviewDecision:
        status = "approved" if approve else "rejected"
        publishable = approve and trust_level != "low"
        note = "审核通过" if publishable else "需人工复核或已驳回"

        return ReviewDecision(
            review_task_id=review_task_id,
            status=status,
            note=note,
            publishable=publishable,
        )

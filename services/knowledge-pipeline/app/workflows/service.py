from dataclasses import dataclass

from app.indexing.service import IndexRefreshPlan, IndexingService
from app.review.service import ReviewDecision, ReviewService


@dataclass(slots=True)
class PublishWorkflowResult:
    review: ReviewDecision
    publish_status: str
    refresh_plan: IndexRefreshPlan | None


class WorkflowService:
    """审核、发布与索引刷新串联的第一版工作流。"""

    def __init__(
        self,
        review_service: ReviewService | None = None,
        indexing_service: IndexingService | None = None,
    ) -> None:
        self.review_service = review_service or ReviewService()
        self.indexing_service = indexing_service or IndexingService()

    def list_flows(self) -> list[str]:
        return ["ingestion", "extraction", "review", "publish", "reindex"]

    def run_publish_flow(
        self,
        review_task_id: str,
        trust_level: str,
        document_id: str,
        snapshot_version: str,
        approve: bool,
    ) -> PublishWorkflowResult:
        review = self.review_service.decide(review_task_id, trust_level, approve)

        if not review.publishable:
            return PublishWorkflowResult(
                review=review,
                publish_status="blocked",
                refresh_plan=None,
            )

        return PublishWorkflowResult(
            review=review,
            publish_status="published",
            refresh_plan=self.indexing_service.plan_refresh(document_id, snapshot_version),
        )

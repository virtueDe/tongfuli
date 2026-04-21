from dataclasses import dataclass

from app.indexing.service import IndexRefreshPlan, IndexingService
from app.review.service import ReviewDecision, ReviewService
from app.video_sources.models import PublishedVideoKnowledge
from app.video_sources.service import VideoSourceService


@dataclass(slots=True)
class PublishWorkflowResult:
    review: ReviewDecision
    publish_status: str
    refresh_plan: IndexRefreshPlan | None


@dataclass(slots=True)
class VideoPublishWorkflowResult:
    review: ReviewDecision
    publish_status: str
    refresh_plan: IndexRefreshPlan | None
    published_record: PublishedVideoKnowledge | None


class WorkflowService:
    """审核、发布与索引刷新串联的第一版工作流。"""

    def __init__(
        self,
        review_service: ReviewService | None = None,
        indexing_service: IndexingService | None = None,
        video_source_service: VideoSourceService | None = None,
    ) -> None:
        self.review_service = review_service or ReviewService()
        self.indexing_service = indexing_service or IndexingService()
        self.video_source_service = video_source_service or VideoSourceService()

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

    def run_video_publish_flow(
        self,
        review_task_id: str,
        trust_level: str,
        confidence_label: str,
        source_document_id: str,
        candidate_ids: list[str],
        snapshot_version: str,
        approve: bool,
    ) -> VideoPublishWorkflowResult:
        review = self.review_service.decide_video_candidate(
            review_task_id=review_task_id,
            trust_level=trust_level,
            confidence_label=confidence_label,
            approve=approve,
        )

        if not review.publishable:
            return VideoPublishWorkflowResult(
                review=review,
                publish_status="blocked",
                refresh_plan=None,
                published_record=None,
            )

        published_record = self.video_source_service.build_published_record(
            source_document_id=source_document_id,
            candidate_ids=candidate_ids,
            snapshot_version=snapshot_version,
        )

        return VideoPublishWorkflowResult(
            review=review,
            publish_status="published",
            refresh_plan=self.indexing_service.plan_refresh(
                source_document_id, snapshot_version
            ),
            published_record=published_record,
        )

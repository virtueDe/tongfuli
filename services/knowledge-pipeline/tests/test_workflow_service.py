from app.indexing.service import IndexingService
from app.review.service import ReviewService
from app.workflows.service import WorkflowService


def test_review_service_should_block_low_trust_publish() -> None:
    decision = ReviewService().decide(
        review_task_id="review_001",
        trust_level="low",
        approve=True,
    )

    assert decision.status == "approved"
    assert decision.publishable is False


def test_indexing_service_should_plan_all_targets() -> None:
    plan = IndexingService().plan_refresh(
        document_id="doc_001",
        snapshot_version="snapshot_2026_04_20",
    )

    assert plan.document_id == "doc_001"
    assert plan.targets == ["opensearch", "pgvector", "neo4j"]


def test_workflow_service_should_publish_and_schedule_refresh() -> None:
    result = WorkflowService().run_publish_flow(
        review_task_id="review_002",
        trust_level="medium",
        document_id="doc_002",
        snapshot_version="snapshot_2026_04_20",
        approve=True,
    )

    assert result.publish_status == "published"
    assert result.refresh_plan is not None
    assert result.refresh_plan.snapshot_version == "snapshot_2026_04_20"


def test_workflow_service_should_block_unpublishable_source() -> None:
    result = WorkflowService().run_publish_flow(
        review_task_id="review_003",
        trust_level="low",
        document_id="doc_003",
        snapshot_version="snapshot_2026_04_20",
        approve=True,
    )

    assert result.publish_status == "blocked"
    assert result.refresh_plan is None

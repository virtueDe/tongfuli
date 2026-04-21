from app.workflows.service import WorkflowService


def test_publish_flow_publishes_high_confidence_video_candidate() -> None:
    service = WorkflowService()

    result = service.run_video_publish_flow(
        review_task_id="review_video_001",
        trust_level="medium",
        confidence_label="high",
        source_document_id="video:bilibili:BV1xx411c7mD",
        candidate_ids=["candidate_vid_001"],
        snapshot_version="2026.04.21-01",
        approve=True,
    )

    assert result.review.status == "approved"
    assert result.publish_status == "published"
    assert result.published_record is not None
    assert result.published_record.candidate_ids == ["candidate_vid_001"]


def test_publish_flow_blocks_low_confidence_video_candidate() -> None:
    service = WorkflowService()

    result = service.run_video_publish_flow(
        review_task_id="review_video_002",
        trust_level="medium",
        confidence_label="low",
        source_document_id="video:douyin:7210011223344556677",
        candidate_ids=["candidate_vid_002"],
        snapshot_version="2026.04.21-01",
        approve=True,
    )

    assert result.review.publishable is False
    assert result.publish_status == "blocked"
    assert result.published_record is None

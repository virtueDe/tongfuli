from fastapi import APIRouter, status

from app.contracts import VideoPublishRequestContract, VideoSourceImportContract
from app.ingestion.service import IngestionService
from app.workflows.service import WorkflowService

router = APIRouter(prefix="/internal/video-sources", tags=["video-sources"])

ingestion_service = IngestionService()
workflow_service = WorkflowService()


@router.post("/import", status_code=status.HTTP_202_ACCEPTED)
def import_video_source(contract: VideoSourceImportContract) -> dict[str, object]:
    batch = ingestion_service.ingest_video_source(contract)
    return {
        "batchId": batch.batch_id,
        "sourceType": batch.source_type,
        "sourceName": batch.source_name,
        "itemCount": batch.item_count,
        "accepted": batch.accepted,
    }


@router.post("/publish")
def publish_video_source(contract: VideoPublishRequestContract) -> dict[str, object]:
    result = workflow_service.run_video_publish_flow(
        review_task_id=contract.review_task_id,
        trust_level=contract.trust_level,
        confidence_label=contract.confidence_label,
        source_document_id=contract.source_document_id,
        candidate_ids=contract.candidate_ids,
        snapshot_version=contract.snapshot_version,
        approve=True,
    )
    return {
        "review": {
            "reviewTaskId": result.review.review_task_id,
            "status": result.review.status,
            "note": result.review.note,
            "publishable": result.review.publishable,
        },
        "publishStatus": result.publish_status,
        "publishedRecord": None
        if result.published_record is None
        else {
            "sourceDocumentId": result.published_record.source_document_id,
            "candidateIds": result.published_record.candidate_ids,
            "snapshotVersion": result.published_record.snapshot_version,
        },
    }

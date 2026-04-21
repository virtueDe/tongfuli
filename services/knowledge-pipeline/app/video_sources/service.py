from app.contracts import VideoSourceImportContract
from app.ingestion.service import IngestionBatch
from app.video_sources.models import (
    PublishedVideoKnowledge,
    VideoEvidenceSnippet,
    VideoSourceRecord,
)


class VideoSourceService:
    def build_record(self, contract: VideoSourceImportContract) -> VideoSourceRecord:
        evidence = [
            VideoEvidenceSnippet(
                snippet_id=item.snippet_id,
                kind=item.kind,
                content=item.content,
                time_offset_seconds=item.time_offset_seconds,
                confidence=item.confidence,
            )
            for item in contract.evidence
        ]
        return VideoSourceRecord(
            document_id=f"video:{contract.platform}:{contract.platform_video_id}",
            source_name=contract.source_name,
            platform=contract.platform,
            platform_video_id=contract.platform_video_id,
            source_url=contract.source_url,
            title=contract.title,
            author_name=contract.author_name,
            published_at=contract.published_at,
            summary=contract.summary,
            trust_level=contract.trust_level,
            content_language=contract.content_language,
            transcript=contract.transcript,
            evidence=evidence,
        )

    def ingest(self, contract: VideoSourceImportContract) -> IngestionBatch:
        accepted = contract.trust_level in {"high", "medium"} and len(contract.evidence) > 0
        return IngestionBatch(
            batch_id=f"video:{contract.platform}:{contract.platform_video_id}",
            source_type=contract.import_type,
            source_name=contract.source_name,
            item_count=1,
            accepted=accepted,
        )

    def build_published_record(
        self,
        source_document_id: str,
        candidate_ids: list[str],
        snapshot_version: str,
    ) -> PublishedVideoKnowledge:
        return PublishedVideoKnowledge(
            source_document_id=source_document_id,
            candidate_ids=candidate_ids,
            snapshot_version=snapshot_version,
        )

from dataclasses import dataclass

from app.contracts import (
    ExternalSourceImportContract,
    ScriptImportContract,
    VideoSourceImportContract,
)


@dataclass(slots=True)
class IngestionBatch:
    batch_id: str
    source_type: str
    source_name: str
    item_count: int
    accepted: bool


class IngestionService:
    """处理剧本、外部资料与视频来源的第一版导入编排。"""

    def supported_sources(self) -> list[str]:
        return ["script", "web", "article", "manual_card", "video_source"]

    def ingest_script(self, contract: ScriptImportContract) -> IngestionBatch:
        if contract.import_type != "script":
            raise ValueError("只允许 script 导入进入剧本导入链路")

        return IngestionBatch(
            batch_id=contract.batch_id,
            source_type=contract.import_type,
            source_name=contract.source_name,
            item_count=len(contract.items),
            accepted=len(contract.items) > 0,
        )

    def ingest_external_source(
        self, contract: ExternalSourceImportContract
    ) -> IngestionBatch:
        accepted = contract.trust_level in {"high", "medium"}

        return IngestionBatch(
            batch_id=f"external:{contract.source_name}",
            source_type=contract.import_type,
            source_name=contract.source_name,
            item_count=1,
            accepted=accepted,
        )

    def ingest_video_source(self, contract: VideoSourceImportContract) -> IngestionBatch:
        accepted = contract.trust_level in {"high", "medium"} and len(contract.evidence) > 0

        return IngestionBatch(
            batch_id=f"video:{contract.platform}:{contract.platform_video_id}",
            source_type=contract.import_type,
            source_name=contract.source_name,
            item_count=1,
            accepted=accepted,
        )

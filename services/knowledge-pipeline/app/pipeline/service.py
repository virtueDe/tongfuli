from dataclasses import dataclass

from app.contracts import ExternalSourceImportContract, ScriptImportContract
from app.extraction.service import ExtractionService, ExtractionSummary
from app.ingestion.service import IngestionBatch, IngestionService


@dataclass(slots=True)
class PipelineResult:
    ingestion: IngestionBatch
    extraction: ExtractionSummary | None


class PipelineService:
    """剧本导入、外部资料采集与结构化抽取的首版串联服务。"""

    def __init__(
        self,
        ingestion_service: IngestionService | None = None,
        extraction_service: ExtractionService | None = None,
    ) -> None:
        self.ingestion_service = ingestion_service or IngestionService()
        self.extraction_service = extraction_service or ExtractionService()

    def run_script_pipeline(self, contract: ScriptImportContract) -> PipelineResult:
        ingestion = self.ingestion_service.ingest_script(contract)
        extraction = self.extraction_service.extract_script(contract)
        return PipelineResult(ingestion=ingestion, extraction=extraction)

    def run_external_source_pipeline(
        self, contract: ExternalSourceImportContract
    ) -> PipelineResult:
        ingestion = self.ingestion_service.ingest_external_source(contract)
        return PipelineResult(ingestion=ingestion, extraction=None)

import json
from pathlib import Path

from app.contracts import ExternalSourceImportContract, ScriptImportContract
from app.pipeline.service import PipelineService


CONTRACT_ROOT = Path("tests/contracts/imports")


def load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def test_script_pipeline_should_ingest_and_extract() -> None:
    contract = ScriptImportContract.model_validate(
        load_json(CONTRACT_ROOT / "script-import.json")
    )

    result = PipelineService().run_script_pipeline(contract)

    assert result.ingestion.accepted is True
    assert result.ingestion.item_count == 2
    assert result.extraction is not None
    assert result.extraction.character_count == 2
    assert result.extraction.line_count == 2


def test_external_source_pipeline_should_block_low_trust_input() -> None:
    payload = load_json(CONTRACT_ROOT / "external-source-import.json")
    payload["trustLevel"] = "low"
    contract = ExternalSourceImportContract.model_validate(payload)

    result = PipelineService().run_external_source_pipeline(contract)

    assert result.ingestion.accepted is False
    assert result.extraction is None

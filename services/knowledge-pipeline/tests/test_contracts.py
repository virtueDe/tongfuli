import json
from pathlib import Path

from app.contracts import (
    EventEnvelope,
    ExternalSourceImportContract,
    ScriptImportContract,
    VideoPublishRequestContract,
    VideoSourceImportContract,
)


CONTRACT_ROOT = Path("tests/contracts")


def load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def test_event_contract_samples_are_valid() -> None:
    source_ingested = EventEnvelope.model_validate(
        load_json(CONTRACT_ROOT / "events" / "source.ingested.json")
    )
    knowledge_reviewed = EventEnvelope.model_validate(
        load_json(CONTRACT_ROOT / "events" / "knowledge.reviewed.json")
    )

    assert source_ingested.event_type == "source.ingested"
    assert source_ingested.payload["sourceType"] == "script"
    assert knowledge_reviewed.event_type == "knowledge.reviewed"
    assert knowledge_reviewed.payload["decision"] == "approved"


def test_import_contract_samples_are_valid() -> None:
    script_import = ScriptImportContract.model_validate(
        load_json(CONTRACT_ROOT / "imports" / "script-import.json")
    )
    external_import = ExternalSourceImportContract.model_validate(
        load_json(CONTRACT_ROOT / "imports" / "external-source-import.json")
    )
    video_import = VideoSourceImportContract.model_validate(
        load_json(CONTRACT_ROOT / "imports" / "video-source-import.json")
    )
    video_publish = VideoPublishRequestContract.model_validate(
        load_json(CONTRACT_ROOT / "imports" / "video-publish-request.json")
    )

    assert script_import.import_type == "script"
    assert len(script_import.items) == 2
    assert script_import.items[0].speaker == "佟湘玉"
    assert external_import.import_type == "external_source"
    assert external_import.trust_level == "medium"
    assert video_import.import_type == "video_source"
    assert video_import.platform == "bilibili"
    assert video_import.evidence[0].time_offset_seconds == 128
    assert video_publish.candidate_ids == ["candidate_vid_001"]
    assert video_publish.snapshot_version == "2026.04.21-01"

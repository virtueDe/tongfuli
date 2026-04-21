# Video Knowledge Backend Slice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first working backend slice for video knowledge ingestion in `knowledge-pipeline`, covering video import contracts, normalized ingestion, review-aware publish flow, and test coverage for `B站` and `抖音` source records.

**Architecture:** Extend the existing `knowledge-pipeline` service instead of creating a new crawler service. Keep the slice narrow: add typed video contracts, an adapter-friendly normalization layer, and a publish workflow that turns reviewed video evidence into publishable knowledge records without introducing browser automation, admin UI, or infrastructure orchestration yet.

**Tech Stack:** Python 3.12, FastAPI, Pydantic v2, pytest

---

## Scope

This plan intentionally covers one shippable subsystem: the backend domain slice inside `services/knowledge-pipeline/`.

It does **not** implement:

- `Playwright` capture runtime
- `Temporal` workflows
- `Kafka` events
- `apps/admin` review UI
- production storage adapters

Those should be planned separately after this slice lands.

## File Structure

### Existing files to modify

- `contracts/ingestion-format.md`
  Add the canonical video import contract and evidence fields used by this slice.
- `services/knowledge-pipeline/app/contracts.py`
  Add typed Pydantic models for video imports and publish requests.
- `services/knowledge-pipeline/app/ingestion/service.py`
  Extend ingestion orchestration to accept normalized video imports.
- `services/knowledge-pipeline/app/review/service.py`
  Add confidence-based review policy for video knowledge candidates.
- `services/knowledge-pipeline/app/workflows/service.py`
  Extend publish flow to return video publish results.
- `services/knowledge-pipeline/app/main.py`
  Register the new internal API router.
- `services/knowledge-pipeline/tests/test_contracts.py`
  Validate the new JSON fixtures and contract models.
- `services/knowledge-pipeline/tests/test_health.py`
  Keep existing health coverage untouched while adding API tests in new files.

### New files to create

- `services/knowledge-pipeline/app/api/video_sources.py`
  Internal API endpoint for importing normalized video sources and requesting publish decisions.
- `services/knowledge-pipeline/app/video_sources/__init__.py`
  Package marker.
- `services/knowledge-pipeline/app/video_sources/models.py`
  Domain dataclasses for video records, evidence snippets, and publishable knowledge.
- `services/knowledge-pipeline/app/video_sources/service.py`
  Application service that converts contracts into ingestion batches and publish requests.
- `services/knowledge-pipeline/tests/contracts/imports/video-source-import.json`
  Valid sample for the new import contract.
- `services/knowledge-pipeline/tests/contracts/imports/video-publish-request.json`
  Valid sample for publish payload testing.
- `services/knowledge-pipeline/tests/test_video_ingestion.py`
  Service-level tests for ingesting video sources.
- `services/knowledge-pipeline/tests/test_video_api.py`
  API tests for the new internal endpoints.

## Task 1: Add video import contract and fixtures

**Files:**
- Modify: `contracts/ingestion-format.md`
- Modify: `services/knowledge-pipeline/app/contracts.py`
- Modify: `services/knowledge-pipeline/tests/test_contracts.py`
- Create: `services/knowledge-pipeline/tests/contracts/imports/video-source-import.json`
- Create: `services/knowledge-pipeline/tests/contracts/imports/video-publish-request.json`

- [ ] **Step 1: Write the failing contract test**

```python
from app.contracts import (
    ExternalSourceImportContract,
    ScriptImportContract,
    VideoPublishRequestContract,
    VideoSourceImportContract,
)


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

    assert video_import.import_type == "video_source"
    assert video_import.platform == "bilibili"
    assert video_import.evidence[0].time_offset_seconds == 128
    assert video_publish.candidate_ids == ["candidate_vid_001"]
    assert video_publish.snapshot_version == "2026.04.21-01"
```

- [ ] **Step 2: Run test to verify it fails**

Run: `uv run pytest tests/test_contracts.py::test_import_contract_samples_are_valid -q`

Expected: FAIL with `ImportError` or `NameError` for `VideoSourceImportContract` / `VideoPublishRequestContract`, or missing fixture file errors.

- [ ] **Step 3: Write minimal implementation**

Add these models to `services/knowledge-pipeline/app/contracts.py`:

```python
from pydantic import BaseModel, Field


class VideoEvidenceSnippetContract(BaseModel):
    snippet_id: str = Field(alias="snippetId")
    kind: str
    content: str
    time_offset_seconds: int = Field(alias="timeOffsetSeconds")
    confidence: float


class VideoSourceImportContract(BaseModel):
    import_type: str = Field(alias="importType")
    source_name: str = Field(alias="sourceName")
    platform: str
    platform_video_id: str = Field(alias="platformVideoId")
    source_url: str = Field(alias="sourceUrl")
    title: str
    author_name: str = Field(alias="authorName")
    published_at: str = Field(alias="publishedAt")
    summary: str
    trust_level: str = Field(alias="trustLevel")
    content_language: str = Field(alias="contentLanguage")
    transcript: str
    evidence: list[VideoEvidenceSnippetContract]


class VideoPublishRequestContract(BaseModel):
    review_task_id: str = Field(alias="reviewTaskId")
    source_document_id: str = Field(alias="sourceDocumentId")
    trust_level: str = Field(alias="trustLevel")
    confidence_label: str = Field(alias="confidenceLabel")
    snapshot_version: str = Field(alias="snapshotVersion")
    candidate_ids: list[str] = Field(alias="candidateIds")
```

Update `contracts/ingestion-format.md` with this JSON example:

```json
{
  "title": "武林外传人物关系解析",
  "sourceType": "video",
  "sourceName": "bilibili:wulinyz",
  "platform": "bilibili",
  "platformVideoId": "BV1xx411c7mD",
  "sourceUrl": "https://www.bilibili.com/video/BV1xx411c7mD",
  "authorName": "江湖研究社",
  "publishedAt": "2026-04-21T08:00:00Z",
  "trustLevel": "medium",
  "contentLanguage": "zh-CN",
  "summary": "分析佟湘玉与白展堂关系演进",
  "transcript": "这一段主要讲的是……",
  "evidence": [
    {
      "snippetId": "snippet_vid_001",
      "kind": "transcript",
      "content": "湘玉已经默认老白会留下来",
      "timeOffsetSeconds": 128,
      "confidence": 0.93
    }
  ]
}
```

Create `services/knowledge-pipeline/tests/contracts/imports/video-source-import.json`:

```json
{
  "importType": "video_source",
  "sourceName": "bilibili:wulinyz",
  "platform": "bilibili",
  "platformVideoId": "BV1xx411c7mD",
  "sourceUrl": "https://www.bilibili.com/video/BV1xx411c7mD",
  "title": "武林外传人物关系解析",
  "authorName": "江湖研究社",
  "publishedAt": "2026-04-21T08:00:00Z",
  "summary": "分析佟湘玉与白展堂关系演进",
  "trustLevel": "medium",
  "contentLanguage": "zh-CN",
  "transcript": "这一段主要讲的是佟湘玉对白展堂信任的建立。",
  "evidence": [
    {
      "snippetId": "snippet_vid_001",
      "kind": "transcript",
      "content": "湘玉已经默认老白会留下来",
      "timeOffsetSeconds": 128,
      "confidence": 0.93
    }
  ]
}
```

Create `services/knowledge-pipeline/tests/contracts/imports/video-publish-request.json`:

```json
{
  "reviewTaskId": "review_video_001",
  "sourceDocumentId": "video:bilibili:BV1xx411c7mD",
  "trustLevel": "medium",
  "confidenceLabel": "high",
  "snapshotVersion": "2026.04.21-01",
  "candidateIds": ["candidate_vid_001"]
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `uv run pytest tests/test_contracts.py::test_import_contract_samples_are_valid -q`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add contracts/ingestion-format.md services/knowledge-pipeline/app/contracts.py services/knowledge-pipeline/tests/test_contracts.py services/knowledge-pipeline/tests/contracts/imports/video-source-import.json services/knowledge-pipeline/tests/contracts/imports/video-publish-request.json
git commit -m "feat(knowledge-pipeline): add video ingestion contracts"
```

## Task 2: Add video source domain models and ingestion service

**Files:**
- Create: `services/knowledge-pipeline/app/video_sources/__init__.py`
- Create: `services/knowledge-pipeline/app/video_sources/models.py`
- Create: `services/knowledge-pipeline/app/video_sources/service.py`
- Modify: `services/knowledge-pipeline/app/ingestion/service.py`
- Create: `services/knowledge-pipeline/tests/test_video_ingestion.py`

- [ ] **Step 1: Write the failing service tests**

Create `services/knowledge-pipeline/tests/test_video_ingestion.py` with:

```python
from app.contracts import VideoSourceImportContract
from app.video_sources.service import VideoSourceService


def build_contract() -> VideoSourceImportContract:
    return VideoSourceImportContract.model_validate(
        {
            "importType": "video_source",
            "sourceName": "bilibili:wulinyz",
            "platform": "bilibili",
            "platformVideoId": "BV1xx411c7mD",
            "sourceUrl": "https://www.bilibili.com/video/BV1xx411c7mD",
            "title": "武林外传人物关系解析",
            "authorName": "江湖研究社",
            "publishedAt": "2026-04-21T08:00:00Z",
            "summary": "分析佟湘玉与白展堂关系演进",
            "trustLevel": "medium",
            "contentLanguage": "zh-CN",
            "transcript": "这一段主要讲的是佟湘玉对白展堂信任的建立。",
            "evidence": [
                {
                    "snippetId": "snippet_vid_001",
                    "kind": "transcript",
                    "content": "湘玉已经默认老白会留下来",
                    "timeOffsetSeconds": 128,
                    "confidence": 0.93,
                }
            ],
        }
    )


def test_video_source_service_builds_record_and_batch() -> None:
    service = VideoSourceService()

    record = service.build_record(build_contract())
    batch = service.ingest(build_contract())

    assert record.document_id == "video:bilibili:BV1xx411c7mD"
    assert record.evidence[0].snippet_id == "snippet_vid_001"
    assert batch.source_type == "video_source"
    assert batch.item_count == 1
    assert batch.accepted is True


def test_video_source_service_rejects_empty_evidence() -> None:
    payload = build_contract().model_dump(by_alias=True)
    payload["evidence"] = []
    service = VideoSourceService()

    record = service.ingest(VideoSourceImportContract.model_validate(payload))

    assert record.accepted is False
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `uv run pytest tests/test_video_ingestion.py -q`

Expected: FAIL with `ModuleNotFoundError` for `app.video_sources` or missing methods on `VideoSourceService`.

- [ ] **Step 3: Write minimal implementation**

Create `services/knowledge-pipeline/app/video_sources/models.py`:

```python
from dataclasses import dataclass


@dataclass(slots=True)
class VideoEvidenceSnippet:
    snippet_id: str
    kind: str
    content: str
    time_offset_seconds: int
    confidence: float


@dataclass(slots=True)
class VideoSourceRecord:
    document_id: str
    source_name: str
    platform: str
    platform_video_id: str
    source_url: str
    title: str
    author_name: str
    published_at: str
    summary: str
    trust_level: str
    content_language: str
    transcript: str
    evidence: list[VideoEvidenceSnippet]
```

Create `services/knowledge-pipeline/app/video_sources/service.py`:

```python
from app.contracts import VideoSourceImportContract
from app.ingestion.service import IngestionBatch
from app.video_sources.models import VideoEvidenceSnippet, VideoSourceRecord


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
```

Update `services/knowledge-pipeline/app/ingestion/service.py`:

```python
from app.contracts import (
    ExternalSourceImportContract,
    ScriptImportContract,
    VideoSourceImportContract,
)


class IngestionService:
    """处理剧本、外部资料与视频来源的第一版导入编排。"""

    def supported_sources(self) -> list[str]:
        return ["script", "web", "article", "manual_card", "video_source"]

    def ingest_video_source(self, contract: VideoSourceImportContract) -> IngestionBatch:
        accepted = contract.trust_level in {"high", "medium"} and len(contract.evidence) > 0
        return IngestionBatch(
            batch_id=f"video:{contract.platform}:{contract.platform_video_id}",
            source_type=contract.import_type,
            source_name=contract.source_name,
            item_count=1,
            accepted=accepted,
        )
```

Create `services/knowledge-pipeline/app/video_sources/__init__.py`:

```python
"""视频来源治理相关服务。"""
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `uv run pytest tests/test_video_ingestion.py -q`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add services/knowledge-pipeline/app/video_sources/__init__.py services/knowledge-pipeline/app/video_sources/models.py services/knowledge-pipeline/app/video_sources/service.py services/knowledge-pipeline/app/ingestion/service.py services/knowledge-pipeline/tests/test_video_ingestion.py
git commit -m "feat(knowledge-pipeline): add video source ingestion service"
```

## Task 3: Add confidence-aware review and publish workflow for video candidates

**Files:**
- Modify: `services/knowledge-pipeline/app/review/service.py`
- Modify: `services/knowledge-pipeline/app/workflows/service.py`
- Modify: `services/knowledge-pipeline/app/video_sources/models.py`
- Modify: `services/knowledge-pipeline/app/video_sources/service.py`
- Create: `services/knowledge-pipeline/tests/test_video_publish_flow.py`

- [ ] **Step 1: Write the failing publish workflow tests**

Create `services/knowledge-pipeline/tests/test_video_publish_flow.py`:

```python
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `uv run pytest tests/test_video_publish_flow.py -q`

Expected: FAIL with `AttributeError` because `run_video_publish_flow` and `published_record` do not exist.

- [ ] **Step 3: Write minimal implementation**

Update `services/knowledge-pipeline/app/review/service.py`:

```python
from dataclasses import dataclass


@dataclass(slots=True)
class ReviewDecision:
    review_task_id: str
    status: str
    note: str
    publishable: bool


class ReviewService:
    """审核决策的第一版实现。"""

    def states(self) -> list[str]:
        return ["draft", "reviewing", "approved", "rejected", "published", "archived"]

    def decide(self, review_task_id: str, trust_level: str, approve: bool) -> ReviewDecision:
        status = "approved" if approve else "rejected"
        publishable = approve and trust_level != "low"
        note = "审核通过" if publishable else "需人工复核或已驳回"
        return ReviewDecision(
            review_task_id=review_task_id,
            status=status,
            note=note,
            publishable=publishable,
        )

    def decide_video_candidate(
        self,
        review_task_id: str,
        trust_level: str,
        confidence_label: str,
        approve: bool,
    ) -> ReviewDecision:
        publishable = approve and trust_level != "low" and confidence_label == "high"
        status = "approved" if approve else "rejected"
        note = "视频知识可自动发布" if publishable else "视频知识需人工复核或已驳回"
        return ReviewDecision(
            review_task_id=review_task_id,
            status=status,
            note=note,
            publishable=publishable,
        )
```

Update `services/knowledge-pipeline/app/video_sources/models.py`:

```python
from dataclasses import dataclass


@dataclass(slots=True)
class PublishedVideoKnowledge:
    source_document_id: str
    candidate_ids: list[str]
    snapshot_version: str
```

Update `services/knowledge-pipeline/app/video_sources/service.py`:

```python
from app.video_sources.models import (
    PublishedVideoKnowledge,
    VideoEvidenceSnippet,
    VideoSourceRecord,
)


class VideoSourceService:
    ...

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
```

Update `services/knowledge-pipeline/app/workflows/service.py`:

```python
from dataclasses import dataclass

from app.indexing.service import IndexRefreshPlan, IndexingService
from app.review.service import ReviewDecision, ReviewService
from app.video_sources.models import PublishedVideoKnowledge
from app.video_sources.service import VideoSourceService


@dataclass(slots=True)
class VideoPublishWorkflowResult:
    review: ReviewDecision
    publish_status: str
    refresh_plan: IndexRefreshPlan | None
    published_record: PublishedVideoKnowledge | None


class WorkflowService:
    def __init__(
        self,
        review_service: ReviewService | None = None,
        indexing_service: IndexingService | None = None,
        video_source_service: VideoSourceService | None = None,
    ) -> None:
        self.review_service = review_service or ReviewService()
        self.indexing_service = indexing_service or IndexingService()
        self.video_source_service = video_source_service or VideoSourceService()

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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `uv run pytest tests/test_video_publish_flow.py -q`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add services/knowledge-pipeline/app/review/service.py services/knowledge-pipeline/app/workflows/service.py services/knowledge-pipeline/app/video_sources/models.py services/knowledge-pipeline/app/video_sources/service.py services/knowledge-pipeline/tests/test_video_publish_flow.py
git commit -m "feat(knowledge-pipeline): add video publish workflow"
```

## Task 4: Expose internal API endpoints for video import and publish

**Files:**
- Create: `services/knowledge-pipeline/app/api/video_sources.py`
- Modify: `services/knowledge-pipeline/app/main.py`
- Create: `services/knowledge-pipeline/tests/test_video_api.py`

- [ ] **Step 1: Write the failing API tests**

Create `services/knowledge-pipeline/tests/test_video_api.py`:

```python
from fastapi.testclient import TestClient

from app.main import create_application


def test_video_import_endpoint_returns_ingestion_batch() -> None:
    client = TestClient(create_application())

    response = client.post(
        "/internal/video-sources/import",
        json={
            "importType": "video_source",
            "sourceName": "douyin:wulin001",
            "platform": "douyin",
            "platformVideoId": "7210011223344556677",
            "sourceUrl": "https://www.douyin.com/video/7210011223344556677",
            "title": "武林外传剧情梳理",
            "authorName": "七侠镇观察室",
            "publishedAt": "2026-04-21T09:30:00Z",
            "summary": "梳理郭芙蓉初到同福客栈的事件线",
            "trustLevel": "medium",
            "contentLanguage": "zh-CN",
            "transcript": "郭芙蓉第一次出现时冲突很强。",
            "evidence": [
                {
                    "snippetId": "snippet_vid_101",
                    "kind": "transcript",
                    "content": "郭芙蓉第一次出现时冲突很强",
                    "timeOffsetSeconds": 44,
                    "confidence": 0.95,
                }
            ],
        },
    )

    assert response.status_code == 202
    assert response.json()["batchId"] == "video:douyin:7210011223344556677"
    assert response.json()["accepted"] is True


def test_video_publish_endpoint_returns_published_result() -> None:
    client = TestClient(create_application())

    response = client.post(
        "/internal/video-sources/publish",
        json={
            "reviewTaskId": "review_video_101",
            "sourceDocumentId": "video:douyin:7210011223344556677",
            "trustLevel": "medium",
            "confidenceLabel": "high",
            "snapshotVersion": "2026.04.21-01",
            "candidateIds": ["candidate_vid_101"],
        },
    )

    assert response.status_code == 200
    assert response.json()["publishStatus"] == "published"
    assert response.json()["publishedRecord"]["sourceDocumentId"] == "video:douyin:7210011223344556677"
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `uv run pytest tests/test_video_api.py -q`

Expected: FAIL with `404 Not Found` because the routes are not registered.

- [ ] **Step 3: Write minimal implementation**

Create `services/knowledge-pipeline/app/api/video_sources.py`:

```python
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
```

Update `services/knowledge-pipeline/app/main.py`:

```python
from fastapi import FastAPI

from app.api.health import router as health_router
from app.api.video_sources import router as video_sources_router


def create_application() -> FastAPI:
    """创建知识处理服务应用实例。"""
    app = FastAPI(title="Tongfuli Knowledge Pipeline", version="0.1.0")
    app.include_router(health_router)
    app.include_router(video_sources_router)
    return app
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `uv run pytest tests/test_video_api.py -q`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add services/knowledge-pipeline/app/api/video_sources.py services/knowledge-pipeline/app/main.py services/knowledge-pipeline/tests/test_video_api.py
git commit -m "feat(knowledge-pipeline): add video source api"
```

## Task 5: Run the regression suite for the backend slice

**Files:**
- Modify: none
- Test: `services/knowledge-pipeline/tests/test_health.py`
- Test: `services/knowledge-pipeline/tests/test_contracts.py`
- Test: `services/knowledge-pipeline/tests/test_video_ingestion.py`
- Test: `services/knowledge-pipeline/tests/test_video_publish_flow.py`
- Test: `services/knowledge-pipeline/tests/test_video_api.py`

- [ ] **Step 1: Run the focused regression suite**

Run:

```bash
uv run pytest tests/test_health.py tests/test_contracts.py tests/test_video_ingestion.py tests/test_video_publish_flow.py tests/test_video_api.py -q
```

Expected: PASS with all existing health and contract coverage still green.

- [ ] **Step 2: If a regression appears, fix the smallest broken unit first**

Use one of these minimal repair patterns depending on the failure:

```python
# Alias mismatch in a contract model
candidate_ids: list[str] = Field(alias="candidateIds")

# Missing route registration
app.include_router(video_sources_router)

# Non-publishable review due to wrong confidence label
publishable = approve and trust_level != "low" and confidence_label == "high"
```

- [ ] **Step 3: Re-run the same regression suite**

Run:

```bash
uv run pytest tests/test_health.py tests/test_contracts.py tests/test_video_ingestion.py tests/test_video_publish_flow.py tests/test_video_api.py -q
```

Expected: PASS

- [ ] **Step 4: Capture a clean working tree summary**

Run:

```bash
git status --short
```

Expected: only the files from Tasks 1-4 remain modified or staged; no accidental edits outside `contracts/` and `services/knowledge-pipeline/`.

- [ ] **Step 5: Commit the final verified slice**

```bash
git add contracts/ingestion-format.md services/knowledge-pipeline/app/contracts.py services/knowledge-pipeline/app/ingestion/service.py services/knowledge-pipeline/app/review/service.py services/knowledge-pipeline/app/workflows/service.py services/knowledge-pipeline/app/main.py services/knowledge-pipeline/app/api/video_sources.py services/knowledge-pipeline/app/video_sources/__init__.py services/knowledge-pipeline/app/video_sources/models.py services/knowledge-pipeline/app/video_sources/service.py services/knowledge-pipeline/tests/test_contracts.py services/knowledge-pipeline/tests/test_video_ingestion.py services/knowledge-pipeline/tests/test_video_publish_flow.py services/knowledge-pipeline/tests/test_video_api.py services/knowledge-pipeline/tests/contracts/imports/video-source-import.json services/knowledge-pipeline/tests/contracts/imports/video-publish-request.json
git commit -m "feat(knowledge-pipeline): add first video knowledge backend slice"
```

## Follow-on plans required after this slice

Create separate plans for:

1. `Playwright`-based `B站` / `抖音` capture runtime
2. persistent storage and repository layer for `source_account`, `source_video`, `capture_job`, `raw_asset`
3. model gateway and extraction pipeline
4. review console in `apps/admin`
5. publish snapshot integration with `OpenSearch` and `pgvector`

## Self-Review

### Spec coverage

- Video import contract, evidence snippets, and platform metadata are covered in Task 1.
- Normalized source ingestion and source-type support are covered in Task 2.
- Confidence-aware review, publish gating, and publishable records are covered in Task 3.
- Internal API exposure for the working slice is covered in Task 4.
- Regression verification for the vertical slice is covered in Task 5.

Remaining spec items intentionally excluded from this plan:

- browser automation capture
- queue / workflow engine integration
- admin review UI
- persistent storage adapters
- search / vector / graph publishing

These exclusions are deliberate because they are separate subsystems and would make this plan too broad for one execution cycle.

### Placeholder scan

- No `TBD`, `TODO`, or “implement later” placeholders remain.
- Every test step includes the exact command to run.
- Every implementation step includes concrete file paths and code snippets.

### Type consistency

- `VideoSourceImportContract` and `VideoPublishRequestContract` are introduced in Task 1 and reused consistently in later tasks.
- `confidence_label`, `candidate_ids`, and `source_document_id` use the same names across contracts, services, and tests.
- `run_video_publish_flow()` returns `VideoPublishWorkflowResult` with `published_record` in both implementation and tests.

from pydantic import BaseModel, Field


class EventEnvelope(BaseModel):
    event_id: str = Field(alias="eventId")
    event_type: str = Field(alias="eventType")
    occurred_at: str = Field(alias="occurredAt")
    trace_id: str = Field(alias="traceId")
    producer: str
    payload: dict[str, object]


class ScriptImportItem(BaseModel):
    episode_no: int = Field(alias="episodeNo")
    scene_no: int = Field(alias="sceneNo")
    speaker: str
    line: str


class ScriptImportContract(BaseModel):
    import_type: str = Field(alias="importType")
    source_name: str = Field(alias="sourceName")
    batch_id: str = Field(alias="batchId")
    items: list[ScriptImportItem]


class ExternalSourceImportContract(BaseModel):
    import_type: str = Field(alias="importType")
    source_name: str = Field(alias="sourceName")
    source_url: str = Field(alias="sourceUrl")
    trust_level: str = Field(alias="trustLevel")
    title: str
    content: str


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

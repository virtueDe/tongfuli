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

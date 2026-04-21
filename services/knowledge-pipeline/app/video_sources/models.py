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


@dataclass(slots=True)
class PublishedVideoKnowledge:
    source_document_id: str
    candidate_ids: list[str]
    snapshot_version: str

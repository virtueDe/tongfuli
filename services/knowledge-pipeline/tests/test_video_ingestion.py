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

    batch = service.ingest(VideoSourceImportContract.model_validate(payload))

    assert batch.accepted is False

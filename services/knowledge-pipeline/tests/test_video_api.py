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
    assert (
        response.json()["publishedRecord"]["sourceDocumentId"]
        == "video:douyin:7210011223344556677"
    )

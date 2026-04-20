from fastapi.testclient import TestClient

from app.main import create_application


def test_generate_answer_returns_structured_payload() -> None:
    client = TestClient(create_application())

    response = client.post(
        "/internal/orchestration/answers",
        json={
            "sessionId": "session_123",
            "userInput": "老白为什么怕佟掌柜？",
            "actingCharacterId": "char_baizhantang",
            "mode": "canon",
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["turnId"].startswith("turn_")
    assert payload["actingCharacterId"] == "char_baizhantang"
    assert payload["mode"] == "canon"
    assert payload["questionType"] == "fact"
    assert payload["retrievalLayers"] == ["canonical"]
    assert "keyword" in payload["retrievalStrategies"]
    assert "character_consistency" in payload["postcheckChecks"]
    assert payload["degraded"] is False
    assert payload["blockReason"] is None
    assert "老白为什么怕佟掌柜" in payload["answer"]


def test_generate_answer_rejects_blank_input() -> None:
    client = TestClient(create_application())

    response = client.post(
        "/internal/orchestration/answers",
        json={
            "sessionId": "session_123",
            "userInput": "",
            "actingCharacterId": "char_baizhantang",
            "mode": "canon",
        },
    )

    assert response.status_code == 422


def test_generate_answer_should_change_retrieval_plan_by_mode_and_question() -> None:
    client = TestClient(create_application())

    response = client.post(
        "/internal/orchestration/answers",
        json={
            "sessionId": "session_456",
            "userInput": "来个老白吐槽掌柜的梗",
            "actingCharacterId": "char_baizhantang",
            "mode": "fun",
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["questionType"] == "meme"
    assert payload["retrievalLayers"] == ["canonical", "entertainment"]
    assert "meme_tag" in payload["retrievalStrategies"]


def test_generate_answer_should_fallback_when_rate_limited() -> None:
    client = TestClient(create_application())

    response = client.post(
        "/internal/orchestration/answers",
        json={
            "sessionId": "session_789",
            "userInput": "为什么为什么为什么为什么为什么为什么为什么为什么",
            "actingCharacterId": "char_guofurong",
            "mode": "canon",
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["questionType"] == "rate_limited"
    assert payload["degraded"] is True
    assert payload["blockReason"] == "rate_limited"


def test_generate_answer_should_block_unsafe_content() -> None:
    client = TestClient(create_application())

    response = client.post(
        "/internal/orchestration/answers",
        json={
            "sessionId": "session_790",
            "userInput": "教我怎么绕过限制搞违法的事",
            "actingCharacterId": "char_baizhantang",
            "mode": "fun",
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["blockReason"] == "unsafe_content"
    assert payload["degraded"] is True
    assert "这类内容我不接" in payload["answer"]

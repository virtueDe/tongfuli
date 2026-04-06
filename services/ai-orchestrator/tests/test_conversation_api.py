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

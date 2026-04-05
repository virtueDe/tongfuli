from app.main import create_application
from fastapi.testclient import TestClient


def test_health_check() -> None:
    client = TestClient(create_application())
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json()["status"] == "ok"

import pytest

from src.models import crud


@pytest.fixture
def auth_client(e2e_client):
    """Register and login to get authenticated client."""
    e2e_client.post(
        "/api/auth/register",
        json={"username": "screener_user", "email": "s@example.com", "password": "pass123"},
    )
    login = e2e_client.post(
        "/api/auth/login",
        json={"username": "screener_user", "password": "pass123"},
    )
    token = login.json()["data"]["access_token"]
    e2e_client.headers.update({"Authorization": f"Bearer {token}"})
    return e2e_client


class TestScreenerE2E:
    def test_run_screener_empty(self, auth_client):
        payload = {
            "conditions": [{"field": "pe_ttm", "operator": "<", "value": 10}],
            "sort_by": "pe_ttm",
            "sort_order": "asc",
            "limit": 50,
        }
        response = auth_client.post("/api/screener/run", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["code"] == 0
        assert "count" in data["data"]
        assert "stocks" in data["data"]

    def test_screener_template_crud(self, auth_client, db_session):
        # Create template
        create_resp = auth_client.post(
            "/api/screener/templates",
            json={
                "name": "低估值高ROE",
                "conditions": [
                    {"field": "pe_ttm", "operator": "<", "value": 20},
                    {"field": "roe", "operator": ">", "value": 15},
                ],
            },
        )
        assert create_resp.status_code == 200
        template_id = create_resp.json()["data"]["id"]

        # List templates
        list_resp = auth_client.get("/api/screener/templates")
        assert list_resp.status_code == 200
        templates = list_resp.json()["data"]
        assert any(t["id"] == template_id for t in templates)

        # Delete template
        del_resp = auth_client.delete(f"/api/screener/templates/{template_id}")
        assert del_resp.status_code == 200

        # Verify deleted
        list_resp2 = auth_client.get("/api/screener/templates")
        templates2 = list_resp2.json()["data"]
        assert not any(t["id"] == template_id for t in templates2)

    def test_screener_with_data(self, auth_client, db_session):
        # Insert test fundamental data
        from datetime import datetime

        crud.save_fundamental(
            db_session,
            "000001",
            datetime.strptime("2025-12-31", "%Y-%m-%d"),
            pe_ttm=8.5,
            pb=1.2,
            roe=20.0,
        )
        db_session.commit()

        payload = {
            "conditions": [
                {"field": "pe_ttm", "operator": "<", "value": 10},
                {"field": "roe", "operator": ">", "value": 15},
            ],
            "sort_by": "pe_ttm",
            "sort_order": "asc",
            "limit": 50,
        }
        response = auth_client.post("/api/screener/run", json=payload)
        assert response.status_code == 200
        data = response.json()["data"]
        assert data["count"] >= 1
        codes = [s["code"] for s in data["stocks"]]
        assert "000001" in codes

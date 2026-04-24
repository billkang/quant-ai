import pytest


class TestCollectionE2E:
    @pytest.fixture(autouse=True)
    def setup(self, e2e_client):
        self.client = e2e_client

    def test_collection_job_lifecycle(self):
        # 1. Trigger a stock collection job
        resp = self.client.post(
            "/api/collection/jobs/trigger", json={"job_type": "stock_collection"}
        )
        assert resp.status_code == 200
        job_id = resp.json()["data"]["id"]

        # 2. Query the job list and verify it appears
        list_resp = self.client.get("/api/collection/jobs")
        assert list_resp.status_code == 200
        items = list_resp.json()["data"]["items"]
        assert any(item["id"] == job_id for item in items)

        # 3. Get job detail
        detail_resp = self.client.get(f"/api/collection/jobs/{job_id}")
        assert detail_resp.status_code == 200
        assert detail_resp.json()["data"]["jobType"] == "stock_collection"

        # 4. Cancel the job (should work if still running)
        cancel_resp = self.client.post(f"/api/collection/jobs/{job_id}/cancel")
        # May be 200 or 400 depending on whether job already completed
        assert cancel_resp.status_code in (200, 400)

    def test_news_collection_trigger(self):
        resp = self.client.post(
            "/api/collection/jobs/trigger", json={"job_type": "news_collection"}
        )
        assert resp.status_code == 200
        assert "id" in resp.json()["data"]

    def test_invalid_job_type_rejected(self):
        resp = self.client.post("/api/collection/jobs/trigger", json={"job_type": "invalid"})
        assert resp.status_code == 400

    def test_filter_by_status(self):
        self.client.post("/api/collection/jobs/trigger", json={"job_type": "stock_collection"})
        resp = self.client.get("/api/collection/jobs?status=running")
        assert resp.status_code == 200
        for item in resp.json()["data"]["items"]:
            assert item["status"] == "running"

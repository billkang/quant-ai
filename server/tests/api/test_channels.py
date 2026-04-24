import os

os.environ.setdefault("DATABASE_URL", "sqlite:///./test.db")

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from src.api.deps import get_db
from src.main import app
from src.models.database import Base

TEST_DB_URL = "sqlite:///:memory:"
engine = create_engine(
    TEST_DB_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

import src.models.models  # noqa: E402, F401

Base.metadata.create_all(bind=engine)


def _override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


import pytest  # noqa: E402

from src.models.models import DataChannel, EventJob, EventSource, SourceChannelLink  # noqa: E402

app.dependency_overrides[get_db] = _override_get_db

client = TestClient(app)


@pytest.fixture(autouse=True)
def clean_tables():
    db = TestingSessionLocal()
    db.query(SourceChannelLink).delete()
    db.query(EventJob).delete()
    db.query(DataChannel).delete()
    db.query(EventSource).delete()
    db.commit()
    db.close()
    yield
    db = TestingSessionLocal()
    db.query(SourceChannelLink).delete()
    db.query(EventJob).delete()
    db.query(DataChannel).delete()
    db.query(EventSource).delete()
    db.commit()
    db.close()


class TestChannelAPI:
    def test_list_channels_empty(self):
        response = client.get("/api/channels")
        assert response.status_code == 200
        assert response.json()["code"] == 0
        assert response.json()["data"] == []

    def test_list_channels_with_data_source_filter(self):
        db = TestingSessionLocal()
        source = EventSource(
            name="Test Source",
            source_type="stock_info",
            scope="individual",
            is_builtin=1,
            category="stock_info",
            enabled=1,
        )
        db.add(source)
        db.commit()
        db.refresh(source)

        source_id = source.id
        channel = DataChannel(
            data_source_id=source_id,
            name="Test News",
            collection_method="akshare",
            endpoint="stock_news_em",
            enabled=1,
        )
        db.add(channel)
        db.commit()
        db.close()

        response = client.get(f"/api/channels?data_source_id={source_id}")
        assert response.status_code == 200
        data = response.json()["data"]
        assert len(data) == 1
        assert data[0]["name"] == "Test News"
        assert data[0]["collectionMethod"] == "akshare"
        assert data[0]["dataSourceName"] == "Test Source"

    def test_list_channels_with_enabled_filter(self):
        db = TestingSessionLocal()
        source = EventSource(
            name="Test Source",
            source_type="stock_info",
            scope="individual",
            is_builtin=1,
            enabled=1,
        )
        db.add(source)
        db.commit()
        db.refresh(source)

        ch1 = DataChannel(
            data_source_id=source.id,
            name="Enabled Channel",
            collection_method="akshare",
            enabled=1,
        )
        ch2 = DataChannel(
            data_source_id=source.id,
            name="Disabled Channel",
            collection_method="api",
            enabled=0,
        )
        db.add_all([ch1, ch2])
        db.commit()
        db.close()

        response = client.get("/api/channels?enabled=1")
        assert response.status_code == 200
        data = response.json()["data"]
        assert len(data) == 1
        assert data[0]["name"] == "Enabled Channel"

    def test_create_channel(self):
        db = TestingSessionLocal()
        source = EventSource(
            name="Test Source",
            source_type="stock_info",
            scope="individual",
            is_builtin=1,
            enabled=1,
        )
        db.add(source)
        db.commit()
        db.refresh(source)
        source_id = source.id
        db.close()

        response = client.post(
            "/api/channels",
            json={
                "data_source_id": source_id,
                "name": "New Channel",
                "collection_method": "api",
                "endpoint": "https://example.com/api",
                "enabled": 1,
            },
        )
        assert response.status_code == 200
        assert response.json()["code"] == 0
        assert response.json()["data"]["id"] is not None

    def test_update_channel_enabled(self):
        db = TestingSessionLocal()
        source = EventSource(
            name="Test Source",
            source_type="stock_info",
            scope="individual",
            is_builtin=1,
            enabled=1,
        )
        db.add(source)
        db.commit()
        db.refresh(source)

        channel = DataChannel(
            data_source_id=source.id,
            name="Toggle Test",
            collection_method="api",
            enabled=1,
        )
        db.add(channel)
        db.commit()
        db.refresh(channel)
        channel_id = channel.id
        db.close()

        response = client.put(
            f"/api/channels/{channel_id}",
            json={"enabled": 0},
        )
        assert response.status_code == 200

        db = TestingSessionLocal()
        updated = db.query(DataChannel).filter(DataChannel.id == channel_id).first()
        assert updated.enabled == 0
        db.close()

    def test_delete_channel(self):
        db = TestingSessionLocal()
        source = EventSource(
            name="Test Source",
            source_type="stock_info",
            scope="individual",
            is_builtin=1,
            enabled=1,
        )
        db.add(source)
        db.commit()
        db.refresh(source)

        channel = DataChannel(
            data_source_id=source.id,
            name="Delete Test",
            collection_method="api",
            enabled=1,
        )
        db.add(channel)
        db.commit()
        db.refresh(channel)
        channel_id = channel.id
        db.close()

        response = client.delete(f"/api/channels/{channel_id}")
        assert response.status_code == 200

        db = TestingSessionLocal()
        deleted = db.query(DataChannel).filter(DataChannel.id == channel_id).first()
        assert deleted is None
        db.close()


class TestEventJobsFilter:
    def test_filter_by_trigger_type(self):
        db = TestingSessionLocal()
        source = EventSource(
            name="Test Source",
            source_type="stock_news",
            scope="individual",
            is_builtin=1,
            enabled=1,
        )
        db.add(source)
        db.commit()
        db.refresh(source)

        channel = DataChannel(
            data_source_id=source.id,
            name="Test Channel",
            collection_method="akshare",
            enabled=1,
        )
        db.add(channel)
        db.commit()
        db.refresh(channel)

        job_auto = EventJob(
            source_id=source.id, channel_id=channel.id, status="success", trigger_type="auto"
        )
        job_manual = EventJob(
            source_id=source.id, channel_id=channel.id, status="success", trigger_type="manual"
        )
        db.add_all([job_auto, job_manual])
        db.commit()
        db.close()

        response = client.get("/api/event-jobs?collection_type=manual")
        assert response.status_code == 200
        data = response.json()["data"]
        assert len(data) == 1
        assert data[0]["trigger_type"] == "manual"

    def test_tree_endpoint_returns_aggregated_stats(self):
        db = TestingSessionLocal()
        source = EventSource(
            name="Tree Test",
            source_type="stock_news",
            scope="individual",
            is_builtin=1,
            enabled=1,
        )
        db.add(source)
        db.commit()
        db.refresh(source)

        channel = DataChannel(
            data_source_id=source.id,
            name="Tree Channel",
            collection_method="akshare",
            enabled=1,
        )
        db.add(channel)
        db.commit()
        db.refresh(channel)

        job1 = EventJob(
            source_id=source.id, channel_id=channel.id, status="success", trigger_type="auto"
        )
        job2 = EventJob(
            source_id=source.id, channel_id=channel.id, status="failed", trigger_type="auto"
        )
        db.add_all([job1, job2])
        db.commit()
        db.close()

        response = client.get("/api/event-jobs/monitor")
        assert response.status_code == 200
        data = response.json()["data"]
        assert len(data) == 1
        assert data[0]["aggregated"]["total_jobs"] == 2
        assert data[0]["aggregated"]["success_count"] == 1
        assert data[0]["aggregated"]["failed_count"] == 1


class TestSourceChannelLinks:
    def test_get_source_channels_empty(self):
        db = TestingSessionLocal()
        source = EventSource(
            name="Source", source_type="stock_info", scope="individual", is_builtin=1, enabled=1
        )
        db.add(source)
        db.commit()
        db.refresh(source)
        source_id = source.id
        db.close()

        response = client.get(f"/api/event-sources/{source_id}/channels")
        assert response.status_code == 200
        assert response.json()["data"] == []

    def test_link_and_get_source_channels(self):
        db = TestingSessionLocal()
        source = EventSource(
            name="Source", source_type="stock_info", scope="individual", is_builtin=1, enabled=1
        )
        db.add(source)
        db.commit()
        db.refresh(source)

        ch1 = DataChannel(data_source_id=source.id, name="Ch1", collection_method="api", enabled=1)
        ch2 = DataChannel(data_source_id=source.id, name="Ch2", collection_method="rss", enabled=1)
        db.add_all([ch1, ch2])
        db.commit()
        db.refresh(ch1)
        db.refresh(ch2)
        source_id = source.id
        db.close()

        response = client.post(
            f"/api/event-sources/{source_id}/channels",
            json={"channel_ids": [ch1.id, ch2.id]},
        )
        assert response.status_code == 200

        response = client.get(f"/api/event-sources/{source_id}/channels")
        assert response.status_code == 200
        data = response.json()["data"]
        assert len(data) == 2
        names = {c["name"] for c in data}
        assert names == {"Ch1", "Ch2"}

    def test_unlink_channel(self):
        db = TestingSessionLocal()
        source = EventSource(
            name="Source", source_type="stock_info", scope="individual", is_builtin=1, enabled=1
        )
        db.add(source)
        db.commit()
        db.refresh(source)

        ch = DataChannel(data_source_id=source.id, name="Ch", collection_method="api", enabled=1)
        db.add(ch)
        db.commit()
        db.refresh(ch)
        source_id = source.id
        channel_id = ch.id
        db.close()

        client.post(f"/api/event-sources/{source_id}/channels", json={"channel_ids": [channel_id]})

        response = client.delete(f"/api/event-sources/{source_id}/channels/{channel_id}")
        assert response.status_code == 200

        response = client.get(f"/api/event-sources/{source_id}/channels")
        assert response.json()["data"] == []

    def test_source_list_includes_selected_channel_ids(self):
        db = TestingSessionLocal()
        source = EventSource(
            name="Source", source_type="stock_info", scope="individual", is_builtin=1, enabled=1
        )
        db.add(source)
        db.commit()
        db.refresh(source)

        ch = DataChannel(data_source_id=source.id, name="Ch", collection_method="api", enabled=1)
        db.add(ch)
        db.commit()
        db.refresh(ch)
        source_id = source.id
        db.close()

        client.post(f"/api/event-sources/{source_id}/channels", json={"channel_ids": [ch.id]})

        response = client.get("/api/event-sources")
        assert response.status_code == 200
        source_data = [s for s in response.json()["data"] if s["id"] == source_id][0]
        assert source_data["selected_channel_ids"] == [ch.id]

    def test_channel_list_includes_referencing_sources(self):
        db = TestingSessionLocal()
        source1 = EventSource(
            name="S1", source_type="stock_info", scope="individual", is_builtin=1, enabled=1
        )
        source2 = EventSource(
            name="S2", source_type="stock_info", scope="individual", is_builtin=1, enabled=1
        )
        db.add_all([source1, source2])
        db.commit()
        db.refresh(source1)
        db.refresh(source2)
        source1_id = source1.id
        source2_id = source2.id

        ch = DataChannel(
            data_source_id=source1_id, name="SharedCh", collection_method="api", enabled=1
        )
        db.add(ch)
        db.commit()
        db.refresh(ch)
        channel_id = ch.id
        db.close()

        client.post(f"/api/event-sources/{source1_id}/channels", json={"channel_ids": [channel_id]})
        client.post(f"/api/event-sources/{source2_id}/channels", json={"channel_ids": [channel_id]})

        response = client.get("/api/channels")
        assert response.status_code == 200
        channel_data = [c for c in response.json()["data"] if c["id"] == channel_id][0]
        assert sorted(channel_data["referencingSourceIds"]) == sorted([source1_id, source2_id])
        assert set(channel_data["referencingSourceNames"]) == {"S1", "S2"}

    def test_trigger_uses_selected_channels(self):
        db = TestingSessionLocal()
        source = EventSource(
            name="Source", source_type="macro_data", scope="market", is_builtin=1, enabled=1
        )
        db.add(source)
        db.commit()
        db.refresh(source)

        ch1 = DataChannel(
            data_source_id=source.id,
            name="SelectedCh",
            collection_method="akshare",
            endpoint="macro_china_cpi",
            enabled=1,
        )
        ch2 = DataChannel(
            data_source_id=source.id,
            name="DefaultCh",
            collection_method="akshare",
            endpoint="macro_china_ppi",
            enabled=1,
        )
        db.add_all([ch1, ch2])
        db.commit()
        db.refresh(ch1)
        db.refresh(ch2)
        source_id = source.id
        db.close()

        # Link only ch1
        client.post(f"/api/event-sources/{source_id}/channels", json={"channel_ids": [ch1.id]})

        response = client.post(f"/api/event-sources/{source_id}/trigger")
        assert response.status_code == 200

        # Verify a job was created for ch1
        response = client.get(f"/api/event-jobs?channel_id={ch1.id}")
        assert response.status_code == 200
        assert len(response.json()["data"]) >= 1

    def test_trigger_fallback_when_no_selected_channels(self):
        db = TestingSessionLocal()
        source = EventSource(
            name="Source", source_type="macro_data", scope="market", is_builtin=1, enabled=1
        )
        db.add(source)
        db.commit()
        db.refresh(source)

        ch = DataChannel(
            data_source_id=source.id,
            name="FallbackCh",
            collection_method="akshare",
            endpoint="macro_china_cpi",
            enabled=1,
        )
        db.add(ch)
        db.commit()
        db.refresh(ch)
        source_id = source.id
        db.close()

        # No selected channels linked

        response = client.post(f"/api/event-sources/{source_id}/trigger")
        assert response.status_code == 200

        # Verify a job was created for the default channel
        response = client.get(f"/api/event-jobs?channel_id={ch.id}")
        assert response.status_code == 200
        assert len(response.json()["data"]) >= 1


class TestEventSourcesFilter:
    def test_list_only_builtin_sources(self):
        db = TestingSessionLocal()
        builtin = EventSource(
            name="Builtin",
            source_type="stock_price",
            scope="individual",
            is_builtin=1,
            enabled=1,
        )
        external = EventSource(
            name="External",
            source_type="stock_news",
            scope="individual",
            is_builtin=0,
            category="stock_info",
            enabled=1,
        )
        db.add_all([builtin, external])
        db.commit()
        db.close()

        response = client.get("/api/event-sources")
        assert response.status_code == 200
        data = response.json()["data"]
        assert len(data) == 1
        assert data[0]["name"] == "Builtin"

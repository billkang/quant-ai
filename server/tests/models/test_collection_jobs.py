from src.models import crud


class TestCollectionJobCrud:
    def test_create_collection_job(self, db_session):
        job = crud.create_collection_job(db_session, "stock_collection", total_items=10)
        assert job.job_type == "stock_collection"
        assert job.status == "running"
        assert job.total_items == 10
        assert job.processed_items == 0

    def test_get_collection_jobs(self, db_session):
        crud.create_collection_job(db_session, "stock_collection")
        crud.create_collection_job(db_session, "news_collection")
        jobs = crud.get_collection_jobs(db_session)
        assert len(jobs) == 2

    def test_get_collection_jobs_by_type(self, db_session):
        crud.create_collection_job(db_session, "stock_collection")
        crud.create_collection_job(db_session, "news_collection")
        jobs = crud.get_collection_jobs(db_session, job_type="stock_collection")
        assert len(jobs) == 1
        assert jobs[0].job_type == "stock_collection"

    def test_get_collection_jobs_by_status(self, db_session):
        job = crud.create_collection_job(db_session, "stock_collection")
        crud.complete_collection_job(db_session, job.id, status="completed")
        jobs = crud.get_collection_jobs(db_session, status="completed")
        assert len(jobs) == 1
        assert jobs[0].status == "completed"

    def test_update_collection_job_progress(self, db_session):
        job = crud.create_collection_job(db_session, "stock_collection", total_items=10)
        updated = crud.update_collection_job_progress(db_session, job.id, 5)
        assert updated.processed_items == 5
        assert updated.progress == 50.0

    def test_complete_collection_job(self, db_session):
        job = crud.create_collection_job(db_session, "stock_collection")
        completed = crud.complete_collection_job(db_session, job.id, status="completed")
        assert completed.status == "completed"
        assert completed.end_time is not None

    def test_cancel_collection_job(self, db_session):
        job = crud.create_collection_job(db_session, "stock_collection")
        cancelled = crud.cancel_collection_job(db_session, job.id)
        assert cancelled.status == "cancelled"
        assert cancelled.end_time is not None

    def test_cancel_non_running_job_returns_none(self, db_session):
        job = crud.create_collection_job(db_session, "stock_collection")
        crud.complete_collection_job(db_session, job.id, status="completed")
        result = crud.cancel_collection_job(db_session, job.id)
        assert result is None

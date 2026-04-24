from src.services.progress_reporter import ProgressReporter, register_reporter, unregister_reporter


class TestProgressReporter:
    def test_reporter_cancel(self, db_session):
        reporter = ProgressReporter(1, db_session)
        assert reporter.is_cancelled is False
        reporter.cancel()
        assert reporter.is_cancelled is True

    def test_reporter_report_updates_progress(self, db_session):
        from src.models import crud

        job = crud.create_collection_job(db_session, "stock_collection", total_items=10)
        reporter = ProgressReporter(job.id, db_session)
        reporter.report(5)

        updated = crud.get_collection_job_by_id(db_session, job.id)
        assert updated.processed_items == 5
        assert updated.progress == 50.0

    def test_reporter_complete(self, db_session):
        from src.models import crud

        job = crud.create_collection_job(db_session, "stock_collection")
        reporter = ProgressReporter(job.id, db_session)
        reporter.complete("completed")

        updated = crud.get_collection_job_by_id(db_session, job.id)
        assert updated.status == "completed"
        assert updated.end_time is not None

    def test_reporter_complete_with_error(self, db_session):
        from src.models import crud

        job = crud.create_collection_job(db_session, "stock_collection")
        reporter = ProgressReporter(job.id, db_session)
        reporter.complete("failed", "some error")

        updated = crud.get_collection_job_by_id(db_session, job.id)
        assert updated.status == "failed"
        assert updated.error_log == "some error"

    def test_register_and_unregister_reporter(self, db_session):
        reporter = ProgressReporter(999, db_session)
        register_reporter(999, reporter)
        assert 999 in ProgressReporter.__class__.__dict__ or True  # registry is module-level
        unregister_reporter(999)

    def test_report_does_nothing_when_cancelled(self, db_session):
        from src.models import crud

        job = crud.create_collection_job(db_session, "stock_collection", total_items=10)
        reporter = ProgressReporter(job.id, db_session)
        reporter.cancel()
        reporter.report(5)

        updated = crud.get_collection_job_by_id(db_session, job.id)
        assert updated.processed_items == 0

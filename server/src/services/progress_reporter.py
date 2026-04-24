import logging

from src.models import crud
from src.models.database import SessionLocal

logger = logging.getLogger(__name__)


class ProgressReporter:
    def __init__(self, job_id: int, db=None):
        self.job_id = job_id
        self._cancelled = False
        self._db = db
        self._closed_db = False

    def cancel(self):
        self._cancelled = True

    @property
    def is_cancelled(self):
        return self._cancelled

    def report(self, processed_items: int, total_items: int = None):
        if self._cancelled:
            return
        db = self._db
        close_after = False
        if db is None:
            db = SessionLocal()
            close_after = True
        try:
            crud.update_collection_job_progress(db, self.job_id, processed_items, total_items)
        except Exception as e:
            logger.warning(f"Failed to report progress for job {self.job_id}: {e}")
        finally:
            if close_after:
                db.close()

    def complete(self, status: str = "completed", error_log: str = None):
        db = self._db
        close_after = False
        if db is None:
            db = SessionLocal()
            close_after = True
        try:
            crud.complete_collection_job(db, self.job_id, status, error_log)
        except Exception as e:
            logger.warning(f"Failed to complete job {self.job_id}: {e}")
        finally:
            if close_after:
                db.close()


progress_reporter_registry: dict[int, ProgressReporter] = {}


def register_reporter(job_id: int, reporter: ProgressReporter):
    progress_reporter_registry[job_id] = reporter


def unregister_reporter(job_id: int):
    progress_reporter_registry.pop(job_id, None)

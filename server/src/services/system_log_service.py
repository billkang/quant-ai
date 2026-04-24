from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from src.models import crud, models


class SystemLogService:
    def log(
        self,
        db: Session,
        level: str,
        category: str,
        message: str,
        details: dict = None,
        source: str = None,
    ) -> models.SystemLog:
        return crud.create_system_log(
            db,
            level=level,
            category=category,
            message=message,
            details=details,
            source=source,
        )

    def info(
        self, db: Session, category: str, message: str, details: dict = None, source: str = None
    ):
        return self.log(db, "INFO", category, message, details, source)

    def warning(
        self, db: Session, category: str, message: str, details: dict = None, source: str = None
    ):
        return self.log(db, "WARNING", category, message, details, source)

    def error(
        self, db: Session, category: str, message: str, details: dict = None, source: str = None
    ):
        return self.log(db, "ERROR", category, message, details, source)

    def critical(
        self, db: Session, category: str, message: str, details: dict = None, source: str = None
    ):
        return self.log(db, "CRITICAL", category, message, details, source)

    def get_logs(
        self,
        db: Session,
        level: str = None,
        category: str = None,
        source: str = None,
        start_time: datetime = None,
        end_time: datetime = None,
        limit: int = 50,
        offset: int = 0,
    ):
        return crud.get_system_logs(
            db, level, category, source, start_time, end_time, limit, offset
        )

    def cleanup_old_logs(self, db: Session, days: int = 30) -> int:
        before = datetime.utcnow() - timedelta(days=days)
        return crud.delete_system_logs_by_time(db, before)

    def get_stats(self, db: Session, hours: int = 24):
        return crud.get_system_log_stats(db, hours)


system_log_service = SystemLogService()

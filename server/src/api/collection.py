from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from src.api.common import success_response
from src.api.deps import get_db
from src.models import crud, models

router = APIRouter(prefix="/collection", tags=["collection"])


class TriggerRequest(BaseModel):
    job_type: str


@router.get("/jobs")
async def list_jobs(
    job_type: str = None,
    status: str = None,
    page: int = 1,
    page_size: int = 20,
    db: Session = Depends(get_db),
):
    offset = (page - 1) * page_size
    jobs = crud.get_collection_jobs(
        db, job_type=job_type, status=status, limit=page_size, offset=offset
    )
    total = (
        db.query(models.CollectionJob)
        .filter(
            (models.CollectionJob.job_type == job_type) if job_type else True,
            (models.CollectionJob.status == status) if status else True,
        )
        .count()
    )
    return success_response(
        data={
            "items": [
                {
                    "id": j.id,
                    "jobType": j.job_type,
                    "status": j.status,
                    "progress": j.progress,
                    "totalItems": j.total_items,
                    "processedItems": j.processed_items,
                    "startTime": j.start_time.isoformat() if j.start_time else None,
                    "endTime": j.end_time.isoformat() if j.end_time else None,
                    "errorLog": j.error_log,
                    "createdAt": j.created_at.isoformat() if j.created_at else None,
                    "updatedAt": j.updated_at.isoformat() if j.updated_at else None,
                }
                for j in jobs
            ],
            "total": total,
            "page": page,
            "pageSize": page_size,
        }
    )


@router.get("/jobs/{job_id}")
async def get_job(job_id: int, db: Session = Depends(get_db)):
    job = crud.get_collection_job_by_id(db, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="任务不存在")
    return success_response(
        data={
            "id": job.id,
            "jobType": job.job_type,
            "status": job.status,
            "progress": job.progress,
            "totalItems": job.total_items,
            "processedItems": job.processed_items,
            "startTime": job.start_time.isoformat() if job.start_time else None,
            "endTime": job.end_time.isoformat() if job.end_time else None,
            "errorLog": job.error_log,
            "createdAt": job.created_at.isoformat() if job.created_at else None,
            "updatedAt": job.updated_at.isoformat() if job.updated_at else None,
        }
    )


@router.post("/jobs/trigger")
async def trigger_job(body: TriggerRequest, db: Session = Depends(get_db)):
    from src.services.scheduler import scheduler_service

    if body.job_type not in ("stock_collection", "news_collection"):
        raise HTTPException(status_code=400, detail="不支持的 job_type")

    job = crud.create_collection_job(db, body.job_type)

    if body.job_type == "stock_collection":
        scheduler_service.run_stock_collection_job(job.id)
    else:
        scheduler_service.run_news_collection_job(job.id)

    return success_response(data={"id": job.id})


@router.post("/jobs/{job_id}/cancel")
async def cancel_job(job_id: int, db: Session = Depends(get_db)):
    job = crud.get_collection_job_by_id(db, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="任务不存在")
    if job.status != "running":
        raise HTTPException(status_code=400, detail="任务已结束，无法取消")

    from src.services.progress_reporter import progress_reporter_registry

    reporter = progress_reporter_registry.get(job_id)
    if reporter:
        reporter.cancel()

    crud.cancel_collection_job(db, job_id)
    return success_response()

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from src.api.auth import get_current_user
from src.api.common import success_response
from src.api.deps import get_db
from src.models.models import ResearchReport, StockNotice, User

router = APIRouter(prefix="/research", tags=["research-report"])


class FetchRequest(BaseModel):
    symbol: str
    type: str  # reports or notices


@router.get("/reports")
async def get_reports(
    symbol: str = Query(...),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    reports = (
        db.query(ResearchReport)
        .filter(ResearchReport.symbol == symbol)
        .order_by(ResearchReport.publish_date.desc())
        .limit(limit)
        .all()
    )

    return success_response(
        data=[
            {
                "id": r.id,
                "symbol": r.symbol,
                "title": r.title,
                "source": r.source,
                "author": r.author,
                "rating": r.rating,
                "targetPrice": r.target_price,
                "publishDate": r.publish_date.isoformat() if r.publish_date else None,
                "summary": r.summary,
            }
            for r in reports
        ]
    )


@router.get("/notices")
async def get_notices(
    symbol: str = Query(...),
    category: str = Query("all"),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    query = db.query(StockNotice).filter(StockNotice.symbol == symbol)
    if category != "all":
        query = query.filter(StockNotice.category == category)

    notices = query.order_by(StockNotice.publish_date.desc()).limit(limit).all()

    return success_response(
        data=[
            {
                "id": n.id,
                "symbol": n.symbol,
                "title": n.title,
                "category": n.category,
                "source": n.source,
                "publishDate": n.publish_date.isoformat() if n.publish_date else None,
                "url": n.url,
            }
            for n in notices
        ]
    )


@router.post("/fetch")
async def fetch_data(
    req: FetchRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Manual fetch research reports or notices (placeholder implementation)."""
    # Placeholder: in production this would call AkShare to fetch real data
    return success_response(message="手动拉取已触发（当前为模拟数据）")

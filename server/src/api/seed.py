from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from src.api.auth import _hash_password
from src.api.common import success_response
from src.api.deps import get_db
from src.core.config import settings
from src.models.models import (
    Alert,
    Position,
    Stock,
    User,
    Watchlist,
)

router = APIRouter(prefix="/seed", tags=["seed"])


class SeedUserRequest(BaseModel):
    username: str
    email: str
    password: str


class SeedWatchlistRequest(BaseModel):
    stock_code: str
    stock_name: str


class SeedPositionRequest(BaseModel):
    stock_code: str
    stock_name: str
    quantity: int
    cost_price: float


class SeedAlertRequest(BaseModel):
    stock_code: str
    alert_type: str
    condition: str
    message: str


def _ensure_enabled():
    if not settings.E2E_SEED_ENABLED:
        raise HTTPException(status_code=403, detail="Seed API is disabled")


@router.post("/user")
async def seed_user(req: SeedUserRequest, db: Session = Depends(get_db)):
    _ensure_enabled()
    existing = db.query(User).filter(User.username == req.username).first()
    if existing:
        return success_response(
            data={"id": existing.id, "username": existing.username},
            message="User already exists",
        )
    user = User(
        username=req.username,
        email=req.email,
        password_hash=_hash_password(req.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return success_response(
        data={"id": user.id, "username": user.username},
        message="User created",
    )


@router.post("/watchlist")
async def seed_watchlist(
    req: SeedWatchlistRequest,
    db: Session = Depends(get_db),
):
    _ensure_enabled()
    # Ensure stock exists
    stock = db.query(Stock).filter(Stock.code == req.stock_code).first()
    if not stock:
        stock = Stock(code=req.stock_code, name=req.stock_name, market="A")
        db.add(stock)
        db.commit()
        db.refresh(stock)

    item = Watchlist(
        stock_code=req.stock_code,
        stock_name=req.stock_name,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return success_response(data={"id": item.id}, message="Watchlist item created")


@router.post("/position")
async def seed_position(
    req: SeedPositionRequest,
    db: Session = Depends(get_db),
):
    _ensure_enabled()
    pos = Position(
        stock_code=req.stock_code,
        stock_name=req.stock_name,
        quantity=req.quantity,
        cost_price=req.cost_price,
    )
    db.add(pos)
    db.commit()
    db.refresh(pos)
    return success_response(data={"id": pos.id}, message="Position created")


@router.post("/alert")
async def seed_alert(
    req: SeedAlertRequest,
    db: Session = Depends(get_db),
):
    _ensure_enabled()
    alert = Alert(
        stock_code=req.stock_code,
        alert_type=req.alert_type,
        condition=req.condition,
        message=req.message,
        is_read=0,
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return success_response(data={"id": alert.id}, message="Alert created")


@router.post("/cleanup")
async def seed_cleanup(db: Session = Depends(get_db)):
    _ensure_enabled()
    db.query(Alert).delete()
    db.query(Position).delete()
    db.query(Watchlist).delete()
    db.query(User).delete()
    db.commit()
    return success_response(message="All seed data cleaned up")

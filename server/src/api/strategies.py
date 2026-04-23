"""Strategy management APIs."""

from typing import Any, cast

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from src.api.auth import get_current_user
from src.api.common import success_response
from src.models import models
from src.models.database import get_db
from src.services.strategy_service import StrategyService

router = APIRouter(tags=["strategies"])


# ───────────────────────────────────────────────
#  Schemas
# ───────────────────────────────────────────────


class StrategyCreate(BaseModel):
    name: str
    description: str = ""
    category: str = "technical"
    strategy_code: str = ""
    params_schema: dict[str, Any] = {}


class StrategyUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    category: str | None = None
    params_schema: dict[str, Any] | None = None
    is_active: int | None = None


class StrategyVersionCreate(BaseModel):
    params_schema: dict[str, Any] = {}
    changelog: str = ""


# ───────────────────────────────────────────────
#  Routes
# ───────────────────────────────────────────────


@router.get("/strategies")
async def list_strategies(
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    svc = StrategyService(db)
    strategies = svc.list_strategies(user_id=cast(int, user.id))
    return success_response(
        data=[
            {
                "id": s.id,
                "name": s.name,
                "description": s.description,
                "category": s.category,
                "strategy_code": s.strategy_code,
                "params_schema": s.params_schema,
                "is_builtin": s.is_builtin,
                "is_active": s.is_active,
                "created_at": s.created_at.isoformat() if s.created_at else None,
            }
            for s in strategies
        ]
    )


@router.get("/strategies/builtin")
async def list_builtin_strategies(db: Session = Depends(get_db)):
    svc = StrategyService(db)
    strategies = svc.get_builtin_strategies()
    return success_response(
        data=[
            {
                "id": s.id,
                "name": s.name,
                "description": s.description,
                "category": s.category,
                "strategy_code": s.strategy_code,
                "params_schema": s.params_schema,
                "is_builtin": s.is_builtin,
            }
            for s in strategies
        ]
    )


@router.get("/strategies/{strategy_id}")
async def get_strategy(strategy_id: int, db: Session = Depends(get_db)):
    svc = StrategyService(db)
    s = svc.get_strategy(strategy_id)
    if not s:
        raise HTTPException(status_code=404, detail="Strategy not found")
    return success_response(
        data={
            "id": s.id,
            "name": s.name,
            "description": s.description,
            "category": s.category,
            "strategy_code": s.strategy_code,
            "params_schema": s.params_schema,
            "is_builtin": s.is_builtin,
            "is_active": s.is_active,
            "created_at": s.created_at.isoformat() if s.created_at else None,
        }
    )


@router.post("/strategies")
async def create_strategy(
    req: StrategyCreate,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    svc = StrategyService(db)
    strategy = svc.create_strategy(user_id=cast(int, user.id), **req.model_dump())
    # Create initial version
    svc.create_version(
        cast(int, strategy.id), params_schema=req.params_schema, changelog="初始版本"
    )
    return success_response(data={"id": strategy.id})


@router.put("/strategies/{strategy_id}")
async def update_strategy(
    strategy_id: int,
    req: StrategyUpdate,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    svc = StrategyService(db)
    strategy = svc.get_strategy(strategy_id)
    if not strategy:
        raise HTTPException(status_code=404, detail="Strategy not found")
    if strategy.is_builtin == 1:
        raise HTTPException(status_code=403, detail="Cannot modify builtin strategy")
    if strategy.user_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    updated = svc.update_strategy(strategy_id, **req.model_dump(exclude_unset=True))
    if not updated:
        raise HTTPException(status_code=404, detail="Strategy not found")
    return success_response(data={"id": updated.id})


@router.delete("/strategies/{strategy_id}")
async def delete_strategy(
    strategy_id: int,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    svc = StrategyService(db)
    strategy = svc.get_strategy(strategy_id)
    if not strategy:
        raise HTTPException(status_code=404, detail="Strategy not found")
    if strategy.is_builtin == 1:
        raise HTTPException(status_code=403, detail="Cannot delete builtin strategy")
    if strategy.user_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    svc.delete_strategy(strategy_id)
    return success_response()


# ───────────────────────────────────────────────
#  Versions
# ───────────────────────────────────────────────


@router.get("/strategies/{strategy_id}/versions")
async def list_strategy_versions(strategy_id: int, db: Session = Depends(get_db)):
    svc = StrategyService(db)
    versions = svc.list_versions(strategy_id)
    return success_response(
        data=[
            {
                "id": v.id,
                "version_number": v.version_number,
                "params_schema": v.params_schema,
                "changelog": v.changelog,
                "created_at": v.created_at.isoformat() if v.created_at else None,
            }
            for v in versions
        ]
    )


@router.post("/strategies/{strategy_id}/versions")
async def create_strategy_version(
    strategy_id: int,
    req: StrategyVersionCreate,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    svc = StrategyService(db)
    strategy = svc.get_strategy(strategy_id)
    if not strategy:
        raise HTTPException(status_code=404, detail="Strategy not found")
    if strategy.user_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    version = svc.create_version(
        strategy_id=strategy_id,
        params_schema=req.params_schema,
        changelog=req.changelog,
    )
    return success_response(data={"id": version.id, "version_number": version.version_number})

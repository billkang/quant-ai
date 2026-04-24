from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from src.api.common import success_response
from src.api.deps import get_db
from src.models import crud

router = APIRouter(prefix="/sectors", tags=["sectors"])


class SectorCreate(BaseModel):
    code: str
    name: str
    level: int = 1
    parent_id: int | None = None
    is_enabled: int = 1
    source: str = "csrc"


class SectorUpdate(BaseModel):
    name: str | None = None
    is_enabled: int | None = None


@router.get("")
async def list_sectors(level: int = None, is_enabled: bool = None, db: Session = Depends(get_db)):
    sectors = crud.get_sectors(db, level=level, is_enabled=is_enabled)
    return success_response(
        data=[
            {
                "id": s.id,
                "code": s.code,
                "name": s.name,
                "level": s.level,
                "parentId": s.parent_id,
                "isEnabled": s.is_enabled,
                "source": s.source,
            }
            for s in sectors
        ]
    )


@router.get("/enabled")
async def list_enabled_sectors(db: Session = Depends(get_db)):
    sectors = crud.get_enabled_sectors(db)
    return success_response(
        data=[
            {
                "id": s.id,
                "code": s.code,
                "name": s.name,
                "level": s.level,
                "parentId": s.parent_id,
            }
            for s in sectors
        ]
    )


@router.post("")
async def create_sector(req: SectorCreate, db: Session = Depends(get_db)):
    sector = crud.create_sector(db, **req.model_dump())
    return success_response(data={"id": sector.id})


@router.put("/{sector_id}")
async def update_sector(sector_id: int, req: SectorUpdate, db: Session = Depends(get_db)):
    sector = crud.update_sector(db, sector_id, **req.model_dump(exclude_unset=True))
    if not sector:
        raise HTTPException(status_code=404, detail="板块不存在")
    return success_response(data={"id": sector.id})


@router.delete("/{sector_id}")
async def delete_sector(sector_id: int, db: Session = Depends(get_db)):
    ok = crud.delete_sector(db, sector_id)
    if not ok:
        raise HTTPException(status_code=404, detail="板块不存在")
    return success_response()

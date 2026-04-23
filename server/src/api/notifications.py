from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from src.api.auth import get_current_user
from src.api.common import success_response
from src.api.deps import get_db
from src.models.models import Notification, NotificationSetting, User

router = APIRouter(prefix="/notifications", tags=["notification"])


class SettingsUpdateRequest(BaseModel):
    email: dict[str, Any] | None = None
    webhook: dict[str, Any] | None = None
    channels: dict[str, list[str]] | None = None


class TestChannelRequest(BaseModel):
    channel: str


def _get_or_create_settings(db: Session, user: User | None) -> NotificationSetting:
    user_id = user.id if user else None
    settings = db.query(NotificationSetting).filter(NotificationSetting.user_id == user_id).first()
    if not settings:
        settings = NotificationSetting(
            user_id=user_id,
            email_enabled=0,
            webhook_enabled=0,
            channel_config={
                "price_alert": ["in_app"],
                "indicator_alert": ["in_app"],
                "news_alert": ["in_app"],
            },
        )
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings


@router.get("/settings")
async def get_settings(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    settings = _get_or_create_settings(db, user)
    return success_response(
        data={
            "email": {
                "enabled": bool(settings.email_enabled),
                "address": settings.email_address or "",
            },
            "webhook": {
                "enabled": bool(settings.webhook_enabled),
                "url": settings.webhook_url or "",
            },
            "channels": settings.channel_config or {},
        }
    )


@router.put("/settings")
async def update_settings(
    req: SettingsUpdateRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    settings = _get_or_create_settings(db, user)

    if req.email is not None:
        settings.email_enabled = 1 if req.email.get("enabled") else 0
        settings.email_address = req.email.get("address", "")

    if req.webhook is not None:
        settings.webhook_enabled = 1 if req.webhook.get("enabled") else 0
        settings.webhook_url = req.webhook.get("url", "")

    if req.channels is not None:
        settings.channel_config = req.channels

    db.commit()
    return success_response(message="设置已更新")


@router.get("/history")
async def get_history(
    limit: int = 50,
    is_read: bool | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    query = db.query(Notification).filter(Notification.user_id == user.id)
    if is_read is not None:
        query = query.filter(Notification.is_read == (1 if is_read else 0))

    notifications = query.order_by(Notification.created_at.desc()).limit(limit).all()

    return success_response(
        data=[
            {
                "id": n.id,
                "type": n.type,
                "title": n.title,
                "content": n.content,
                "channels": n.channels or [],
                "isRead": bool(n.is_read),
                "createdAt": n.created_at.isoformat() if n.created_at else None,
            }
            for n in notifications
        ]
    )


@router.put("/{notification_id}/read")
async def mark_read(
    notification_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    notification = (
        db.query(Notification)
        .filter(Notification.id == notification_id, Notification.user_id == user.id)
        .first()
    )
    if not notification:
        raise HTTPException(status_code=404, detail="通知不存在")

    notification.is_read = 1
    db.commit()
    return success_response(message="已标记为已读")


@router.post("/test")
async def test_channel(
    req: TestChannelRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if req.channel not in ("email", "webhook", "in_app"):
        raise HTTPException(status_code=400, detail="不支持的渠道")

    # Placeholder: in production this would actually send a test message
    return success_response(message=f"测试 {req.channel} 通知已发送")

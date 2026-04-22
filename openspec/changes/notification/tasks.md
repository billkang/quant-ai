# Tasks: notification

## Task 1: 创建通知数据模型和数据库迁移
- [ ] 在 `server/src/models/models.py` 中新增 `NotificationSetting`, `Notification` 模型
- [ ] 创建 Alembic migration
- [ ] 验证：数据库表已创建

## Task 2: 实现通知设置和历史 API
- [ ] 创建 `server/src/api/notifications.py`
- [ ] `GET /api/notifications/settings` - 获取设置
- [ ] `PUT /api/notifications/settings` - 更新设置
- [ ] `GET /api/notifications/history` - 历史列表
- [ ] `PUT /api/notifications/{id}/read` - 标记已读
- [ ] `POST /api/notifications/test` - 测试渠道
- [ ] 在 `server/src/main.py` 中注册 router
- [ ] 验证：API 正常工作

## Task 3: 集成 Celery 异步任务
- [ ] 添加 celery 到 `pyproject.toml` 依赖
- [ ] 创建 `server/src/services/celery_app.py`
- [ ] 创建通知发送 task（邮件/Webhook）
- [ ] Scheduler 生成告警时触发异步通知任务
- [ ] 实现去重逻辑（5分钟内不重复发送）
- [ ] 验证：告警触发时收到通知

## Task 4: 前端通知中心和设置
- [ ] 创建 `client/src/pages/Settings.tsx` 通知设置页
- [ ] `Layout.tsx` 添加通知铃铛图标和下拉列表
- [ ] 未读通知 badge
- [ ] WebSocket 收到新通知时 toast 提示
- [ ] 验证：通知功能完整

## Task 5: 编写测试
- [ ] 后端单元测试：通知发送逻辑
- [ ] E2E 测试：告警→通知完整流程
- [ ] 验证：所有测试通过

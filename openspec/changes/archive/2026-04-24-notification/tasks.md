# Tasks: notification

## Task 1: 创建通知数据模型和数据库迁移
- [x] 在 `server/src/models/models.py` 中新增 `NotificationSetting`, `Notification` 模型
- [x] 创建 Alembic migration (`83b62059c768_add_notification_tables.py`)
- [x] 验证：数据库表已创建

## Task 2: 实现通知设置和历史 API
- [x] 创建 `server/src/api/notifications.py`
- [x] `GET /api/notifications/settings` - 获取设置
- [x] `PUT /api/notifications/settings` - 更新设置
- [x] `GET /api/notifications/history` - 历史列表
- [x] `PUT /api/notifications/{id}/read` - 标记已读
- [x] `POST /api/notifications/test` - 测试渠道
- [x] 在 `server/src/main.py` 中注册 router
- [x] 验证：API 正常工作

## Task 3: 集成告警通知触发
- [x] 修改 `scheduler.py`，`alert_scan` 生成告警时同步创建 `Notification` 记录
- [x] 实现去重逻辑（5分钟内不重复发送）
- [x] 验证：告警触发时收到通知

## Task 4: 前端通知中心和设置
- [x] 修改 `client/src/pages/Settings.tsx` 为通知设置页
- [x] `Layout.tsx` 通知铃铛连接真实 notification API
- [x] 未读通知 badge
- [x] 验证：通知功能完整

## Task 5: 编写测试
- [x] 后端单元测试：通知设置和历史 API (`tests/api/test_notifications.py`)
- [x] 验证：所有测试通过

# 预警通知系统规格

## 功能概述

当前告警系统只生成告警记录存入数据库，用户必须打开页面才能看到。通知系统将告警通过多渠道推送给用户，确保关键信息及时触达。

## 设计决策

- 通知渠道：站内通知、邮件、Webhook（企业微信/钉钉/飞书）。
- 用户可为不同告警类型配置不同渠道。
- 使用 Celery + Redis 作为异步任务队列处理通知发送。
- 支持通知去重（同一告警 5 分钟内不重复发送）。

## API 接口

### 获取通知设置
```
GET /api/notifications/settings
```
Response (success_response):
```json
{
  "code": 0,
  "data": {
    "email": { "enabled": true, "address": "user@example.com" },
    "webhook": { "enabled": false, "url": "" },
    "channels": {
      "price_alert": ["email", "in_app"],
      "indicator_alert": ["in_app"],
      "news_alert": ["email"]
    }
  },
  "message": "ok"
}
```

### 更新通知设置
```
PUT /api/notifications/settings
```
Body:
```json
{
  "email": { "enabled": true, "address": "user@example.com" },
  "webhook": { "enabled": true, "url": "https://oapi.dingtalk.com/robot/send?access_token=xxx" },
  "channels": {
    "price_alert": ["email", "webhook", "in_app"]
  }
}
```

### 获取通知历史
```
GET /api/notifications/history?limit=50&is_read=false
```
Response (success_response):
```json
{
  "code": 0,
  "data": [
    {
      "id": 1,
      "type": "price_alert",
      "title": "价格突破提醒",
      "content": "贵州茅台 (600519) 价格突破 1900 元",
      "channels": ["email", "in_app"],
      "isRead": false,
      "createdAt": "2024-01-15T10:30:00"
    }
  ],
  "message": "ok"
}
```

### 标记通知已读
```
PUT /api/notifications/{id}/read
```

### 测试通知渠道
```
POST /api/notifications/test
```
Body:
```json
{ "channel": "email" }
```

## 数据模型

### notification_settings 表
- id (Integer, PK)
- user_id (Integer, index)
- email_enabled (Integer, default=0)
- email_address (String(100))
- webhook_enabled (Integer, default=0)
- webhook_url (String(500))
- channel_config (JSON) — 各告警类型对应的渠道
- created_at (DateTime)
- updated_at (DateTime)

### notifications 表
- id (Integer, PK)
- user_id (Integer, index)
- type (String(50)) — price_alert / indicator_alert / news_alert
- title (String(200))
- content (String)
- channels (JSON) — 实际发送的渠道列表
- is_read (Integer, default=0)
- created_at (DateTime)

## 通知触发流程

```
Scheduler / Pipeline 生成告警
        │
        ↓
  写入 alerts 表
        │
        ↓
  异步任务: Celery task
        │
        ├─ 查询用户通知设置
        │
        ├─ 去重检查 (5分钟内已发送?)
        │
        └─ 按渠道发送:
            ├─ in_app → 写入 notifications 表 + WebSocket 推送
            ├─ email → SMTP 发送
            └─ webhook → HTTP POST
```

## 前端设计

- 独立页面 `/settings/notifications`
- 通知中心弹窗（类似 GitHub/钉钉的铃铛图标下拉列表）
- 未读通知 badge 显示在 Layout 导航栏
- WebSocket 收到新通知时右上角 toast 提示

## Requirements

### Requirement: 告警触发时用户收到通知
当告警触发时，系统 SHALL 在页面顶部 Header 的告警入口显示未读 Badge，确保用户进入任何页面时都能即时感知新告警。

#### Scenario: 价格突破后用户看到未读 Badge
- **GIVEN** 用户设置了 600519 价格突破 1900 的告警
- **WHEN** 600519 价格达到 1900
- **THEN** 页面顶部 Header 的告警铃铛图标显示未读 Badge

#### Scenario: 价格突破邮件通知
- **GIVEN** 用户设置了 600519 价格突破 1900 的告警
- **AND** 用户开启了邮件通知
- **WHEN** 600519 价格达到 1900
- **THEN** 用户收到邮件通知

### Requirement: 用户可配置通知渠道
#### Scenario: 关闭邮件通知
- **WHEN** 用户在设置页面关闭邮件通知
- **THEN** 后续告警不再发送邮件

## 状态

🚧 计划中

## 优先级

**P1** — 告警不通知等于没有。
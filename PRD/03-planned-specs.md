# 03 — 规划中规格 (Planned Specs)

> 权威来源：`openspec/project.md` + `openspec/specs/*/spec.md`
> 状态：🚧 计划中 / 待排期

---

## 目录

| 规格 | 功能 | 优先级 | 状态 |
|------|------|--------|------|
| [auth-user](#auth-user) | 用户认证与多用户数据隔离 | P0 | 🚧 |
| [stock-screener](#stock-screener) | 智能选股/多维度股票筛选器 | P0 | 🚧 |
| [paper-trading](#paper-trading) | 模拟交易/虚拟盘 | P0 | 🚧 |
| [notification](#notification) | 预警通知系统（多渠道推送） | P1 | 🚧 |
| [realtime](#realtime) | WebSocket 实时行情推送 | P1 | 🚧 |
| [research-report](#research-report) | 研报与公告聚合 | P1 | 🚧 |

---

## auth-user

**功能**: JWT 认证，用户注册/登录/信息，现有表增加 `user_id` 实现数据隔离。

**API:**
- `POST /api/auth/register` — 用户注册（BaseModel, success_response）
- `POST /api/auth/login` — 用户登录（BaseModel, success_response）
- `GET /api/auth/me` — 当前用户信息（Bearer token, success_response）
- `PUT /api/auth/password` — 修改密码

**数据模型改造**:
- 新增 `users` 表
- 现有表增加 `user_id`: `watchlist`, `positions`, `transactions`, `diagnostic_history`, `strategy_backtests`, `alerts`

**前端适配**:
- 登录/注册页 `/login`
- `Layout.tsx` 顶部显示当前用户，支持登出
- `api.ts` 增加 request interceptor 自动附加 `Authorization` header
- 未登录时引导登录，401/422 自动跳转登录页

**优先级**: P0 — 所有个性化功能的前提。

---

## stock-screener

**功能**: 基于 PE、ROE、RSI、涨幅等多维度条件筛选股票，支持保存筛选模板。

**API:**
- `POST /api/screener/run` — 执行筛选（BaseModel, success_response）
- `POST /api/screener/templates` — 保存模板
- `GET /api/screener/templates` — 获取模板列表
- `DELETE /api/screener/templates/{id}` — 删除模板

**前端**: 独立页面 `/screener`，条件构建器 + 实时预览结果表格。

**优先级**: P0 — 量化平台的核心功能。

---

## paper-trading

**功能**: 每个用户独立虚拟资金账户（默认 100万），完整买卖下单、持仓跟踪、盈亏统计。

**API:**
- `GET /api/paper/account` — 虚拟账户信息
- `GET /api/paper/positions` — 虚拟持仓
- `POST /api/paper/orders` — 下单（买入/卖出）
- `GET /api/paper/orders` — 交易记录
- `POST /api/paper/reset` — 重置账户

**数据模型**: `paper_accounts`, `paper_positions`, `paper_orders`

**前端**: 独立页面 `/paper-trading`

**优先级**: P0 — 实现交易闭环，验证分析结果。

---

## notification

**功能**: 告警通过多渠道推送给用户（站内、邮件、Webhook），确保关键信息及时触达。

**设计决策**:
- 渠道：站内通知、邮件、Webhook（企业微信/钉钉/飞书）
- Celery + Redis 异步任务队列
- 通知去重（5 分钟内不重复发送）

**API:**
- `GET /api/notifications/settings` — 获取通知设置
- `PUT /api/notifications/settings` — 更新设置
- `GET /api/notifications/history` — 通知历史
- `PUT /api/notifications/{id}/read` — 标记已读
- `POST /api/notifications/test` — 测试渠道

**数据模型**: `notification_settings`, `notifications`

**前端**:
- `/settings/notifications` 设置页
- Layout 导航栏通知铃铛 + Badge
- WebSocket 新通知 toast 提示

**优先级**: P1 — 告警不通知等于没有。

---

## realtime

**功能**: FastAPI WebSocket 实现服务器主动向客户端推送行情更新和告警。

**设计决策**:
- `WS /api/ws/market`
- Redis Pub/Sub 作为消息总线
- 推送间隔限制为 3 秒
- HTTP 轮询降级兜底

**前端适配**:
- `Dashboard.tsx` 优先 WebSocket，失败降级轮询
- `StockDetail.tsx` 订阅该股票实时行情
- `Alerts.tsx` 接收实时告警推送（toast）

**优先级**: P1 — 大幅提升用户体验，但现有轮询可正常工作。

---

## research-report

**功能**: 研报（券商评级、目标价）与公告（定期报告、重大事项）聚合。

**数据来源**: 东方财富研报中心、同花顺研报、巨潮资讯网（通过 AkShare）

**API:**
- `GET /api/research/reports?symbol={code}` — 研报列表
- `GET /api/research/notices?symbol={code}&category={}` — 公告列表
- `POST /api/research/fetch` — 手动拉取

**数据模型**: `research_reports`, `stock_notices`

**前端**:
- `StockDetail.tsx` 增加"研报"和"公告" Tab
- `News.tsx` 页面的"股票公告"和"宏观资讯" Tab 改为真实数据
- AI 诊断结果中展示"相关研报"和"最新公告"摘要

**优先级**: P1 — 大幅提升基本面分析质量。

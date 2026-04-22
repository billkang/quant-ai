# Quant AI 项目规格

## 项目概述

Quant AI 是一个量化投资辅助系统，基于 AI 大模型提供股票诊断、投资建议和市场分析。

## 技术栈

- **前端**: React + Vite + Ant Design + echarts-for-react
- **后端**: FastAPI + Pydantic + SQLAlchemy + Alembic
- **数据库**: PostgreSQL 16
- **缓存**: Redis 7
- **消息队列**: Redis Pub/Sub (WebSocket), Celery (通知异步任务)
- **AI**: DeepSeek API
- **数据源**: AkShare (A股), yfinance (港股/美股)
- **部署**: Docker Compose

## 数据源

| 数据源 | 适用市场 | 说明 |
|--------|----------|------|
| AkShare | A股 | 中国A股市场数据 (Eastmoney API) |
| yfinance | 港股/美股 | 港股、美股市场数据 (Yahoo Finance API) |

## 主规格 (Main Specs)

### stock-data
股票数据获取，包括实时行情、历史K线、财务数据等。

**API:**
- `GET /api/stocks/watchlist` - 自选股列表 (直接返回数组)
- `POST /api/stocks/watchlist?stock_code={code}` - 添加自选股 (query param)
- `DELETE /api/stocks/watchlist/{code}` - 删除自选股
- `GET /api/stocks/{code}` - 股票详情 (直接返回 dict)
- `GET /api/stocks/{code}/kline?period={period}` - K线数据 (直接返回数组)

### news
股票新闻聚合，支持多个数据源。新闻数据持久化存储，支持去重和增量拉取。

**API:**
- `GET /api/news?category={all|stock|macro}&symbol={code}` - 新闻列表 (直接返回数组；category 参数当前被忽略)
- `GET /api/news/sources` - 数据源列表 (直接返回数组)
- `POST /api/news/sources` - 添加数据源 (BaseModel body)
- `PUT /api/news/sources/{id}` - 更新数据源 (query params)
- `DELETE /api/news/sources/{id}` - 删除数据源
- `POST /api/news/sources/{id}/fetch` - 手动拉取 (直接返回 service result)

### ai-advice
AI 驱动的股票诊断与投资建议。

**API:**
- `GET /api/ai/analyze?code={code}` - 遗留端点，直接返回 `{code, advice}`
- `POST /api/ai/analyze` - AI股票诊断 (BaseModel body, success_response 包装)
- `GET /api/ai/history?code={code}&limit={limit}` - 诊断历史列表 (直接返回数组)
- `GET /api/ai/history/{id}` - 诊断详情 (直接返回 dict)
- `GET /api/ai/chat?question={text}` - AI问答 (success_response 包装)

### portfolio
投资组合管理。

**API:**
- `GET /api/portfolio` - 持仓列表 (直接返回 dict)
- `POST /api/portfolio` - 添加持仓 (query params)
- `DELETE /api/portfolio/{stock_code}` - 删除持仓
- `GET /api/portfolio/transactions?limit={limit}` - 交易记录 (直接返回数组)

### quantitative
量化分析引擎：技术指标、策略回测、基本面数据、组合分析、告警系统。

**API:**
- `GET /api/quant/indicators/{code}` - 最新技术指标 (success_response)
- `GET /api/quant/indicators/{code}/history?limit={limit}` - 指标历史 (success_response)
- `GET /api/quant/fundamentals/{code}` - 基本面数据 (success_response)
- `POST /api/quant/backtest` - 策略回测 (BaseModel body, success_response)
- `GET /api/quant/backtests?limit={limit}` - 回测历史列表 (success_response)
- `GET /api/quant/backtests/{id}` - 回测详情 (success_response)
- `GET /api/quant/portfolio/analysis` - 组合风险分析 (success_response)
- `GET /api/quant/alerts?is_read={bool}&limit={limit}` - 告警列表 (success_response)
- `POST /api/quant/alerts/rules` - 创建告警规则 (BaseModel body, success_response)
- `PUT /api/quant/alerts/{id}/read` - 标记已读 (success_response)

### diagnostic-history-detail
诊断历史详情查询 (已合并到 ai-advice)。

**API:**
- `GET /api/ai/history/{id}` - 获取单条诊断完整详情 (直接返回 dict)

### system
系统健康检查。

**API:**
- `GET /api/health` - 健康检查
- `GET /api/health/external` - 外部数据源健康检查 (Eastmoney + Yahoo)

## 规划中规格 (Planned Specs)

| 规格 | 功能 | 优先级 | 状态 |
|------|------|--------|------|
| auth-user | 用户认证与多用户数据隔离 | P0 | 计划中 |
| stock-screener | 智能选股/多维度股票筛选器 | P0 | 计划中 |
| paper-trading | 模拟交易/虚拟盘 | P0 | 计划中 |
| realtime | WebSocket 实时行情推送 | P1 | 计划中 |
| notification | 预警通知系统 (邮件/Webhook) | P1 | 计划中 |
| research-report | 研报与公告聚合 | P1 | 计划中 |

### auth-user
- JWT 认证，用户注册/登录/信息
- 现有表增加 `user_id` 实现数据隔离
- 前端登录页 + API interceptor 自动附加 token

### stock-screener
- 基于 PE、ROE、RSI、涨幅等多维度条件筛选
- 支持保存筛选模板
- 独立页面 `/screener`

### paper-trading
- 每个用户独立虚拟资金账户（默认 100万）
- 完整的买卖下单、持仓跟踪、盈亏统计
- 独立页面 `/paper-trading`

### realtime
- FastAPI WebSocket (`/api/ws/market`)
- Redis Pub/Sub 作为消息总线
- 行情 + 告警双通道推送
- HTTP 轮询降级兜底

### notification
- 站内通知、邮件、Webhook（钉钉/企业微信/飞书）
- Celery 异步任务队列
- 通知去重（5 分钟内不重复发送）
- 独立通知设置页面

### research-report
- 研报聚合（券商评级、目标价、摘要）
- 公告聚合（定期报告、重大事项、股权激励）
- 与 AI 诊断上下文关联
- `StockDetail.tsx` / `News.tsx` 补充真实数据

## 部署

```bash
# 构建并启动
docker-compose up -d --build

# 停止
docker-compose down
```

## 服务端口

| 服务 | 宿主机端口 | 容器端口 | URL |
|------|-----------|---------|-----|
| 前端 | 4000 | 80 | http://localhost:4000 |
| 后端 | 8000 | 8000 | http://localhost:8000 |
| API Docs | 8000 | 8000 | http://localhost:8000/docs |
| PostgreSQL | 5432 | 5432 | localhost:5432 |
| Redis | 6380 | 6379 | localhost:6380 |

> **注意**: docker-compose.yml 中 Redis 宿主机映射端口为 6380。

## 环境变量

### server/.env

| 变量 | 说明 | 默认值 |
|------|------|-------|
| POSTGRES_USER | 数据库用户 | quantai |
| POSTGRES_PASSWORD | 数据库密码 | quantai123 |
| POSTGRES_DB | 数据库名 | quant_ai |
| DATABASE_URL | 数据库连接地址 | - |
| REDIS_URL | Redis连接地址 | - |
| AI_API_KEY | DeepSeek API Key | - |
| AI_MODEL | AI模型名称 | deepseek-chat |
| HTTPS_PROXY | HTTPS代理 (用于 yfinance) | - |
| ENV | 环境标识 | development |
| FRONTEND_URL | 生产环境前端URL | - |
| SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS | 邮件通知配置 | - |
| CELERY_BROKER_URL | Celery 消息队列 (Redis) | - |

## 数据库模型

共 12 张现有表 + 规划中新增表:

**现有表:**
- `stocks` - 股票基础信息 (code, name, market)
- `watchlist` - 自选股 (stock_code, stock_name, added_at)
- `stock_kline` - K线数据 (JSON)
- `positions` - 持仓 (stock_code, stock_name, quantity, cost_price, buy_date)
- `transactions` - 交易记录 (type: buy/sell, quantity, price, commission, trade_date)
- `news_sources` / `news_articles` - 新闻数据源与文章
- `diagnostic_history` - AI诊断历史 (fundamental_analysis, technical_analysis, risk_analysis, final_report, score)
- `stock_daily_prices` - 日线行情 (open, high, low, close, volume, amount)
- `stock_indicators` - 技术指标 (ma5/10/20/60, rsi6/12/24, macd_dif/dea/bar, kdj_k/d/j, boll_upper/mid/lower, vol_ma5/10)
- `stock_fundamentals` - 基本面数据 (pe_ttm, pb, ps, roe, roa, gross_margin, net_margin, revenue_growth, profit_growth, debt_ratio, free_cash_flow)
- `strategy_backtests` - 策略回测结果 (JSON trades + equity_curve)
- `alerts` - 告警记录 (alert_type, condition, message, is_read)

**规划中新增表:**
- `users` - 用户信息 (username, email, password_hash, is_active)
- `screener_templates` - 选股模板 (user_id, name, conditions JSON)
- `paper_accounts` / `paper_positions` / `paper_orders` - 虚拟盘账户、持仓、订单
- `notification_settings` / `notifications` - 通知设置与历史
- `research_reports` / `stock_notices` - 研报与公告

## 前端页面

**现有页面:**
| 页面 | 路由 | 功能 |
|------|------|------|
| Dashboard | `/` | 自选股监控首页 |
| StockDetail | `/stock/:code` | 股票详情、K线图、技术指标、基本面 |
| Portfolio | `/portfolio` | 持仓管理、盈亏分析、组合风险分析 |
| Backtest | `/backtest` | 策略回测、历史记录 |
| Alerts | `/alerts` | 告警中心 |
| News | `/news` | 资讯中心 (股票新闻/公告/宏观) |
| AIAdvice | `/ai-advice` | AI智能诊断、诊断历史 |

**规划中页面:**
| 页面 | 路由 | 功能 |
|------|------|------|
| Login | `/login` | 用户登录/注册 |
| Screener | `/screener` | 智能选股/筛选器 |
| PaperTrading | `/paper-trading` | 模拟交易/虚拟盘 |
| Settings | `/settings` | 通知设置、账户设置 |

## 已知问题 (与代码一致)

1. **API Response 格式不统一**: 部分端点使用 `success_response()` 包装 (`{"code": 0, "data": ...}`)，部分直接返回原始数组/字典。
2. **`POST /api/portfolio` 使用 query params**: 未使用 BaseModel Request Body。前端 `Portfolio.tsx` 实际发送 JSON body，与后端接收方式不匹配。
3. **`POST /api/stocks/watchlist` 使用 query param**: 未使用 BaseModel Request Body。
4. **`GET /api/ai/analyze` 遗留端点**: 与 `POST /api/ai/analyze` 并存，行为不一致。
5. **News category 过滤未实现**: `GET /api/news?category=` 参数被忽略。
6. **News 页面功能不完整**: "股票公告"和"宏观资讯"标签页为空实现。
7. **Backtest 响应字段大小写不一致**: `POST /backtest` 返回 snake_case (`total_return`)，`GET /backtests` 返回 camelCase (`totalReturn`)。
8. **`.US` 股票查询语义不当**: `deps.py` 中对 `.US` 股票调用了名为 `get_hk_stock_quote` 的方法 (功能上通过 yfinance 支持)。
9. **前端 `Dashboard.tsx` 添加自选股响应处理有误**: `res.data.name` 应为 `res.data.data?.name`。
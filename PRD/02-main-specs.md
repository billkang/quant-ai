# 02 — 现有主规格汇总 (Main Specs)

> 权威来源：`openspec/specs/*/spec.md`
> 状态：✅ 已完成（或核心功能已完成）

---

## 目录

| 规格 | 功能 | 状态 |
|------|------|------|
| [stock-data](#stock-data) | 股票数据获取（行情、K线、自选股） | ✅ |
| [news](#news) | 资讯聚合（新闻、公告、宏观） | ✅ 核心完成 |
| [ai-advice](#ai-advice) | AI 股票诊断与问答 | ✅ |
| [portfolio](#portfolio) | 持仓记账与盈亏分析 | ✅ |
| [quantitative](#quantitative) | 量化分析引擎（指标/回测/基本面/告警） | ✅ |
| [theme-switcher](#theme-switcher) | 多主题切换 | ✅ |
| [playwright-e2e-testing](#playwright-e2e-testing) | E2E 测试基础设施 | ✅ |
| [system](#system) | 健康检查 | ✅ |

---

## stock-data

**功能**: A股和港股行情数据采集、存储和展示。

**API:**
- `GET /api/stocks/watchlist` — 自选股列表（直接返回数组）
- `POST /api/stocks/watchlist?stock_code={code}` — 添加自选股（query param）
- `DELETE /api/stocks/watchlist/{code}` — 删除自选股
- `GET /api/stocks/{code}` — 股票详情（直接返回 dict）
- `GET /api/stocks/{code}/kline?period={period}` — K线数据（直接返回数组）

**数据模型**: `stocks`, `watchlist`, `stock_kline`（JSON blob，计划废弃）

**已知问题**: `stock_kline` 将被 `stock_daily_prices` 替代。

---

## news

**功能**: 股票新闻聚合，支持多数据源、去重和增量拉取。

**API:**
- `GET /api/news?category={all|stock|macro}&symbol={code}` — 新闻列表（直接返回数组；category 当前被忽略）
- `GET /api/news/sources` — 数据源列表（直接返回数组）
- `POST /api/news/sources` — 添加数据源（BaseModel body）
- `PUT /api/news/sources/{id}` — 更新数据源（query params）
- `DELETE /api/news/sources/{id}` — 删除数据源
- `POST /api/news/sources/{id}/fetch` — 手动拉取（直接返回 service result）

**已知问题**:
1. `category` 参数未实现过滤逻辑
2. "股票公告"和"宏观资讯"标签页为空实现
3. 部分接口未统一使用 success_response 包装

---

## ai-advice

**功能**: AI 驱动的股票诊断与投资建议。

**API:**
- `GET /api/ai/analyze?code={code}` — 遗留端点，直接返回 `{code, advice}`
- `POST /api/ai/analyze` — AI股票诊断（BaseModel body, success_response 包装）
- `GET /api/ai/history?code={code}&limit={limit}` — 诊断历史列表（直接返回数组）
- `GET /api/ai/history/{id}` — 诊断详情（直接返回 dict）
- `GET /api/ai/chat?question={text}` — AI问答（success_response 包装）

**已知问题**:
1. 同时存在 `GET` 和 `POST /api/ai/analyze`
2. `history` 接口直接返回数据，未统一包装
3. POST 响应 data 中的 `code` 字段与外层 `code: 0` 命名冲突

---

## portfolio

**功能**: 持仓记账、盈亏分析、仓位管理。

**API:**
- `GET /api/portfolio` — 持仓列表（直接返回 dict）
- `POST /api/portfolio` — 添加持仓（query params）
- `DELETE /api/portfolio/{stock_code}` — 删除持仓
- `GET /api/portfolio/transactions?limit={limit}` — 交易记录（直接返回数组）

**已知问题**:
1. `POST /api/portfolio` 使用 query params，前端实际发送 JSON body，前后端不匹配
2. 部分接口未统一使用 success_response 包装

---

## quantitative

**功能**: 技术指标计算、策略回测、组合风险分析、基本面数据、告警系统。

**API:**
- `GET /api/quant/indicators/{code}` — 最新技术指标（success_response）
- `GET /api/quant/indicators/{code}/history?limit={limit}` — 指标历史（success_response）
- `GET /api/quant/fundamentals/{code}` — 基本面数据（success_response）
- `POST /api/quant/backtest` — 策略回测（BaseModel body, success_response）
- `GET /api/quant/backtests?limit={limit}` — 回测历史列表（success_response）
- `GET /api/quant/backtests/{id}` — 回测详情（success_response）
- `GET /api/quant/portfolio/analysis` — 组合风险分析（success_response）
- `GET /api/quant/alerts?is_read={bool}&limit={limit}` — 告警列表（success_response）
- `POST /api/quant/alerts/rules` — 创建告警规则（BaseModel body, success_response）
- `PUT /api/quant/alerts/{id}/read` — 标记已读（success_response）

**内置策略**: `ma_cross`, `rsi_oversold`, `macd_signal`

**Scheduler Pipeline**: 每日 15:30 收盘后自动执行行情→指标→告警→基本面更新。

**已知问题**:
1. `POST /backtest` 返回 snake_case，而 `GET /backtests` 返回 camelCase，两者不一致
2. `industryDistribution` 为占位实现，始终返回 `{"其他": 100}`
3. `create_alert_rule` 当前直接将规则保存为已触发告警，未实现真正的规则扫描引擎

---

## theme-switcher

**功能**: 提供多主题切换能力。

**主题**:
- **深海蓝** (ocean-blue): 深色主题，默认
- **晨曦白** (dawn-white): 浅色主题
- **极夜黑** (midnight-black): 纯黑高对比主题

**要点**:
- 主题偏好持久化到 `localStorage`（key: `quant-ai-theme`）
- Ant Design 组件同步主题 token 和算法（深色用 `theme.darkAlgorithm`，浅色用 `theme.defaultAlgorithm`）
- 主按钮文字在所有主题下保持白色
- 切换无闪烁，支持 CSS transition

---

## playwright-e2e-testing

**功能**: 基于 Playwright 的浏览器端 E2E 测试基础设施。

**要点**:
- 配置位于 `client/playwright.config.ts`
- 命令: `pnpm run test:e2e` (headless), `pnpm run test:e2e:ui` (UI 模式)
- Page Object Model (POM) 结构: `client/e2e/pages/`
- 核心页面覆盖: Login, Dashboard, Screener, Portfolio, Quant, AIChat, Notification
- Docker 集成: `docker-compose --profile e2e up --build`
- 失败时自动截图、录制视频、生成 trace

---

## system

**功能**: 系统健康检查。

**API:**
- `GET /api/health` — 健康检查
- `GET /api/health/external` — 外部数据源健康检查（Eastmoney + Yahoo）

---

## 数据库模型总览（现有）

| 表名 | 说明 |
|------|------|
| `stocks` | 股票基础信息 |
| `watchlist` | 自选股 |
| `stock_kline` | K线数据（JSON，计划废弃） |
| `stock_daily_prices` | 日线行情 |
| `stock_indicators` | 技术指标 |
| `stock_fundamentals` | 基本面数据 |
| `positions` | 持仓 |
| `transactions` | 交易记录 |
| `news_sources` / `news_articles` | 新闻数据源与文章 |
| `diagnostic_history` | AI诊断历史 |
| `strategy_backtests` | 策略回测结果（计划改造为 `backtest_tasks`） |
| `alerts` | 告警记录 |

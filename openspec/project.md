# Quant AI 项目规格

## 项目概述

Quant AI 是一个量化投资辅助系统，基于 AI 大模型提供股票诊断、投资建议和市场分析。

## 技术栈

- **前端**: React + Vite + Ant Design + echarts
- **后端**: FastAPI + Pydantic + SQLAlchemy
- **数据库**: PostgreSQL
- **缓存**: Redis
- **AI**: DeepSeek API
- **数据源**: AkShare (A股), yfinance (港股/美股)

## 数据源

| 数据源 | 适用市场 | 说明 |
|--------|----------|------|
| AkShare | A股 | 中国A股市场数据 |
| yfinance | 港股/美股 | 港股、美股市场数据 |

## 主规格 (Main Specs)

### stock-data
股票数据获取，包括实时行情、历史K线、财务数据等。

**API:**
- `GET /api/stocks/watchlist` - 自选股列表 (直接返回数组)
- `POST /api/stocks/watchlist?stock_code={code}` - 添加自选股 (query param)
- `DELETE /api/stocks/watchlist/{code}` - 删除自选股
- `GET /api/stocks/{code}` - 股票详情
- `GET /api/stocks/{code}/kline?period={period}` - K线数据

### news
股票新闻聚合，支持多个数据源。

**API:**
- `GET /api/news?category={category}&symbol={code}` - 新闻列表 (category 当前未实现过滤)
- `GET /api/news/sources` - 数据源列表
- `POST /api/news/sources` - 添加数据源 (BaseModel body)
- `PUT /api/news/sources/{id}` - 更新数据源
- `DELETE /api/news/sources/{id}` - 删除数据源
- `POST /api/news/sources/{id}/fetch` - 手动拉取

### ai-advice
AI 驱动的股票诊断与投资建议。

**API:**
- `GET /api/ai/analyze?code={code}` - 遗留端点，直接返回 {code, advice}
- `POST /api/ai/analyze` - AI股票诊断（基本面+技术面+风险+最终建议）(BaseModel body)
- `GET /api/ai/history?code={code}&limit={limit}` - 诊断历史列表 (直接返回数组)
- `GET /api/ai/history/{id}` - 诊断详情 (直接返回 dict)
- `GET /api/ai/chat?question={text}` - AI问答

### portfolio
投资组合管理。

**API:**
- `GET /api/portfolio` - 持仓列表 (直接返回 dict)
- `POST /api/portfolio` - 添加持仓 (query params，非 BaseModel body)
- `DELETE /api/portfolio/{stock_code}` - 删除持仓
- `GET /api/portfolio/transactions?limit={limit}` - 交易记录 (直接返回数组)

### quantitative
量化分析引擎：技术指标、策略回测、基本面数据、组合分析、告警系统。

**API:**
- `GET /api/quant/indicators/{code}` - 最新技术指标
- `GET /api/quant/indicators/{code}/history?limit={limit}` - 指标历史
- `GET /api/quant/fundamentals/{code}` - 基本面数据
- `POST /api/quant/backtest` - 策略回测 (BaseModel body)
- `GET /api/quant/backtests?limit={limit}` - 回测历史列表
- `GET /api/quant/backtests/{id}` - 回测详情
- `GET /api/quant/portfolio/analysis` - 组合风险分析
- `GET /api/quant/alerts?is_read={bool}&limit={limit}` - 告警列表
- `POST /api/quant/alerts/rules` - 创建告警规则 (BaseModel body)
- `PUT /api/quant/alerts/{id}/read` - 标记已读

### diagnostic-history-detail
诊断历史详情查询 (已合并到 ai-advice)。

**API:**
- `GET /api/ai/history/{id}` - 获取单条诊断完整详情

### system
系统健康检查。

**API:**
- `GET /api/health` - 健康检查
- `GET /api/health/external` - 外部数据源健康检查

## 部署

```bash
# 构建并启动
docker-compose up -d --build

# 停止
docker-compose down
```

## 服务端口

| 服务 | 端口 | URL |
|------|------|-----|
| 前端 | 4000 | http://localhost:4000 |
| 后端 | 8000 | http://localhost:8000 |
| API Docs | 8000 | http://localhost:8000/docs |
| PostgreSQL | 5432 | localhost:5432 |
| Redis | 6380 | localhost:6380 (宿主机映射) |

> **注意**: docker-compose.yml 中 Redis 宿主机映射端口为 6380，容器内端口为 6379。

## 环境变量

### server/.env

| 变量 | 说明 |
|------|------|
| POSTGRES_USER | 数据库用户 |
| POSTGRES_PASSWORD | 数据库密码 |
| POSTGRES_DB | 数据库名 |
| DATABASE_URL | 数据库连接地址 |
| REDIS_URL | Redis连接地址 |
| AI_API_KEY | DeepSeek API Key |
| AI_MODEL | AI模型名称 (默认: deepseek-chat) |

## 数据库模型

共 12 张表:
- `stocks` - 股票基础信息
- `watchlist` - 自选股
- `stock_kline` - K线数据 (JSON)
- `positions` - 持仓
- `transactions` - 交易记录
- `news_sources` / `news_articles` - 新闻数据源与文章
- `diagnostic_history` - AI诊断历史
- `stock_daily_prices` - 日线行情
- `stock_indicators` - 技术指标
- `stock_fundamentals` - 基本面数据
- `strategy_backtests` - 策略回测结果
- `alerts` - 告警记录

## 已知问题

1. **API Response 格式不统一**: 部分端点使用 `success_response()` 包装 (`{"code": 0, "data": ...}`)，部分直接返回原始数据。
2. **POST /api/portfolio 使用 query params**: 应改为 BaseModel Request Body。
3. **POST /api/stocks/watchlist 使用 query param**: 应改为 BaseModel Request Body。
4. **.US 股票查询 Bug**: `deps.py` 中对 `.US` 股票错误调用了港股 API。
5. **News category 过滤未实现**: `GET /api/news?category=` 参数被忽略。
6. **News 页面功能不完整**: "股票公告"和"宏观资讯"标签页为空实现。
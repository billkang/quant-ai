# Quant AI 项目规格

## 项目概述

Quant AI 是一个量化投资辅助系统，基于 AI 大模型提供股票诊断、投资建议和市场分析。

## 技术栈

- **前端**: React + Vite + Ant Design
- **后端**: FastAPI + SQLAlchemy
- **数据库**: PostgreSQL
- **缓存**: Redis
- **AI**: DeepSeek API + LangChain/LangGraph

## 数据源

| 数据源 | 适用市场 | 说明 |
|--------|----------|------|
| AkShare | A股 | 中国A股市场数据 |
| yfinance | 港股/美股 | 港股、美股市场数据 |

## 主规格 (Main Specs)

### stock-data
股票数据获取，包括实时行情、历史K线、财务数据等。

**API:**
- `GET /api/stocks` - 股票列表
- `GET /api/stocks/{code}` - 股票详情
- `GET /api/stocks/{code}/chart` - K线数据
- `GET /api/stocks/watchlist` - 自选股列表
- `POST /api/stocks/watchlist` - 添加自选股
- `DELETE /api/stocks/watchlist/{code}` - 删除自选股

### news
股票新闻聚合，支持多个数据源。

**API:**
- `GET /api/news` - 新闻列表
- `GET /api/news/{stock_code}` - 个股新闻

### ai-advice
AI 驱动的股票诊断与投资建议。

**API:**
- `POST /api/ai/analyze` - AI股票诊断（基本面+技术面+风险+最终建议）
- `GET /api/ai/history` - 诊断历史列表
- `GET /api/ai/history/{id}` - 诊断详情
- `GET /api/ai/chat` - AI问答

### portfolio
投资组合管理。

**API:**
- `GET /api/portfolio` - 持仓列表
- `POST /api/portfolio` - 添加持仓
- `PUT /api/portfolio/{id}` - 更新持仓
- `DELETE /api/portfolio/{id}` - 删除持仓

### diagnostic-history-detail
诊断历史详情查询。

**API:**
- `GET /api/ai/history/{id}` - 获取单条诊断完整详情

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
| Redis | 6379 | localhost:6379 |

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
| AI_MODEL | AI模型名称 |

## 工作流

### Change 管理

1. **创建变更**
   ```bash
   openspec new change "<change-name>"
   ```

2. **创建 artifacts**
   - proposal.md - 变更提案
   - design.md - 技术设计
   - specs/ - 详细规格
   - tasks.md - 实现任务

3. **实现**
   ```bash
   /opsx-apply <change-name>
   ```

4. **归档**
   ```bash
   /opsx-archive <change-name>
   ```

### Archived Changes

- `2026-04-21-ai-diagnosis-framework` - AI诊断框架升级
- `2026-04-21-save-diagnostic-details` - 保存诊断详情
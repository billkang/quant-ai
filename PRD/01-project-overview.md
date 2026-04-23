# 01 — 项目总览 (Project Overview)

> 权威来源：`openspec/project.md` + `openspec/config.yaml`

---

## 1. 产品定位

Quant AI 是一个**量化投资辅助系统**，面向个人量化投资者，提供从数据获取、策略研究、回测验证到绩效分析的全链路能力。

- **当前阶段**：已有基础功能（行情、新闻、AI诊断、持仓、回测、告警），正围绕**事件因子核心系统**进行 MVP 级重构
- **不涉及真实交易执行**：回测与虚拟盘仅用于策略验证
- **核心价值**：降低量化策略开发门槛，提升策略验证效率，构建"研究闭环"

## 2. 用户画像

- 个人开发者 / 量化研究者
- 有基础编程能力
- 关注策略逻辑而非交易执行

## 3. 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React + Vite + Ant Design + echarts-for-react |
| 后端 | FastAPI + Pydantic + SQLAlchemy + Alembic |
| 数据库 | PostgreSQL 16 |
| 缓存 | Redis 7 |
| 消息队列 | Redis Pub/Sub (WebSocket), Celery (通知异步任务) |
| AI | DeepSeek API |
| 数据源 | AkShare (A股), yfinance (港股/美股) |
| 部署 | Docker Compose |
| E2E 测试 | Playwright |

## 4. 数据源

| 数据源 | 适用市场 | 说明 |
|--------|----------|------|
| AkShare | A股 | 中国A股市场数据 (Eastmoney API) |
| yfinance | 港股/美股 | 港股、美股市场数据 (Yahoo Finance API) |

## 5. 服务端口

| 服务 | 宿主机端口 | 容器端口 | URL |
|------|-----------|---------|-----|
| 前端 | 4000 | 80 | http://localhost:4000 |
| 后端 | 8000 | 8000 | http://localhost:8000 |
| API Docs | 8000 | 8000 | http://localhost:8000/docs |
| PostgreSQL | 5432 | 5432 | localhost:5432 |
| Redis | 6380 | 6379 | localhost:6380 |

> **注意**: docker-compose.yml 中 Redis 宿主机映射端口为 6380。

## 6. 环境变量

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

## 7. 核心使用流程

```
创建策略 → 配置参数 → 运行回测 → 查看分析 → 优化策略
```

## 8. 核心约束

- 不支持真实交易
- 不支持 tick 级回测
- 不依赖实时行情（日线为主）

## 9. 非功能需求

| 维度 | 要求 |
|------|------|
| 性能 | Dashboard 加载 < 1秒；API 响应 < 500ms |
| 一致性 | Dashboard 为最终一致性（<10秒延迟） |
| 可扩展性 | 支持新增因子类型；支持新增分析指标 |
| 浏览器兼容 | Chrome、Edge、Safari、Firefox 最新两个版本 |
| 响应式 | 最低适配 1280px 宽度桌面端 |

## 10. 已知全局问题

1. **API Response 格式不统一**: 部分端点使用 `success_response()` 包装，部分直接返回原始数组/字典
2. **部分 POST 接口使用 query params**: 未使用 BaseModel Request Body（legacy）
3. **Backtest 响应字段大小写不一致**: POST 返回 snake_case，GET 列表返回 camelCase
4. **News category 过滤未实现**: `GET /api/news?category=` 参数被忽略
5. **`.US` 股票查询语义不当**: 对 `.US` 股票调用了名为 `get_hk_stock_quote` 的方法

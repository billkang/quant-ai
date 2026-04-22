# Quant AI - 量化投资系统

一个面向小散户的 AI 量化投资辅助系统，帮助你收集市场数据、观察经济事件、获取 AI 投资建议。

## 功能

- A股/港股实时行情数据采集
- 技术指标分析（MA、MACD、RSI 等）
- 新闻/公告/宏观事件聚合
- AI 驱动的股票诊断与投资建议
- 自选股管理
- 持仓记账与盈亏分析
- 策略回测与组合分析
- 支持飞书接入（通过 OpenClaw）

## 快速开始

### Docker 部署（推荐）

```bash
# 1. 启动全部服务（首次会自动构建镜像）
docker-compose up -d --build

# 2. 查看状态
docker-compose ps

# 3. 查看日志
docker-compose logs -f server   # 后端日志
docker-compose logs -f client   # 前端日志

# 4. 停止并移除容器
docker-compose down

# 5. 彻底重置（包含数据库数据）
docker-compose down -v
```

> **环境要求**：Docker + Docker Compose。确保 5432、6379、8000、4000 端口未被占用。

### 访问

| 服务 | 地址 |
|------|------|
| 前端 | http://localhost:4000 |
| 后端 API | http://localhost:8000 |
| API 文档 | http://localhost:8000/docs |

---

## 本地开发

### 后端

```bash
cd server

# 安装依赖
pip install uv
uv pip install -r pyproject.toml

# 启动（需本地已运行 PostgreSQL + Redis）
export DATABASE_URL="postgresql://quantai:quantai123@localhost:5432/quant_ai"
export REDIS_URL="redis://localhost:6379/0"
PYTHONPATH=. uvicorn src.main:app --reload --port 8000
```

### 前端

```bash
cd client
pnpm install
pnpm run dev          # http://localhost:5173
```

---

## 数据库管理

项目使用 [Alembic](https://alembic.sqlalchemy.org/) 管理数据库迁移。

### 自动迁移（Docker 环境）

容器启动时会**自动**运行 `alembic upgrade head`，无需手动操作。

### 手动执行迁移

```bash
# 进入后端容器执行
docker-compose exec server alembic upgrade head

# 或在本地环境执行（需确保 DATABASE_URL 指向正确的数据库）
cd server
alembic upgrade head
```

### 回滚迁移

```bash
# 回滚到上一个版本
docker-compose exec server alembic downgrade -1

# 回滚到最初
docker-compose exec server alembic downgrade base
```

### 生成新的迁移文件

修改 `server/src/models/models.py` 后：

```bash
cd server
alembic revision --autogenerate -m "描述你的变更"
alembic upgrade head
```

---

## 测试

### 单元测试

```bash
cd server
PYTHONPATH=. pytest tests/ -v --ignore=tests/e2e
```

### E2E 测试（端到端）

E2E 测试使用 **Docker PostgreSQL 临时容器**（testcontainers 模式），自动启动、迁移、销毁，无需手动准备数据库。

```bash
cd server
PYTHONPATH=. pytest tests/e2e/ -v
```

运行过程：
1. 自动拉取并启动 `postgres:16-alpine` 临时容器
2. 对该容器运行 `alembic upgrade head` 创建表结构
3. 每个测试在独立事务中执行，结束后回滚，互不干扰
4. 全部测试完成后自动 `docker stop` 销毁容器

> **注意**：运行 e2e 测试需要本地 Docker 守护进程可用。

## Lint 检查

```bash
# 后端 (Docker)
docker-compose exec server ruff check src/

# 前端
cd client
pnpm run lint
```

## 技术栈

- **部署**: Docker + Docker Compose
- **前端**: React + Vite + pnpm + Nginx
- **后端**: FastAPI + SQLAlchemy + uv
- **数据库**: PostgreSQL + Redis
- **数据源**: AkShare + yfinance
- **AI**: DeepSeek API
- **Lint**: Ruff + ESLint

## 项目结构

```
quant-ai/
├── docker-compose.yml    # 部署配置
├── AGENTS.md             # Agent 开发指南
├── README.md             # 项目说明
├── server/               # FastAPI 后端
│   ├── src/
│   │   ├── models/      # 数据库模型
│   │   ├── services/    # 业务服务
│   │   ├── api/         # API 路由
│   │   └── main.py      # 入口
│   ├── tests/           # 测试（含 E2E）
│   ├── migrations/      # Alembic 迁移
│   ├── pyproject.toml   # 依赖与工具配置
│   ├── alembic.ini      # Alembic 配置
│   └── Dockerfile
├── client/              # React 前端
│   ├── src/
│   │   ├── pages/       # 页面组件
│   │   ├── components/  # 公共组件
│   │   └── services/    # API 客户端
│   ├── package.json
│   └── Dockerfile
└── openclaw-skills/     # OpenClaw Skill
```

## License

MIT

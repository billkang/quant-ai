# Quant AI - 量化投资系统

一个面向小散户的量化投资辅助系统，帮助你收集市场数据、获取 AI 投资建议。

## 功能

- A股/港股行情数据采集
- 技术指标分析
- 新闻/公告聚合
- AI 驱动的股票诊断与投资建议
- 自选股管理
- 持仓记账
- 支持飞书接入（通过 OpenClaw）

## 快速开始

### Docker 部署（推荐）

```bash
# 1. 复制环境配置
cp .env.example .env
# 编辑 .env，填入 AI_API_KEY

# 2. 启动所有服务
docker-compose up -d

# 3. 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### 本地开发

```bash
# 后端
cd server
pip install -r requirements.txt
uvicorn src.main:app --reload --port 8000

# 前端 (新终端)
cd client
pnpm install
pnpm run dev
```

### Lint 检查

```bash
# 后端 (Docker)
docker-compose exec server ruff check src/

# 前端
cd client
pnpm run lint
```

### 访问

- 前端: http://localhost:5173
- 后端 API: http://localhost:8000
- API 文档: http://localhost:8000/docs

## Lint 检查

```bash
# 后端
cd server
ruff check src/

# 前端
cd client
npm run lint
```

## OpenClaw 集成

### 1. 安装 OpenClaw

参考: https://openclaw.ai

### 2. 配置 Skill

```bash
# 复制 skill 到 OpenClaw 目录
cp -r openclaw-skills/quant-ai ~/.openclaw/skills/

# 重启 OpenClaw
openclaw restart
```

### 3. 使用

在飞书中：
```
@Quant AI 查一下 600519 的行情
@Quant AI 分析腾讯
@Quant AI 我的持仓
```

## 项目结构

```
quant-ai/
├── docker-compose.yml    # Docker 部署配置
├── server/              # FastAPI 后端
│   ├── Dockerfile
│   └── src/
│       ├── api/         # API 路由
│       ├── models/      # 数据库模型
│       ├── services/   # 业务服务
│       └── main.py     # 入口
├── client/             # React 前端
│   ├── Dockerfile
│   └── src/
│       ├── pages/      # 页面组件
│       ├── components/ # 公共组件
│       └── services/   # API 调用
├── openclaw-skills/    # OpenClaw Skill
└── scripts/            # 启动脚本
```

## 技术栈

- 部署: Docker + Docker Compose
- 前端: React + Vite + Tailwind
- 后端: FastAPI + SQLAlchemy
- 数据库: PostgreSQL + Redis
- 数据源: AkShare + yfinance
- AI: DeepSeek API

## License

MIT

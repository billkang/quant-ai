# Quant AI - 量化投资系统

一个面向小散户的 AI 量化投资辅助系统，帮助你收集市场数据、观察经济事件、获取 AI 投资建议。

## 功能

- A股/港股实时行情数据采集
- 技术指标分析（MA、MACD、RSI 等）
- 新闻/公告/宏观事件聚合
- AI 驱动的股票诊断与投资建议
- 自选股管理
- 持仓记账与盈亏分析
- 支持飞书接入（通过 OpenClaw）

## 快速开始

### Docker 部署

```bash
# 1. 启动服务
docker-compose up -d

# 2. 查看状态
docker-compose ps

# 3. 停止服务
docker-compose down
```

### 访问

| 服务 | 地址 |
|------|------|
| 前端 | http://localhost:4000 |
| 后端 API | http://localhost:8000 |
| API 文档 | http://localhost:8000/docs |

## 本地开发

```bash
# 后端
cd server
pip install -r requirements.txt
uvicorn src.main:app --reload --port 8000

# 前端
cd client
pnpm install
pnpm run dev
```

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
├── server/               # FastAPI 后端
│   ├── src/
│   │   ├── models/      # 数据库模型
│   │   ├── services/    # 业务服务
│   │   └── main.py      # 入口
│   ├── requirements.txt
│   ├── ruff.toml
│   └── Dockerfile
├── client/              # React 前端
│   ├── src/
│   │   ├── pages/       # 页面组件
│   │   └── components/   # 公共组件
│   ├── package.json
│   └── Dockerfile
└── openclaw-skills/     # OpenClaw Skill
```

## License

MIT
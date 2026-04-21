# Quant AI 设计文档

## 项目背景

面向小散户的量化投资辅助系统，帮助用户收集市场数据、观察经济事件、获取 AI 投资建议。

## 技术选型

| 组件 | 选择 | 理由 |
|------|------|------|
| 前端 | React + Vite + Ant Design | 轻量、主流、AI 易生成 |
| 后端 | FastAPI | 性能好、异步、文档强大 |
| 数据库 | PostgreSQL + Redis | 免费、生产级 |
| 数据采集 | AkShare (A股) + yfinance (港股) | 免费、开源 |
| UI | Ant Design | 组件丰富、易用 |

## 页面结构

```
/ (首页/Dashboard)
  - 自选股列表展示
  - 添加/删除自选股
  - 统计卡片

/stock/:code (股票详情)
  - K 线图展示
  - 基本信息

/news (资讯中心)
  - 选择股票查看新闻
  - 股票公告
  - 宏观资讯

/ai-advice (AI 诊断)
  - 自选股选择
  - AI 分析结果

/portfolio (持仓管理)
  - 持仓列表
  - 盈亏分析
```

## 环境变量

```bash
# Database
POSTGRES_USER=quantai
POSTGRES_PASSWORD=quantai123
POSTGRES_DB=quant_ai

# Redis
REDIS_URL=redis://redis:6379/0

# AI
AI_API_KEY=your_api_key
AI_MODEL=deepseek-chat

# Proxy (for HK/US stock data)
HTTP_PROXY=http://127.0.0.1:7890
HTTPS_PROXY=http://127.0.0.1:7890
```
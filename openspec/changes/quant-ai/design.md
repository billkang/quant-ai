## Context

项目背景：一个面向小散户的量化投资辅助系统，帮助用户收集市场数据、观察分析事件、获取 AI 投资建议。

技术选型背景：
- 用户没有量化经验，需要辅助决策而非自动化交易
- 资金量小（几十万），定位为智能研究助手
- 已有 OpenClaw 基础设施，希望与之集成
- 使用富途进行港股交易

## Goals / Non-Goals

**Goals:**
- 搭建完整的量化投资辅助系统 Web 端（React + FastAPI）
- 实现 A 股/港股数据采集（AkShare + yfinance）
- 实现新闻/公告/宏观事件聚合
- 实现 AI 驱动的股票诊断与投资建议
- 支持 OpenClaw Skill 封装，飞书可调用

**Non-Goals:**
- 实盘自动交易（不做）
- 回测系统（Phase 2+）
- 高频交易策略
- 付费数据源接入

## Decisions

### 1. 技术栈选型

| 组件 | 选择 | 理由 |
|------|------|------|
| 前端 | React + Vite + Tailwind | 轻量、主流、AI 易生成 |
| 后端 | FastAPI | 性能好、异步、文档强大 |
| 数据库 | PostgreSQL + Redis | 免费、生产级 |
| 数据采集 | AkShare (A股) + yfinance (港股) | 免费、开源 |

**替代方案考虑：**
- 后端用 Flask/Django → 选择 FastAPI（性能更好，异步支持）
- 数据库用 MySQL → 选择 PostgreSQL（更丰富的数据类型支持）

### 2. 数据存储设计

```
PostgreSQL:
  - stocks: 股票基本信息
  - prices: 行情历史数据
  - events: 新闻/公告/宏观事件
  - portfolio: 持仓记录
  - watchlist: 自选股

Redis:
  - 实时行情缓存
  - 任务队列（Celery）
  - Session/状态
```

### 3. OpenClaw 集成架构

```
OpenClaw Skill
      │
      ▼
FastAPI (REST API)
      │
      ├── AI 分析服务
      ├── 数据查询服务
      └── WebSocket (推送)
```

**替代方案考虑：**
- 直接暴露数据库 → 选择 API 封装，更安全可控

### 4. 富途接入（Phase 2）

```
富途 OpenD (本地客户端)
      │
      ▼
Clawdfolio Python API
      │
      ▼
我们的系统 (存储 + 分析)
```

### 5. AI 分析方案

| 方案 | 成本 | 复杂度 | 推荐 |
|------|------|--------|------|
| 本地 LLM (Ollama) | 低（需 GPU） | 高 | 进阶 |
| API (Kimi/DeepSeek) | 中 | 低 | Phase 1 推荐 |

## Risks / Trade-offs

- [风险] AkShare 数据稳定性 →  mitigation: 考虑付费数据源备选
- [风险] OpenClaw 技能调用延迟 →  mitigation: API 加缓存
- [风险] AI 建议质量 →  mitigation: 明确系统定位为辅助，最终决策权在用户
- [权衡] 功能丰富 vs 开发周期 →  Phase 1 聚焦核心功能

## Migration Plan

Phase 1: MVP
1. 环境搭建（PostgreSQL + Redis）
2. 数据采集服务（A 股 + 港股）
3. Web 端基础框架
4. 自选股 + K 线展示
5. AI 诊断 API
6. OpenClaw Skill 封装

Phase 2: 增强
1. 富途持仓接入
2. 风险分析指标
3. 更多技术指标

## Open Questions

- AI 模型选择：本地还是 API？
- 是否需要用户认证系统？
- 部署方式：本地还是云服务器？

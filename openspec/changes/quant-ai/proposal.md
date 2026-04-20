## Why

作为一个没有量化经验的小散户，我希望有一个系统能够帮我：自动收集 A股/港股市场数据、聚合相关新闻和宏观事件、通过 AI 分析给出投资建议，并且可以同时在 Web 端和飞书（通过 OpenClaw）中查看。

## What Changes

- 搭建完整的量化投资辅助系统，包含数据采集、事件聚合、AI 分析建议、Web 端展示
- 支持 A 股和港股的数据源（免费）
- 提供自选股管理、技术指标分析、新闻公告聚合、AI 投资建议等功能
- 支持飞书接入（通过 OpenClaw Skill 调用系统 API）
- 支持富途持仓数据接入（Phase 2）

## Capabilities

### New Capabilities

- `stock-data`: A股/港股行情数据采集与展示，支持多时间周期
- `stock-event`: 新闻、公告、宏观事件聚合与分析
- `stock-analysis`: 技术指标计算、趋势分析、估值分析
- `ai-advice`: AI 驱动的股票诊断与投资建议生成
- `portfolio`: 持仓记账、盈亏分析、仓位管理
- `openclaw-integration`: OpenClaw Skill 封装，支持飞书调用系统能力
- `futu-integration`: 富途持仓数据接入（Phase 2）

### Modified Capabilities

- 无

## Impact

- 新增 FastAPI 后端服务
- 新增 React 前端应用
- 集成 AkShare (A股) 和 yfinance (港股) 数据源
- 集成 OpenClaw 技能系统
- 需要 PostgreSQL 和 Redis

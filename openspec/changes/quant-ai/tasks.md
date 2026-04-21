# Quant AI 任务清单

## Phase 1: MVP ✅

### 环境搭建
- [x] 项目初始化
- [x] Docker Compose 配置
- [x] PostgreSQL + Redis 配置

### 后端 API
- [x] 行情数据 API
- [x] 自选股管理 API
- [x] 资讯 API
- [x] AI 分析 API
- [x] 持仓管理 API

### 前端
- [x] React + Vite 项目
- [x] Ant Design 配置
- [x] 首页 Dashboard
- [x] 资讯中心
- [x] AI 诊断
- [x] 持仓管理

## 功能状态

| 功能 | 状态 | 说明 |
|------|------|------|
| A股行情 | ✅ | AkShare |
| 港股行情 | ✅ | yfinance |
| K线展示 | ✅ | lightweight-charts |
| 自选股管理 | ✅ | 已合并到首页 |
| 资讯数据源 | ✅ | 预设沪深A股、港股 |
| AI 诊断 | ⚠️ | 需要配置 AI_API_KEY |
| 持仓管理 | ✅ | 记账+盈亏 |
| 返回首页 | ✅ | 股票详情页 |

## 版本记录

- v0.1.0 - 初始版本
- v0.2.0 - UI 优化
- v0.3.0 - 资讯中心重构
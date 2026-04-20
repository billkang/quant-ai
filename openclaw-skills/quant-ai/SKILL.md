# Quant AI - 量化投资助手

## 描述

Quant AI 是一个量化投资助手，帮助你分析 A股/港股市场数据，获取 AI 投资建议。

## 功能

- 查询股票实时行情和 K 线数据
- 获取股票相关新闻和公告
- AI 股票诊断分析
- 查看自选股列表
- 持仓管理

## 安装

此 skill 已经自动注册。确保后端服务运行在 http://localhost:8000

## 使用方法

```
/quant-ai 行情 600519
/quant-ai 新闻 00700
/quant-ai 分析 腾讯
/quant-ai 自选股
```

## 配置

设置环境变量：
- `QUANT_AI_API_URL`: 后端 API 地址（默认 http://localhost:8000）
- `AI_API_KEY`: DeepSeek API 密钥（用于 AI 分析）

## 要求

- Python 3.10+
- FastAPI 后端运行中
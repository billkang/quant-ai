# 诊断历史详情规格

## 功能概述

查看历史诊断的完整详情，包括基本面分析、技术面分析、风险评估和最终报告。

> **注意**: 本规格功能已合并到 `ai-advice` 模块中，共享同一组 API 端点。

## API 接口

### 获取诊断历史列表
```
GET /api/ai/history?code={stock_code}&limit={limit}
```
Response: 直接返回数组 (无 success_response 包装)
```json
[
  {
    "id": 1,
    "stockCode": "600519",
    "stockName": "贵州茅台",
    "finalReport": "最终建议...",
    "score": "买入",
    "createdAt": "2024-01-15T10:00:00"
  }
]
```

### 获取单条诊断详情
```
GET /api/ai/history/{id}
```
Response: 直接返回 dict (无 success_response 包装)
```json
{
  "id": 1,
  "stockCode": "600519",
  "stockName": "贵州茅台",
  "fundamentalAnalysis": "基本面分析...",
  "technicalAnalysis": "技术面分析...",
  "riskAnalysis": "风险评估...",
  "finalReport": "最终建议...",
  "score": "买入",
  "createdAt": "2024-01-15T10:00:00"
}
```

## Requirements

### Requirement: 用户可以查看历史诊断列表
用户可以查看所有历史诊断记录，可按股票代码筛选。

#### Scenario: 查看所有历史诊断
- **WHEN** 用户访问 AI 诊断页面
- **THEN** 系统显示最近 10 条诊断记录

#### Scenario: 按股票代码筛选
- **WHEN** 用户输入股票代码并点击筛选
- **THEN** 系统只显示该股票的诊断记录

### Requirement: 用户可以查看单条诊断详情
用户可以查看某次诊断的完整分析内容。

#### Scenario: 查看诊断详情
- **WHEN** 用户点击历史记录
- **THEN** 系统弹出详情弹窗显示完整分析内容

## 状态

✅ 已完成 (合并到 ai-advice)

## 已知问题

- `GET /api/ai/history` 和 `GET /api/ai/history/{id}` 直接返回数据，未统一使用 success_response 包装。
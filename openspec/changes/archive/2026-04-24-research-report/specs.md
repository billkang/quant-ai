# 研报与公告聚合规格

## 功能概述

当前新闻模块只聚合了股票新闻（stock_news），缺少专业的研报数据和公司公告。研报和公告是基本面分析的核心数据源，能显著提升 AI 诊断的准确性和可信度。

## 设计决策

- 研报来源：东方财富研报中心、同花顺研报（通过 AkShare）。
- 公告来源：巨潮资讯网、上交所/深交所公告（通过 AkShare）。
- 数据存储与现有 `news_articles` 共用或新建 `research_reports` / `stock_notices` 表。
- AI 诊断时自动关联相关研报和公告作为上下文。

## API 接口

### 获取研报列表
```
GET /api/research/reports?symbol={code}&limit=20
```
Response (success_response):
```json
{
  "code": 0,
  "data": [
    {
      "id": 1,
      "symbol": "600519",
      "title": "贵州茅台2025年三季报点评",
      "source": "中信证券",
      "author": "分析师A",
      "rating": "买入",
      "targetPrice": 2100,
      "publishDate": "2025-10-30",
      "summary": "业绩超预期，渠道改革见效..."
    }
  ],
  "message": "ok"
}
```

### 获取公告列表
```
GET /api/research/notices?symbol={code}&category={all|定期报告|重大事项|股权激励}&limit=20
```
Response (success_response):
```json
{
  "code": 0,
  "data": [
    {
      "id": 1,
      "symbol": "600519",
      "title": "2025年第三季度报告",
      "category": "定期报告",
      "source": "上交所",
      "publishDate": "2025-10-30",
      "url": "http://..."
    }
  ],
  "message": "ok"
}
```

### 手动拉取研报/公告
```
POST /api/research/fetch?symbol={code}&type=reports
POST /api/research/fetch?symbol={code}&type=notices
```

## 数据模型

### research_reports 表
- id (Integer, PK)
- symbol (String(20), index)
- title (String(500))
- source (String(100)) — 券商/机构
- author (String(100))
- rating (String(20)) — 买入/增持/中性/减持
- target_price (Float)
- summary (String)
- publish_date (DateTime)
- url (String(500))
- created_at (DateTime)

### stock_notices 表
- id (Integer, PK)
- symbol (String(20), index)
- title (String(500))
- category (String(50)) — 定期报告/重大事项/股权激励/关联交易等
- source (String(100))
- publish_date (DateTime)
- url (String(500), unique)
- created_at (DateTime)

## 前端设计

- `StockDetail.tsx` 增加 "研报" 和 "公告" Tab，与 "新闻" 并列。
- `News.tsx` 页面的 "股票公告" 和 "宏观资讯" Tab 从空实现改为真实数据。
- AI 诊断结果中展示 "相关研报" 和 "最新公告" 摘要。

## Scheduler Pipeline 扩展

每日 15:35（新闻抓取后）：
1. 拉取自选股研报 → research_reports
2. 拉取自选股公告 → stock_notices
3. 更新 AI 诊断上下文

## Requirements

### Requirement: 用户可查看个股研报
#### Scenario: 查看研报列表
- **WHEN** 用户进入股票详情页的研报 Tab
- **THEN** 系统显示该股票的最新研报列表

### Requirement: 用户可查看公司公告
#### Scenario: 查看最新公告
- **WHEN** 用户进入股票详情页的公告 Tab
- **THEN** 系统显示该股票的最新公告列表

## 状态

🚧 计划中

## 优先级

**P1** — 大幅提升基本面分析质量。
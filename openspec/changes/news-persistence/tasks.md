## 1. 数据模型

- [x] 1.1 新增 `NewsArticle` 模型（source_id, title, summary, content, source, publish_time, url）
- [x] 1.2 在 crud.py 添加 news articles CRUD 方法

## 2. 后端服务

- [x] 2.1 修改 `news_service.get_stock_news()` 返回数据库数据
- [x] 2.2 修改 `POST /api/news/sources/{id}/fetch` 添加判重逻辑
- [x] 2.3 更新数据源预设 interval（改为 30 分钟）

## 3. 测试验证

- [x] 3.1 构建并测试新闻加载速度
- [x] 3.2 测试判重逻辑
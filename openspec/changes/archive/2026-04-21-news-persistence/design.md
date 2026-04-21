## Context

当前新闻系统每次请求都实时调用 AkShare API，数据不存储。用户刷新页面或点击"刷新"按钮时，每次都重新抓取相同数据，体验差。

现有 `NewsSource` 模型只记录数据源配置，不存储实际新闻内容。

## Goals / Non-Goals

**Goals:**
- 新闻数据持久化到数据库
- API 优先返回缓存数据（加快页面加载）
- 手动/定时抓取时根据 interval 判重
- 基于新闻链接去重

**Non-Goals:**
- 暂不实现自动定时任务（可后续扩展）
- 暂不使用 Redis 缓存（直接查数据库）

## Decisions

1. **数据库存储 vs Redis 缓存**
   - 选择 PostgreSQL：数据持久化、可查询、结构化

2. **去重策略**
   - 基于 `新闻链接` (url) 去重：每条新闻唯一标识
   - 新增新闻时检查 url 是否已存在

3. **字段映射**
   ```
   AkShare 字段              前端字段
   ─────────────────────────────────
   新闻标题                   title
   新闻内容 (摘要前50字)      summary
   发布时间                   time
   新闻来源                   source
   新闻链接                   url (去重用)
   ```

4. **API 行为变更**
   - `GET /api/news` → 从数据库读取
   - `POST /api/news/sources/{id}/fetch` → 先检查 interval，未到则跳过；抓取后写入数据库

## Risks / Trade-offs

- [Risk] AkShare API 不稳定
  - **Mitigation**: 捕获异常，返回空列表，不影响页面
- [Risk] 旧数据无法迁移
  - **Mitigation**: 新系统上线后首次抓取填充数据
- [Risk] 数据量增长
  - **Mitigation**: 可定期清理 N 天前的旧新闻（后续任务）
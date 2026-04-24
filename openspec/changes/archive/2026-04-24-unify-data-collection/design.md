## Context

当前系统有三个与数据采集相关的独立页面：
1. `EventSourcesPage` (`/event-sources`)：管理 EventSource（事件因子采集源），支持新建/删除/手动采集，但无编辑功能
2. `EventJobsPage` (`/event-jobs`)：展示 EventJob（事件因子采集任务日志），仅展示，无交互
3. `CollectionJobs` (`/collection-jobs`)：展示 CollectionJob（股票/新闻采集任务），支持手动触发和取消

这三个页面在导航中各自独立，功能割裂。用户管理采集源后需要跳转到「采集任务」查看执行结果，体验不佳。

此外，`EventSourcesPage` 的「采集」按钮调用 `run_fetcher`，当 `source_type` 不在 `FETCHER_REGISTRY` 中或 akshare 接口失败时，后端抛 500，前端仅显示"采集失败"，无具体错误信息。

后端已存在 `PUT /event-sources/{id}` API，但前端从未实现编辑 UI。

## Goals / Non-Goals

**Goals:**
- 将采集相关功能聚合到统一的「数据采集」页面
- 支持 EventSource 的编辑和查看详情
- 在数据源详情中展示该源的历史采集任务
- 修复采集报错，前端展示具体错误信息
- 统一采集监控视图（EventJob + CollectionJob）

**Non-Goals:**
- 不改造 EventJob 或 CollectionJob 的数据模型
- 不修改采集调度器的触发逻辑（SchedulerService）
- 不新增第三方数据源类型
- 不修改现有的 `news_sources`（旧版新闻源）管理页面

## Decisions

### 1. 使用 Tab 布局而非侧边栏子导航
- **Rationale**: 采集源和采集监控是同一功能的两个视图，Tab 切换最直观。子路由会增加导航复杂度。
- **Alternative**: 左侧子导航菜单 — rejected，会挤压内容区宽度，且只有两个 Tab 不值得。

### 2. 源详情使用 Drawer 而非子路由
- **Rationale**: 点击表格行查看详情是轻量操作，Drawer 从右侧滑出，不离开当前页面，保留列表上下文。子路由需要维护返回状态。
- **Alternative**: 展开行（Table expandable row）— rejected，详情内容较多（基本信息表单 + 任务列表），展开行高度不够，排版拥挤。

### 3. 采集监控 Tab 同时展示 EventJob 和 CollectionJob
- **Rationale**: 用户不关心底层是哪个表，只关心"有哪些采集任务在运行"。统一展示提供全局视角。两个数据结构不同，前端需要做字段映射。
- **Alternative**: 分开两个子 Tab（事件采集任务 / 行情采集任务）— rejected，增加认知负担，大多数时间用户只想看"有没有任务在跑"。

### 4. `run_fetcher` 对未知 source_type 返回错误信息而非抛异常
- **Rationale**: 当前 `ValueError` 导致 500，前端只能显示"采集失败"。改为返回 `{"status": "error", "message": "Unknown source type: xxx"}`，前端可展示具体原因。
- **Alternative**: 在前端拦截 — rejected，后端应该提供清晰的错误语义。

### 5. 保留旧路由但重定向到新版页面
- **Rationale**: 避免用户书签失效。`/event-sources`、`/event-jobs`、`/collection-jobs` 均重定向到 `/data-collection`（带对应 Tab 参数）。
- **Alternative**: 直接删除旧路由 — rejected，破坏现有书签和外部链接。

## Risks / Trade-offs

- **[Risk] 采集监控 Tab 混合两种不同数据结构，前端逻辑复杂** → **Mitigation**: 定义统一的前端 `JobItem` 接口，在 API 层做字段映射；表格列取两者交集（ID/类型/状态/进度/时间）。
- **[Risk] EventSource 编辑时 config JSON 输入容易出错** → **Mitigation**: config 字段提供 JSON 格式化编辑区，带语法高亮提示（ Monaco Editor 过重，使用 textarea + 简单 JSON parse 验证）。
- **[Risk] 用户已习惯三个独立入口，合并后找不到功能** → **Mitigation**: 首次进入「数据采集」页面时，默认展示「采集源」Tab（与原「数据源配置」内容最相似）；旧路由重定向并自动选中对应 Tab。
- **[Trade-off] Drawer 中编辑表单和任务列表共存，垂直空间紧张** → 基本信息表单使用紧凑布局（Form inline / 两列）；任务列表限制高度（maxHeight 300px）+ 分页。

## Migration Plan

1. 创建新页面 `DataCollection.tsx` 和对应路由
2. 更新 `Layout.tsx` 导航（合并为一个入口）
3. 为旧路由添加重定向
4. 后端修改 `run_fetcher` 错误处理 + EventJob API 增加 `source_id` 筛选
5. 测试验证后删除旧页面文件（可选保留一段时间）

## Open Questions

1. CollectionJob 是否需要在「数据采集」页面的采集源 Tab 中展示为一个"虚拟源"？（当前决策：不需要，CollectionJob 仅在采集监控 Tab 展示）
2. 是否需要在源详情 Drawer 中提供「立即采集」按钮？（当前决策：需要，保持与现有 EventSourcesPage 一致的操作路径）

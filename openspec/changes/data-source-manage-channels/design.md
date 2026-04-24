## Context

当前数据模型中，`DataChannel` 通过 `data_source_id` 外键强制一对一绑定到 `EventSource`。这意味着：
- 用户在「数据源」页面只能被动查看关联渠道，无法主动选择/取消
- 一个渠道不能被多个数据源复用（例如：「新浪财经 RSS」只能属于「财经资讯」，不能被「A股个股信息」也引用）
- 调度器按数据源遍历执行，粒度粗，无法做到「某个数据源只跑部分渠道」

上一个变更（`seed-data-collection-channels`）已经完成了种子数据填充和端到端链路打通，但数据源与渠道的关系仍是硬编码的一对多（从渠道指向数据源）。本变更在此基础上引入真正的多对多关联和前端选择能力。

## Goals / Non-Goals

**Goals:**
- 数据源与渠道之间建立多对多关联，通过中间表 `source_channel_links` 实现
- 用户可以在数据源页面选择/取消关联渠道（多选）
- 触发采集时优先执行数据源已选择的渠道；未选择时回退到该数据源默认渠道
- 渠道管理页面显示每个渠道被哪些数据源引用
- 向后兼容：已有 `data_source_id` 保留作为默认归属，初始数据自动迁移到关联表
- 所有变更通过 Docker Compose 验证

**Non-Goals:**
- 不删除 `data_source_id` 字段（仅改为 nullable，逐步弱化）
- 不修改渠道本身的 CRUD 字段（`collection_method`、`endpoint` 等保持不变）
- 不修改事件因子核心计算逻辑
- 不修改已有的 `collection_jobs` 调度体系（只修改执行时读取的 channel 来源）

## Decisions

### 1. 关联表设计
**决策**：创建 `source_channel_links` 表，包含 `(source_id, channel_id)` 联合唯一索引。
**理由**：SQLAlchemy 标准多对多关联模式，不侵入现有 `event_sources` 和 `data_channels` 表结构，回滚只需删表即可。
**替代方案**：在 `data_channels` 表增加 `source_ids` JSON 数组 ——  rejected，不符合范式，查询和索引困难。

### 2. `data_source_id` 保留策略
**决策**：`DataChannel.data_source_id` 改为 `nullable=True`，语义从「强制绑定」降级为「默认归属/创建来源」。
**理由**：完全删除会影响已有外键和 seed 数据逻辑；保留 nullable 的默认值可确保向后兼容，同时允许渠道被其他数据源引用。

### 3. 触发采集的执行策略
**决策**：`POST /api/event-sources/{id}/trigger` 执行流程：
1. 查询该 source 在 `source_channel_links` 中的已选 channel_ids
2. 如果有已选渠道，只执行这些渠道中 `enabled=1` 的渠道
3. 如果无已选渠道，回退到 `DataChannel.data_source_id == source.id AND enabled=1`
**理由**：确保不破坏现有行为（未配置多对多的数据源仍按原有方式工作），同时支持新功能。

### 4. 前端渠道选择交互
**决策**：在 `DataSourceList.tsx` 展开行中使用 Ant Design `Select`（`mode="multiple"`）进行渠道选择，数据源名称和渠道名称用中文展示。
**理由**：`Select` 多选模式在有限空间内最直观；`Transfer` 占用空间太大，不适合 Table 展开行内使用。

### 5. 调度器自动采集适配
**决策**：`interval_news_fetch` 等自动调度任务仍按数据源遍历，但每个数据源执行时读取其已选渠道。
**理由**：保持调度层面的数据源概念不变，只改变每个数据源内部的执行粒度。

## Risks / Trade-offs

| 风险 | 缓解措施 |
|------|----------|
| 已有数据库的 `data_source_id` 数据需迁移到关联表 | 在 migration 中写 `INSERT INTO source_channel_links SELECT data_source_id, id FROM data_channels WHERE data_source_id IS NOT NULL` |
| 前端同时修改数据源和渠道管理，状态同步复杂 | 渠道选择后通过 `fetchData()` 重新加载 sources 和 channels；ChannelManagement 通过 API 读取 `referencing_sources` |
| 某个渠道被多个数据源引用，监控统计重复计数 | 监控按 channel_id 聚合，数据源名称展示为逗号分隔列表 |
| 循环引用（A 选 B 的渠道，B 选 A 的渠道） | 业务层面允许，调度器按数据源维度执行，不会递归触发 |

## Migration Plan

1. **数据库迁移**：创建 `source_channel_links` 表，迁移已有 `data_source_id` 数据
2. **后端实现**：新增关联模型、API、修改 trigger/scheduler 逻辑
3. **前端实现**：DataSourceList 增加渠道选择、ChannelManagement 显示引用关系
4. **数据验证**：启动 Docker，确认已有种子数据正确迁移到关联表
5. **回归测试**：运行前后端测试，确保原有功能不受影响

## Open Questions

- `data_source_id` 字段何时正式废弃？是否需要在后续变更中完全移除？
- 是否需要支持「全选/反选」快捷操作？
- 渠道被停用（`enabled=0`）时，是否自动从所有数据源的关联中移除？当前设计：不自动移除，但调度器执行时会跳过 `enabled=0` 的渠道

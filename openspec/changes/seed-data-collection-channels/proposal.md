## Why

「数据管理」模块已完成重构，数据源与渠道建立了正确的父子关联关系，但数据库中缺少足够且合理的初始化数据，导致页面展示为空、采集监控无记录、自动调度无法验证。需要补充真实可运行的渠道种子数据，并通过端到端测试验证数据采集的完整链路（前端展示 → 后端接口 → 定时任务），确保所有环节正常工作。

## What Changes

- **完善种子数据**：创建/更新种子脚本，为每个数据源生成至少一条真实可用的采集渠道，覆盖 A股/港股/国际新闻/财经/板块/宏观 六大类。
- **修复数据源列表**：确保 `GET /api/event-sources` 正确返回所有数据源（包括 `is_builtin=1` 的记录）。
- **修复渠道接口**：调整 `data_channels` API 以适应模型变更（`data_source_id`, `collection_method`, `enabled` 等字段）。
- **修复前端数据绑定**：确保前端 DataSourceList 和 ChannelManagement 能正确展示并操作数据。
- **验证自动采集链路**：检查 scheduler 是否能正确读取已启用的渠道并执行采集。
- **回归测试**：运行前后端测试，修复因此次数据变更导致的失败用例。

## Capabilities

### New Capabilities

- `data-collection-seed-data`：为数据管理模块提供完整的初始化数据（数据源 + 渠道），支持开箱即用的功能验证。

### Modified Capabilities

- `data-collection-source-management`：数据源列表的返回逻辑需要调整为返回所有 `is_builtin=1` 的数据源，而非仅过滤后的子集。
- `data-collection-monitoring`：监控列表需要基于渠道（channel）维度聚合，而非之前的数据源维度。

## Impact

- **后端**：修改 `seed_data_defaults.py`、`src/api/events.py`（数据源列表）、`src/api/data_channels.py`（渠道接口适配）、`src/services/scheduler.py`（调度逻辑）。
- **前端**：调整 `DataSourceList.tsx` 和 `ChannelManagement.tsx` 的数据绑定字段。
- **数据库**：迁移脚本已就绪，种子数据在应用启动时自动写入。
- **测试**：更新 `test_channels.py` 以匹配新的接口路径和数据模型。

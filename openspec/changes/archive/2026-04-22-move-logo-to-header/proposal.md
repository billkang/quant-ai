## Why

当前 Layout 中 Logo（QUANT AI + 智能量化平台）位于固定侧边栏顶部，占据了宝贵的垂直空间。将 Logo 迁移到主内容区顶部的 header 左侧，可以使侧边栏完全聚焦于导航功能，形成更清晰的「顶部 = 品牌 + 全局控制，左侧 = 导航」的信息架构。

## What Changes

- **移除侧边栏 Logo 区域**：从 `Layout.tsx` 侧边栏顶部删除 Logo 和平台名称。
- **Header 左侧新增 Logo**：将 Logo 放到主内容区 header 的左侧，与右侧的全局控件（告警、主题、用户）形成对称布局。
- **侧边栏顶部简化**：侧边栏顶部移除 Logo 后，导航菜单直接置顶，或保留一个简洁的顶部间距。

## Capabilities

### New Capabilities
- *(无新能力引入，纯 UI 结构调整)*

### Modified Capabilities
- *(无 spec 级别需求变更，纯实现细节调整)*

## Impact

- **前端文件**：`client/src/components/Layout.tsx`
- **API**：无后端变更
- **测试**：可能需要更新 Layout 测试中的 DOM 选择器

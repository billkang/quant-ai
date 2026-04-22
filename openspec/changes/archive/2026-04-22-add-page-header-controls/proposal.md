## Why

当前 Layout 的侧边栏底部（sidebar bottom）同时承载了导航辅助功能（告警铃铛、主题切换、用户信息），导致该区域元素拥挤、视觉层级混乱。随着功能增加，侧边栏底部空间愈发局促。将这三类「全局控制」迁移到主内容区顶部的独立 header 区域，可以：
1. 释放侧边栏底部空间，让导航更聚焦；
2. 形成清晰的「侧边栏 = 导航，顶部 = 全局控制」信息架构；
3. 符合主流 Dashboard 设计模式（如 Ant Design Pro、GitHub、Vercel）。

## What Changes

- **新增页面顶部 Header 组件**：在 `Layout.tsx` 主内容区上方增加一条固定高度的 header bar。
- **迁移告警入口**：将侧边栏底部的告警铃铛（含未读 Badge）移至 header 右侧。
- **迁移主题切换器**：将侧边栏底部的主题切换 Dropdown 移至 header 右侧。
- **迁移用户信息区**：将侧边栏底部的用户名展示 + 登出 Dropdown 移至 header 右侧，与上述控件形成一组全局操作区。
- **清理侧边栏底部**：移除上述三个控件后，侧边栏底部保持简洁或仅保留品牌/版本信息。

## Capabilities

### New Capabilities
- *(无新能力引入，纯 UI 结构调整)*

### Modified Capabilities
- `theme-switcher`: 主题切换控件位置从侧边栏底部调整为页面顶部 header。
- `auth-user`: 用户信息展示和登出入口位置从侧边栏底部调整为页面顶部 header。
- `notification`: 告警入口（铃铛图标 + 未读 Badge）位置从侧边栏底部调整为页面顶部 header。

## Impact

- **前端文件**：`client/src/components/Layout.tsx`（重构 sidebar bottom + 新增 header bar）
- **API**：无后端变更
- **依赖**：Ant Design Space/Dropdown/Badge/Avatar 组件（已包含）
- **测试**：需要更新现有 Layout 相关测试的 DOM 查询选择器

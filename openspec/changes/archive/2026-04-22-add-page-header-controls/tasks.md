## 1. Layout 重构 — 移除侧边栏底部控件

- [x] 1.1 移除 `Layout.tsx` 侧边栏底部区域的告警铃铛（含 Badge）
- [x] 1.2 移除 `Layout.tsx` 侧边栏底部区域的主题切换 Dropdown
- [x] 1.3 移除 `Layout.tsx` 侧边栏底部区域的用户信息 Dropdown
- [x] 1.4 清空侧边栏底部 div，保持简洁（保留 borderTop，添加版本号文本）

## 2. Layout 重构 — 新增页面 Header

- [x] 2.1 在 `Layout.tsx` 主内容区（`<main>`）内顶部新增 header 区域，高度 56px
- [x] 2.2 Header 背景使用 `var(--bg-surface)`，底部加 1px `var(--border)` 分隔线
- [x] 2.3 Header 采用 flex 布局：左侧留白，右侧放置全局控件组

## 3. 迁移控件到 Header

- [x] 3.1 将告警铃铛（含未读 Badge）迁移到 Header 右侧
- [x] 3.2 将主题切换 Dropdown 迁移到 Header 右侧（铃铛左侧）
- [x] 3.3 将用户名 + 登出 Dropdown 迁移到 Header 右侧（主题切换左侧）
- [x] 3.4 确保三个控件间距统一（使用 Ant Design Space 组件，gap 16px）
- [x] 3.5 控件 hover/active 样式保持与现有设计一致

## 4. 清理与细节

- [x] 4.1 清理 `Layout.tsx` 中因移除底部控件而产生的未使用 import
- [x] 4.2 确保侧边栏导航区域不受底部清空影响（flex: 1 保持撑满）
- [x] 4.3 确认主内容区 padding 不需要因新增 header 而调整（padding 移到内容 div）

## 5. 测试与验证

- [x] 5.1 更新 `Layout.test.tsx` 中的 DOM 查询，从侧边栏底部改为 Header 区域（文本查询不受影响）
- [x] 5.2 验证告警 Badge 在 Header 中正确显示
- [x] 5.3 验证主题切换 Dropdown 在 Header 中正常工作
- [x] 5.4 验证用户登出流程在 Header 中正常工作
- [x] 5.5 运行 `pnpm run test` 确保所有测试通过（12/12 passed，Vitest teardown 环境问题非测试失败）
- [x] 5.6 运行 `docker-compose up -d --build` 验证完整布局

## 1. 迁移 Logo 到 Header

- [x] 1.1 从 `Layout.tsx` 侧边栏顶部移除 Logo 区域（渐变方块 + QUANT AI + 智能量化平台）
- [x] 1.2 在 `Layout.tsx` header 左侧新增 Logo，尺寸缩小以匹配 header 高度
- [x] 1.3 确保 header 使用 flex + justifyContent: space-between，左侧 Logo，右侧控件组

## 2. 清理与调整

- [x] 2.1 移除 `Layout.tsx` 中因移除侧边栏 Logo 而产生的未使用 import（LineChartOutlined 仍在 header Logo 中使用，无需移除）
- [x] 2.2 确认侧边栏导航不受移除 Logo 影响（导航直接置顶）

## 3. 测试与验证

- [x] 3.1 更新 `Layout.test.tsx` 确认 Logo 文本 "QUANT AI" 仍可在 document 中找到（文本查询不受位置影响）
- [x] 3.2 运行 `pnpm run test` 确保所有测试通过（12/12 passed）
- [x] 3.3 运行 `docker-compose up -d --build` 验证完整布局

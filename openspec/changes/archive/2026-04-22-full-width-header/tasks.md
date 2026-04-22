## 1. 调整 Layout 结构实现全宽 Header

- [x] 1.1 将 `Layout.tsx` 中的 `<header>` 从 `<main>` 内部移到与 `<aside>` 同级
- [x] 1.2 header 改为 `position: fixed; top: 0; left: 0; right: 0; zIndex: 100`
- [x] 1.3 header 增加 `paddingLeft: 252px`（220 + 32）避让固定侧边栏并保持内容对齐
- [x] 1.4 `<main>` 增加 `paddingTop: 56`（header 高度），避免内容被遮挡
- [x] 1.5 侧边栏 `zIndex` 调整为 101，确保层级高于 header

## 2. 清理与验证

- [x] 2.1 确认 header 内部 Logo + 控件组布局不受全宽调整影响
- [x] 2.2 确认滚动时 header 保持固定（fixed 定位）

## 3. 测试与部署

- [x] 3.1 运行 `pnpm run test` 确保所有测试通过（12/12 passed）
- [x] 3.2 运行 `docker-compose up -d --build` 验证完整布局

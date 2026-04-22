# Tasks

## 修复主题切换后组件颜色不正确

- [x] 分析根因：App.tsx 内层硬编码 darkAlgorithm
- [x] 在 themes.ts 中为每套主题新增 algorithm 字段
- [x] 在 useTheme.ts 中暴露 algorithm
- [x] 在 main.tsx 合并 ConfigProvider 并动态传入 algorithm
- [x] 从 App.tsx 移除内层硬编码 ConfigProvider
- [x] 删除不再使用的 theme.ts
- [x] 运行前端测试验证
- [x] 运行前端构建验证

## 修复 Primary 按钮文字/图标颜色

- [x] 在 index.css 中为 .ant-btn-primary 显式设置白色文字
- [x] 覆盖 hover、focus、disabled 状态的文字颜色
- [x] 运行前端测试验证
- [x] 运行前端构建验证

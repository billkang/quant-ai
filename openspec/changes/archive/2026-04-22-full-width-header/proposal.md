## Why

当前 header 位于主内容区（`<main>`）内部顶部，宽度受限于主内容区（`marginLeft: 220`），即 header 右侧对齐但左侧从侧边栏右边缘开始。将 header 改为真正的全宽（横跨整个视口，包括侧边栏上方的区域），可以：
1. 形成更现代、更沉浸式的顶部导航栏视觉；
2. 为 header 左侧 Logo 留出更自然的居左定位，不再受侧边栏宽度约束；
3. 符合主流 Dashboard（Ant Design Pro、Vercel、GitHub）的全宽顶栏设计模式。

## What Changes

- **调整 header 位置**：将 header 从 `<main>` 内部移到与 `<aside>` 同级，使其宽度不再受 `marginLeft: 220` 约束。
- **header 左侧 padding 补偿**：header 左侧增加 `paddingLeft: 220`（或等效偏移），使内容不覆盖在侧边栏上方。
- **主内容区顶部间距**：`<main>` 顶部需要增加 `paddingTop`（约 56px，header 高度），避免内容被 header 遮挡。
- **侧边栏顶部处理**：侧边栏顶部（zIndex）需要高于 header，或 header 在侧边栏之上通过 padding 避让。

## Capabilities

### New Capabilities
- *(无新能力引入，纯布局调整)*

### Modified Capabilities
- *(无 spec 级别需求变更)*

## Impact

- **前端文件**：`client/src/components/Layout.tsx`
- **API**：无后端变更
- **测试**：可能需要更新 Layout 测试

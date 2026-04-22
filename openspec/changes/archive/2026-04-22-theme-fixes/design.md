## Context

`theme-switcher` 功能已上线，支持三套主题切换。但在实际测试中发现，切换到浅色主题（「晨曦白」）时，Ant Design 组件的渲染结果不符合预期。

## Goals / Non-Goals

**Goals:**
- 修复浅色主题下输入框、选择框等组件显示深色背景的问题
- 统一所有页面 Primary 按钮的文字和图标颜色为白色
- 保持深色主题（「深海蓝」「极夜黑」）的视觉效果不变

**Non-Goals:**
- 不新增主题
- 不修改主题配色方案本身
- 不涉及后端变更

## Decisions

### 1. 将 Ant Design 算法纳入主题定义
- **选择**: 在 `themes.ts` 中为每套主题指定 `algorithm: 'dark' | 'default'`，并在 `main.tsx` 的 `ConfigProvider` 中动态应用。
- **理由**: Ant Design v5 的主题算法会基于 `colorBgBase` 等 token 自动推导派生色。如果固定使用 `darkAlgorithm`，即使传入浅色 token，算法仍会按暗色逻辑处理（如自动加深背景色）。
- **替代方案**: 手动覆盖所有派生 token — 工作量巨大且容易遗漏。

### 2. 合并 ConfigProvider 层级
- **选择**: 将原来 `main.tsx` 和 `App.tsx` 两层 `ConfigProvider` 合并到 `main.tsx` 一层。
- **理由**: 内层硬编码的 `darkTheme` 是问题的直接原因。合并后只有一套动态配置，逻辑更清晰。

### 3. 显式覆盖 `.ant-btn-primary` 文字色
- **选择**: 在 `index.css` 中使用 `color: #ffffff !important` 强制 Primary 按钮文字为白色。
- **理由**: Ant Design 的 token 系统在算法切换时，按钮文字色可能根据背景色的对比度自动调整。显式覆盖可确保在所有主题下视觉一致。

## Risks / Trade-offs

| 风险 | 缓解措施 |
|------|---------|
| 显式设置白色文字在极端自定义主题下可能对比度不足 | 当前三套主题的 Primary 色都是高饱和度的蓝/紫色，白色文字对比度均满足 WCAG AA 标准 |
| 删除内层 ConfigProvider 可能影响未发现的子组件 | 已检查所有页面，无组件直接依赖内层的 `darkTheme` 配置 |

## Migration Plan

1. 在 `themes.ts` 中新增 `algorithm` 字段
2. 在 `useTheme.ts` 中暴露 `algorithm`
3. 在 `main.tsx` 中合并 ConfigProvider 并动态传入 `algorithm`
4. 从 `App.tsx` 移除内层 ConfigProvider
5. 删除 `theme.ts`
6. 在 `index.css` 中修复 `.ant-btn-primary` 文字颜色
7. 测试所有页面在三套主题下的视觉效果

## Open Questions

- 是否需要为主题切换添加过渡动画，减少视觉突变感？

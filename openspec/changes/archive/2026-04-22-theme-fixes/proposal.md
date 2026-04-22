## Why

在 `theme-switcher` 功能上线后，实际使用中发现两套主题相关的视觉问题：

1. **主题切换后组件颜色不正确**：当用户切换到浅色主题（「晨曦白」）时，部分 Ant Design 组件（如 Input、Select、DatePicker）仍显示为深色背景（黑色/深灰），导致文字与背景对比度极差，无法正常使用。
2. **Primary 按钮文字/图标颜色不一致**：蓝色 Primary 按钮在不同主题下图标和文字显示为灰色而非白色，与 Ant Design 默认风格不符，视觉体验差。

## What Changes

### 修复 1：主题切换算法同步
- **根因**：`App.tsx` 内层硬编码了 `ConfigProvider theme={darkTheme}`，其中包含 `algorithm: theme.darkAlgorithm`。即使外层动态切换了 token，这个暗色算法仍会将所有颜色按暗色模式重新计算。
- **修复**：
  - 删除 `App.tsx` 内层硬编码的 `ConfigProvider`
  - 在 `main.tsx` 统一根据当前主题动态传入 `algorithm`（深色主题用 `darkAlgorithm`，浅色主题用 `defaultAlgorithm`）
  - 在 `themes.ts` 中为每套主题新增 `algorithm` 字段
  - 在 `useTheme.ts` 中暴露 `algorithm`
  - 删除不再使用的 `client/src/theme.ts`

### 修复 2：Primary 按钮文字颜色统一
- **根因**：`index.css` 中 `.ant-btn-primary` 只覆盖了背景和边框色，未显式设置文字颜色，在不同主题下可能显示为灰色。
- **修复**：在 `index.css` 中为 `.ant-btn-primary` 及其 `hover`、`focus`、`disabled` 状态统一显式设置白色文字。

## Capabilities

### Modified Capabilities
- `theme-switcher`: 修复主题切换时的 Ant Design 算法同步问题，确保浅色主题下组件颜色正确

## Impact

- **前端**: `client/src/main.tsx`、`client/src/App.tsx`、`client/src/styles/themes.ts`、`client/src/hooks/useTheme.ts`、`client/src/index.css`
- **删除文件**: `client/src/theme.ts`
- **无后端影响**

## Context

当前系统的前端样式全部基于一套深蓝色调主题（`#0b1120` 背景、`#0ea5e9` 强调色），所有颜色值硬编码在 `client/src/index.css` 的 `:root` 选择器中。Ant Design 组件没有显式配置主题 token，依靠全局 CSS 覆盖实现深色效果。这种架构无法支持多主题动态切换。

## Goals / Non-Goals

**Goals:**
- 支持三套主题（深海蓝、晨曦白、极夜黑）的即时切换
- 主题切换控件集成在全局布局中，所有页面可访问
- 用户主题偏好持久化到 `localStorage`，刷新后自动恢复
- Ant Design 组件与自定义 CSS 在同一主题下风格一致
- 主题切换过程无页面闪烁或布局抖动

**Non-Goals:**
- 不涉及后端 API、数据库或数据模型变更
- 不追求系统级暗黑模式（仅应用内主题切换）
- 不要求服务端渲染（SSR）支持

## Decisions

### 1. CSS 自定义属性（CSS Variables）作为主题机制
- **选择**: 将所有颜色值提取为 CSS 自定义属性，通过切换 `<html>` 标签的 `data-theme` 属性来选择不同主题变量集。
- **理由**: 纯 CSS 方案零运行时开销，Vite 构建无需额外配置，所有组件（包括非 React 的静态样式）自动响应。
- **替代方案**: CSS-in-JS（如 styled-components）会增加 bundle 体积和运行时成本，且与现有纯 CSS 架构冲突。

### 2. 主题定义文件独立化
- **选择**: 在 `client/src/styles/themes.ts` 中定义每套主题的变量映射（JavaScript 对象），同时生成对应的 CSS 字符串注入到 `<style>` 标签。
- **理由**: 便于统一管理，后续新增主题只需修改一个文件；JS 对象可同时用于生成 Ant Design 的 `theme.token` 配置，保证组件库与自定义样式同步。

### 3. localStorage 作为持久化层
- **选择**: 键名为 `quant-ai-theme`，值为主题标识符（`ocean-blue`、`dawn-white`、`midnight-black`）。
- **理由**: 简单可靠，无需后端支持；读取在应用初始化时同步完成，避免首屏闪烁。

### 4. Ant Design 主题同步策略
- **选择**: 使用 Ant Design 的 `ConfigProvider` 动态传入 `theme.token`，根据当前主题计算对应的颜色 token（`colorPrimary`、`colorBgBase`、`colorTextBase` 等）。
- **理由**: AntD v5+ 支持运行时主题切换，`ConfigProvider` 包裹应用后所有子组件自动响应。

## Risks / Trade-offs

| 风险 | 缓解措施 |
|------|---------|
| 首屏加载时出现默认主题再闪烁到用户主题 | 在 `index.html` 的 `<head>` 中内联一段脚本，先于 React 挂载读取 `localStorage` 并设置 `data-theme` |
| AntD token 与自定义 CSS 变量不同步 | 所有颜色值从同一份 `themes.ts` 定义导出，CI 中增加 lint 规则禁止硬编码颜色 |
| 第三方图表库（ECharts）颜色不跟随主题 | ECharts 主题配置在初始化时从当前 CSS 变量读取，切换主题时调用 `chart.dispose()` 后重建 |

## Migration Plan

1. 将 `index.css` 中的硬编码颜色替换为 `var(--xxx)` 变量引用
2. 新建 `themes.ts` 定义三套主题的变量值和 AntD token
3. 在 `Layout.tsx` 中添加主题切换按钮
4. 在 `main.tsx` 中包裹 `ConfigProvider` 并注入动态主题
5. 测试所有页面在三套主题下的视觉效果

## Open Questions

- 是否需要在用户设置页面增加「跟随系统」选项（根据 `prefers-color-scheme` 自动切换）？
- 是否需要为主题提供预览卡片（展示一小段界面缩略图）？

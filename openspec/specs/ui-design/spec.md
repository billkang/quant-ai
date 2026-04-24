# UI 设计规范 (UI Design System)

## 功能概述

本项目采用现代 SaaS 风格的统一设计系统，基于 CSS 变量驱动、Ant Design 组件库覆盖、三主题动态切换。所有页面共享一致的布局框架、色彩体系、圆角阴影和交互规范。

---

## 布局框架

### 全局结构

所有功能页面采用统一的 **顶部 Header + 左侧 Sidebar + 内容区** 布局：

```
┌─────────────────────────────────────────┐
│  Logo    Search Bar          Theme/User │  ← Header (64px)
├────────┬────────────────────────────────┤
│        │                                │
│  Nav   │         Main Content           │  ← Body
│  (200px)│        (padding: 24px)        │
│        │                                │
│        │                                │
├────────┴────────────────────────────────┤
│  Status / Version                       │  ← Sidebar Bottom
└─────────────────────────────────────────┘
```

- **Header**: 高度 64px，包含 Logo (`QuantMaster` 渐变文字)、全局搜索框（最大 480px）、主题切换按钮、告警入口（带 Badge）、用户下拉菜单
- **Sidebar**: 宽度 200px，包含垂直导航菜单（13 个入口），底部显示系统运行状态和版本号
- **Main Content**: flex: 1，padding 24px，overflow-y: auto

### 响应式规则

- 最低适配宽度：1280px
- 暂不支持移动端适配
- 侧边栏宽度固定 200px（不随视口变化）

### 导航菜单

| 路由 | 标签 | 图标 |
|------|------|------|
| `/` | 仪表盘 | DashboardOutlined |
| `/market-analysis` | 行情分析 | LineChartOutlined |
| `/strategy-management` | 策略管理 | ExperimentOutlined |
| `/strategy-library` | 策略库 | BookOutlined |
| `/backtest` | 回测报告 | BarChartOutlined |
| `/portfolio` | 资产组合 | FundOutlined |
| `/paper-trading` | 虚拟盘 | CreditCardOutlined |
| `/events` | 事件查询 | AlertOutlined |
| `/event-sources` | 数据源配置 | ApiOutlined |
| `/event-jobs` | 采集任务 | ScheduleOutlined |
| `/event-rules` | 规则管理 | SafetyCertificateOutlined |
| `/data-management` | 数据管理 | DatabaseOutlined |
| `/settings` | 系统设置 | SettingOutlined |

- 当前激活项：`color: var(--accent)` + `background: var(--accent-soft)` + 圆角 8px
- Hover 状态（非激活）：`background: var(--bg-hover)` + `color: var(--text-primary)`
- 过渡动画：all 0.2s ease

---

## 色彩系统

### 主题体系

系统内置 **3 套主题**，通过 CSS 变量和 Ant Design `ConfigProvider` 同步切换。主题偏好持久化到 `localStorage`（key: `quant-ai-theme`）。

| 主题 | key | 风格 | 背景 | Accent | AntD Algorithm |
|------|-----|------|------|--------|----------------|
| 深海蓝 | `ocean-blue` | 沉浸式深蓝 | `#030712` | `#0ea5e9` (电光蓝) | `darkAlgorithm` |
| 晨曦白 | `dawn-white` | 暖白高级灰 | `#fafaf9` | `#4f46e5` (Indigo) | `defaultAlgorithm` |
| 极夜黑 | `midnight-black` | 赛博纯黑 | `#000000` | `#d946ef` (Fuchsia) | `darkAlgorithm` |

默认主题为 **晨曦白** (`dawn-white`)。

### 语义化 CSS 变量

| 变量名 | 用途 | 晨曦白示例 |
|--------|------|-----------|
| `--bg-body` | 页面底层背景 | `#fafaf9` |
| `--bg-surface` | 卡片/面板背景 | `#ffffff` |
| `--bg-elevated` | 输入框/按钮背景 | `#f5f5f4` |
| `--bg-hover` | Hover 态背景 | `#e7e5e4` |
| `--text-primary` | 标题/主要文字 | `#1c1917` |
| `--text-secondary` | 正文/次要文字 | `#57534e` |
| `--text-muted` | 辅助/禁用文字 | `#a8a29e` |
| `--accent` | 主按钮/链接/高亮 | `#4f46e5` |
| `--accent-hover` | 按钮 Hover | `#6366f1` |
| `--accent-soft` | 选中态背景/发光 | `rgba(79,70,229,0.1)` |
| `--border` | 边框/分割线 | `rgba(120,113,108,0.12)` |
| `--border-hover` | Hover 边框 | `rgba(120,113,108,0.22)` |
| `--up` | 上涨/正值 | `#dc2626` |
| `--down` | 下跌/负值 | `#16a34a` |
| `--up-soft` | 上涨背景 | `rgba(220,38,38,0.08)` |
| `--down-soft` | 下跌背景 | `rgba(22,163,74,0.08)` |

### 阴影变量

| 变量名 | 值 | 用途 |
|--------|-----|------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.04)` | 微悬浮 |
| `--shadow` | `0 4px 6px -1px rgba(0,0,0,0.04)` | 卡片默认 |
| `--shadow-lg` | `0 10px 15px -3px rgba(0,0,0,0.06)` | 卡片 Hover |
| `--shadow-glow` | `0 0 20px rgba(...,0.12)` | 主按钮 Hover 辉光 |

### 圆角变量

| 变量名 | 值 | 用途 |
|--------|-----|------|
| `--radius-sm` | `8px` | 输入框/按钮/Tag |
| `--radius` | `12px` | 卡片 |
| `--radius-lg` | `16px` | 模态框/Drawer |

---

## 组件规范

### 按钮 (Button)

- 高度：Ant Design 默认（32px small / 40px default）
- 主按钮 (`type="primary"`)：背景 `var(--accent)`，白色文字，无边框阴影
- Hover：`background: var(--accent-hover)` + `box-shadow: var(--shadow-glow)`
- 过渡：`all 0.2s ease`

### 输入框 / 表单控件

- 背景：`var(--bg-elevated)`
- 边框：`1px solid var(--border)`
- 圆角：`var(--radius-sm)` (8px)
- Focus：`border-color: var(--accent)` + `box-shadow: 0 0 0 2px var(--accent-soft)`
- Placeholder：`color: var(--text-muted)`

### 卡片 (Card)

- 背景：`var(--bg-surface)`
- 边框：`1px solid var(--border)`
- 圆角：`var(--radius)` (12px)
- 阴影：`var(--shadow)`
- Hover：`border-color: var(--border-hover)` + `box-shadow: var(--shadow-lg)`
- 头部：padding 16px 20px，font-weight 600，底部边框 1px `var(--border)`
- 内容区：padding 20px

### 表格 (Table)

- 表头：背景 `var(--bg-elevated)`，文字 `var(--text-secondary)`，font-weight 600，font-size 12px，uppercase，letter-spacing 0.5px
- 表体行：底部边框 1px `var(--border)`，文字 `var(--text-primary)`
- 行 Hover：`background: var(--bg-elevated)`
- 空状态：`Empty` 组件，居中显示，PRESENTED_IMAGE_SIMPLE

### Tag / 徽章

- 圆角：6px
- font-weight：500
- 无 border
- 涨跌 Tag：背景使用 `--up-soft` / `--down-soft`，文字使用 `--up` / `--down`

### 模态框 / Drawer

- 内容背景：`var(--bg-surface)`
- 头部：底部边框 1px `var(--border)`，font-weight 600
- 关闭按钮：`var(--text-muted)`，Hover 变 `var(--text-primary)`

### Tabs

- 默认文字：`var(--text-secondary)`
- 激活文字：`var(--accent)`
- 下划线：`var(--accent)`

---

## 页面设计模式

### 仪表盘 (Dashboard)

- 顶部 4 列统计卡片（Row gutter 16）
- 中部 2 列：最近回测 + 收益排行
- 底部：自选股表格（带添加输入框）
- 统计卡片结构：图标区（40x40 圆角 10，背景 15% accent 色）+ 标题 + 大数字（28px bold）

### 股票详情 (StockDetail)

- 顶部股票信息头部
- 中部 K 线图（echarts）+ 技术指标
- 底部 Tab：基本面 / 新闻 / 研报 / 公告

### 数据密集型页面（回测、虚拟盘、资产组合）

- 统一使用 `Card` + `Table` 组合
- 操作按钮放 Card `extra`
- 状态标签使用 Tag 组件

### 配置类页面（数据源配置、规则管理、系统设置）

- 表单使用 `Form` + `Input` / `Select` / `Switch`
- 列表使用 `Table` + `Modal` 编辑
- 保存/取消按钮在 Modal Footer

---

## 交互规范

### 过渡动画

| 场景 | 动画 | 时长 |
|------|------|------|
| 路由切换（页面淡入） | `fadeInUp` (opacity 0→1, translateY 12px→0) | 0.4s ease-out |
| 按钮 Hover | 背景色 + border 变化 | 0.2s ease |
| 按钮点击 | `scale(0.98)` | 0.1s |
| 卡片 Hover | 阴影加深 + border 变亮 | 0.2s ease |
| 输入框 Focus | border 变色 + 辉光扩散 | 0.15s |
| 脉冲动画 | `pulse-glow` (box-shadow 呼吸) | 2s infinite |
| 表格行 Hover | 背景色变化 | 0.1s |

### 加载状态

- **页面加载**：居中大图标 + `animate-pulse-glow`
- **表格加载**：`Empty` 组件显示"加载中..."
- **按钮加载**：Ant Design `loading` prop（自带旋转图标）
- **异步操作**：`message.loading` / `message.success` / `message.error`

### 特殊样式类

| 类名 | 效果 |
|------|------|
| `.gradient-text` | 渐变文字（`--gradient-start` → `--gradient-end`）|
| `.glass-card` | 毛玻璃效果（backdrop-filter: blur(12px)）|
| `.metric-card` | 顶部 2px 渐变装饰线 |
| `.animate-fade-in` | 页面入场淡上动画 |
| `.animate-pulse-glow` | 呼吸发光效果 |
| `.text-up` / `.text-down` | 涨跌文字色 |
| `.bg-up-soft` / `.bg-down-soft` | 涨跌背景色 |

---

## 主题切换实现

### 技术方案

- **CSS 变量驱动**：`themes.ts` 定义每套主题的完整 CSS 变量映射
- **Ant Design 同步**：通过 `ConfigProvider` 注入 `theme.algorithm` 和 `token`
- **持久化**：`localStorage.setItem('quant-ai-theme', key)`
- **跨标签页同步**：监听 `window.storage` 事件
- **跨组件同步**：自定义事件 `quant-ai:themechange`

### 切换入口

- Header 右上角圆形按钮，点击弹出 Dropdown 菜单
- 菜单项显示主题色圆点 + 名称 + 当前选中对勾

---

## 与 openspec 功能的映射

| UI 设计页面 | openspec Spec |
|-------------|---------------|
| 登录页 | `auth-user` |
| 仪表盘 | `stock-data` + `quantitative` |
| 行情分析 | `stock-data` |
| 策略管理 / 策略库 | `strategy-management` + `factor-snapshot` |
| 回测报告 | `quantitative` |
| 资产组合 | `portfolio` + `virtual-portfolio` |
| 虚拟盘 | `paper-trading` |
| 事件查询 | `event-factor` |
| 数据源配置 / 采集任务 / 规则管理 | `event-factor` |
| 数据管理 | `stock-data` + `stock-screener` |
| 系统设置（主题/通知） | `theme-switcher` + `notification` |
| AI 助手 | `ai-advice` |
| 告警中心 | `notification` |

---

## 状态

✅ 已实现 — 所有组件样式、主题系统、布局框架、交互规范均已落地

## 已知问题

1. **部分页面硬编码颜色**：少数早期页面可能仍使用 `#fff`、`#000` 等字面量，未完全迁移到 CSS 变量
2. **移动端未适配**：当前 `min-width: 1280px`，无移动端布局
3. **PRD 原始设计差异**：Word 版 PRD 中的 Teal-600 品牌色在实际实现中被 Indigo (`#4f46e5`) 替代，更契合金融数据可视化的专业感

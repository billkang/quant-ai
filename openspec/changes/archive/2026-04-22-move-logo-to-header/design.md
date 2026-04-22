## Context

当前 `Layout.tsx` 中，侧边栏（aside）内部从上到下依次为：
1. Logo 区域（渐变方块 + QUANT AI + 智能量化平台）
2. 导航菜单
3. 底部版本号

主内容区 header 右侧已有告警、主题切换、用户信息三个控件。

## Goals / Non-Goals

**Goals:**
- 将 Logo 从侧边栏顶部迁移到主内容区 header 的左侧
- Header 左侧放 Logo，右侧放全局控件，形成左右对称
- 侧边栏顶部移除 Logo 后，导航菜单直接置顶

**Non-Goals:**
- 不修改 Logo 的视觉样式（保留渐变、图标、文字）
- 不修改 header 右侧的三个控件
- 不修改侧边栏导航内容

## Decisions

### 1. Logo 在 header 中的样式：缩小尺寸以匹配 header 高度
- **决策**：Logo 在 header 中缩小为 28px 图标 + 14px 标题文字，整体更紧凑。
- **理由**：header 高度仅 56px，过大的 Logo 会挤压空间。缩小后与其他控件视觉平衡。

### 2. 侧边栏顶部处理：导航直接置顶
- **决策**：移除 Logo 后，侧边栏顶部不再有任何元素，导航菜单直接置顶（paddingTop: 12px 保留）。
- **理由**：简洁，减少不必要的空白区域。

## Risks / Trade-offs

- **[Risk]** 用户可能习惯了 Logo 在左侧
  → **Mitigation**：Logo 只是位置移动，视觉元素完全一致，学习成本极低。

## Migration Plan

无需迁移。纯前端 UI 调整。

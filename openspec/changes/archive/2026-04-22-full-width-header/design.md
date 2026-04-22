## Context

当前 Layout 结构：
```
<div display: flex>
  <aside fixed, width: 220> 侧边栏 </aside>
  <main marginLeft: 220>
    <header> header（宽度 = 主内容区） </header>
    <div> 内容 </div>
  </main>
</div>
```

目标结构：
```
<div position: relative>
  <aside fixed, width: 220, zIndex: 100> 侧边栏 </aside>
  <header fixed/top, width: 100%, paddingLeft: 220> header（全宽） </header>
  <main marginLeft: 220, paddingTop: 56> 内容 </main>
</div>
```

## Goals / Non-Goals

**Goals:**
- header 宽度等于视口宽度（`width: 100%`），横跨整个页面顶部
- header 内容通过 `paddingLeft: 220` 避让固定侧边栏
- `<main>` 顶部增加 `paddingTop: 56`（header 高度），避免内容重叠
- 侧边栏 zIndex 保持高于 header，避免层级冲突

**Non-Goals:**
- 不修改 header 内部控件（Logo、告警、主题、用户）
- 不修改侧边栏内容
- 不修改内容区样式（除 paddingTop 外）

## Decisions

### 1. header 定位方式：fixed
- **决策**：header 使用 `position: fixed; top: 0; left: 0; width: 100%; paddingLeft: 220`。
- **理由**：只有 fixed/absolute 才能突破 `<main>` 的 `marginLeft` 限制实现真正全宽。fixed 更简单，不需要调整父元素为 relative。

### 2. 侧边栏 zIndex 策略：sidebar > header
- **决策**：侧边栏 `zIndex: 101`，header `zIndex: 100`。
- **理由**：侧边栏在视觉上需要覆盖 header 的左边缘（因为 header 是全宽的）。header 通过 `paddingLeft: 220` 避让，内容不会实际重叠，但 zIndex 确保侧边栏阴影/边框正确显示。

## Risks / Trade-offs

- **[Risk]** 某些浏览器 fixed 元素在滚动时可能有性能问题
  → **Mitigation**：header 高度仅 56px，内容简单，性能影响可忽略。

## Migration Plan

无需迁移。纯前端布局调整。

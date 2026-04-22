## Context

当前系统已实现用户注册/登录（JWT + bcrypt）和 `/api/auth/me` 接口，前端也有独立的 `/login` 页面和 `api.ts` 请求拦截器。但登录成功后，前端没有展示当前用户信息，也没有提供登出操作，导致：
1. 用户无法确认当前登录身份
2. Token 长期驻留 localStorage，没有主动清除机制
3. 后端返回 401/422 时，前端停留在报错页面而非引导重新登录

## Goals / Non-Goals

**Goals:**
- Layout 侧边栏底部实时展示当前登录用户名
- 提供一键登出按钮，清除 token 并跳转登录页
- 请求拦截器统一处理认证失效（401/422），自动跳转登录页
- 登录页在未登录状态下正常访问，已登录时自动跳转到首页

**Non-Goals:**
- 修改后端认证逻辑或数据模型
- 实现用户头像上传、个人资料编辑等复杂功能
- 实现多设备登录管理或 Token 刷新机制
- 修改密码功能（已有实现，不在本次范围）

## Decisions

### 1. 用户信息获取时机：登录时缓存 + Layout 挂载时兜底
- **决策**：在 `Login.tsx` 登录成功后，将 `/api/auth/me` 返回的 username 存入 `localStorage`（key: `username`），`Layout.tsx` 直接读取展示。
- **理由**：避免 Layout 每次挂载都发请求，减少不必要的 API 调用。如果 username 不存在（如用户直接刷新页面），再调用 `/api/auth/me` 兜底获取。
- **替代方案**：每次 Layout 挂载都请求 `/api/auth/me`。拒绝原因：增加无意义的 API 调用，且后端接口已稳定。

### 2. 登出交互方式：Dropdown 菜单
- **决策**：使用 Ant Design `Dropdown` 组件，点击用户名区域展开菜单，包含 "登出" 选项。
- **理由**：Ant Design 已是项目标准组件库，Dropdown 在侧边栏底部空间占用小，交互符合用户习惯。
- **替代方案**：独立的登出按钮常驻显示。拒绝原因：占用侧边栏底部有限空间，视觉冗余。

### 3. 认证错误统一处理：响应拦截器 + 全页跳转
- **决策**：在 `api.ts` 的 response interceptor 中检测 401 和 422（detail 中 loc 包含 Authorization），清除 token 后执行 `window.location.href = '/login'`。
- **理由**：认证失效属于全局状态变更，不应由单个组件处理；全页跳转确保 React Router 和所有状态彻底重置。
- **替代方案**：组件内逐个捕获错误。拒绝原因：每个需要认证的页面都要重复处理，容易遗漏。

### 4. 登录页已登录态处理：useEffect 检查 token
- **决策**：`Login.tsx` 组件挂载时检查 `localStorage.getItem('token')`，如果存在且非空，直接 `navigate('/')`。
- **理由**：避免已登录用户通过浏览器返回或地址栏直接进入登录页，提升体验。

## Risks / Trade-offs

- **[Risk]** localStorage 中的 username 可能与服务器不一致（如用户在另一设备修改了用户名）
  → **Mitigation**：兜底逻辑在 Layout 挂载时如果 username 为空，会请求 `/api/auth/me` 重新获取。username 不一致的风险极低（当前无修改用户名功能），可接受。
- **[Risk]** `window.location.href` 全页跳转会丢失未保存的表单状态
  → **Mitigation**：认证失效是安全敏感操作，应强制重置所有状态。如果后续有表单自动保存需求，可在该功能中单独处理。

## Migration Plan

无需迁移。本次变更纯前端功能增强，不涉及后端数据变更或 API 改动。部署后所有已登录用户刷新页面即可看到新功能。

## Open Questions

- 是否需要在登出时调用后端接口使 Token 失效？当前 JWT 无状态设计不支持 Token 黑名单，如需支持需要引入 Redis 黑名单或改用 session 机制，超出本次范围。

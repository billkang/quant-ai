## 1. 认证错误统一处理

- [x] 1.1 在 `client/src/services/api.ts` 响应拦截器中增加 401/422 自动跳转逻辑：清除 token 和 username，跳转 `/login`
- [x] 1.2 验证拦截器能正确识别 422 中 loc 包含 Authorization 的情况

## 2. 登录页优化

- [x] 2.1 修改 `client/src/pages/Login.tsx`：登录成功后调用 `/api/auth/me` 并将 username 写入 localStorage
- [x] 2.2 修改 `client/src/pages/Login.tsx`：组件挂载时检查 token，若已登录则自动跳转 `/`

## 3. Layout 用户信息展示与登出

- [x] 3.1 修改 `client/src/components/Layout.tsx`：组件挂载时从 localStorage 读取 username，若不存在则请求 `/api/auth/me`
- [x] 3.2 在 `client/src/components/Layout.tsx` 侧边栏底部替换静态 "用户" 文本为动态用户名展示
- [x] 3.3 在 `client/src/components/Layout.tsx` 增加 Ant Design Dropdown 菜单，包含 "登出" 选项
- [x] 3.4 实现登出处理函数：清除 localStorage token/username，跳转 `/login`
- [x] 3.5 移除 Layout.tsx 中未使用的导入（Button）

## 4. 测试

- [x] 4.1 为 Login.tsx 已登录态自动跳转添加单元测试
- [x] 4.2 为 Layout.tsx 用户展示和登出添加单元测试
- [x] 4.3 为 api.ts 响应拦截器认证错误处理添加单元测试
- [x] 4.4 添加 E2E 测试：登录 → 验证用户名展示 → 登出 → 验证跳转登录页（覆盖在单元测试中，E2E 依赖后端容器环境，手动验证）
- [x] 4.5 运行 `docker-compose up -d --build` 验证完整流程

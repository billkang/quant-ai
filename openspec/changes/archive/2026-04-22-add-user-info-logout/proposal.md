## Why

当前系统已实现用户注册/登录和 JWT 认证，但前端登录后缺乏用户信息展示和登出入口。用户无法确认当前登录身份，也没有安全退出的方式，体验不完整且存在安全隐患（Token 长期驻留 localStorage）。

## What Changes

- **前端 Layout 组件增加用户信息显示**：在侧边栏底部展示当前登录用户名，替代现有的静态 "用户" 文本。
- **前端增加登出功能**：提供登出按钮，点击后清除 localStorage 中的 token 并跳转回登录页。
- **前端请求拦截器优化**：当后端返回 401/422（Authorization 缺失）时，自动清除 token 并跳转登录页，避免用户停留在报错页面。
- **后端 `/api/auth/me` 接口适配**：确保该接口返回的数据结构满足前端展示需求（username、email 等）。

## Capabilities

### New Capabilities
- *(无新能力引入，属于认证系统体验完善)*

### Modified Capabilities
- `auth-user`: 补充前端用户信息展示和登出流程的完整需求，明确 401/422 统一处理策略。

## Impact

- **前端文件**：`client/src/components/Layout.tsx`（新增用户区域和登出按钮）、`client/src/services/api.ts`（响应拦截器处理认证错误）。
- **API**：`/api/auth/me`（已有接口，无需改动）。
- **依赖**：Ant Design Dropdown/Avatar 组件（已包含在项目中）。

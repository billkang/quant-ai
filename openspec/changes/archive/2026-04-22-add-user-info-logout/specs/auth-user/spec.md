## ADDED Requirements

### Requirement: 前端展示当前登录用户信息
系统 SHALL 在 Layout 侧边栏底部展示当前登录用户的用户名。用户信息在登录成功后缓存到 localStorage，Layout 组件挂载时优先读取缓存，若不存在则请求 `/api/auth/me` 兜底获取。

#### Scenario: 登录成功后展示用户名
- **GIVEN** 用户已成功登录
- **WHEN** 用户进入任意需要 Layout 的页面
- **THEN** 侧边栏底部显示当前用户名

#### Scenario: 直接刷新页面后展示用户名
- **GIVEN** 用户已登录且 localStorage 中有 token
- **WHEN** 用户直接刷新页面
- **THEN** 侧边栏底部仍能正确显示用户名

### Requirement: 用户可主动登出
系统 SHALL 提供登出功能，用户点击后清除 localStorage 中的 token 和 username，并跳转至登录页。

#### Scenario: 用户点击登出
- **GIVEN** 用户已登录
- **WHEN** 用户点击侧边栏底部的用户名展开菜单，选择 "登出"
- **THEN** 系统清除认证信息并跳转至 `/login`

### Requirement: 认证失效时前端自动处理
当后端返回 401 Unauthorized 或 422 Unprocessable Entity（因缺失 Authorization header）时，前端 SHALL 自动清除 token，并跳转至登录页。

#### Scenario: Token 过期后访问受保护接口
- **GIVEN** 用户的 token 已过期或无效
- **WHEN** 前端发起任意需要认证的 API 请求
- **THEN** 前端检测到 401/422 响应，清除 token 并跳转至 `/login`

#### Scenario: 未登录直接访问受保护页面
- **GIVEN** 用户未登录（localStorage 中无 token）
- **WHEN** 用户通过地址栏直接访问 `/screener` 等受保护页面
- **THEN** Layout 组件检测到无 token，直接跳转至 `/login`

## MODIFIED Requirements

### Requirement: 用户可登录
用户登录后，系统 SHALL 将用户名缓存到 localStorage，以便 Layout 组件展示。

#### Scenario: 用户登录成功并缓存信息
- **WHEN** 用户输入凭证并提交
- **THEN** 系统验证并返回 JWT token
- **AND** 前端将用户名写入 localStorage

## REMOVED Requirements

（无）

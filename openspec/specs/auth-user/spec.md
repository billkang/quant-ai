# 用户认证系统规格

## 功能概述

为 Quant AI 提供多用户支持。当前系统为单用户无认证模式，所有数据（自选股、持仓、诊断历史等）全局共享。引入用户系统后实现数据隔离，为每个用户提供独立的投资工作空间。

## 设计决策

- 使用 **JWT (JSON Web Token)** 进行无状态认证，避免服务端 session 存储。
- 密码使用 **bcrypt** 哈希存储。
- 自选股、持仓、诊断历史、回测记录、告警规则等现有表增加 `user_id` 外键。
- 保留一个 "匿名模式" 让未登录用户也能浏览公开数据（行情、新闻）。

## API 接口

### 用户注册
```
POST /api/auth/register
```
Body (BaseModel):
```json
{
  "username": "quant_user",
  "email": "user@example.com",
  "password": "secure_password"
}
```
Response (success_response):
```json
{
  "code": 0,
  "data": { "id": 1, "username": "quant_user" },
  "message": "注册成功"
}
```

### 用户登录
```
POST /api/auth/login
```
Body (BaseModel):
```json
{
  "username": "quant_user",
  "password": "secure_password"
}
```
Response (success_response):
```json
{
  "code": 0,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "token_type": "bearer",
    "expires_in": 86400
  },
  "message": "登录成功"
}
```

### 获取当前用户信息
```
GET /api/auth/me
```
Headers: `Authorization: Bearer <token>`
Response (success_response):
```json
{
  "code": 0,
  "data": {
    "id": 1,
    "username": "quant_user",
    "email": "user@example.com",
    "createdAt": "2024-01-15T10:00:00"
  },
  "message": "ok"
}
```

### 修改密码
```
PUT /api/auth/password
```
Headers: `Authorization: Bearer <token>`
Body:
```json
{
  "old_password": "old_pass",
  "new_password": "new_pass"
}
```

## 数据模型

### users 表
- id (Integer, PK)
- username (String(50), unique, index)
- email (String(100), unique)
- password_hash (String(255))
- is_active (Integer, default=1)
- created_at (DateTime)
- updated_at (DateTime)

### 现有表改造
以下表增加 `user_id` (Integer, index, nullable) 字段，允许 null 表示 "系统公共数据" 或遗留数据：
- `watchlist`
- `positions`
- `transactions`
- `diagnostic_history`
- `strategy_backtests`
- `news_sources` (可选)
- `alerts`

## FastAPI 依赖

新增 `get_current_user` 依赖：
```python
async def get_current_user(token: str = Header(...)) -> User:
    ...
```

需要认证的端点在现有 `db: Session = Depends(get_db)` 基础上增加 `user: User = Depends(get_current_user)`。

> ⚠️ **已知问题**：`Header(...)` 在缺失时会由 FastAPI 校验直接返回 `422 Unprocessable Entity`，而非 `401 Unauthorized`。前端拦截器需要同时处理 401 和 422（且 detail 中 loc 包含 `Authorization`）才能正确引导用户重新登录。后续可考虑改用 `Header(None)` + 手动抛 401 来统一状态码。

## 前端适配

- 登录/注册弹窗或独立页面 `/login`
- `Layout.tsx` 顶部显示当前用户，支持登出
- `api.ts` 增加 request interceptor 自动附加 `Authorization` header
- 未登录时引导登录，关键操作（添加自选股、添加持仓、运行回测）需登录

## Requirements

### Requirement: 用户可注册账号
#### Scenario: 新用户注册
- **WHEN** 用户填写用户名、邮箱、密码并提交
- **THEN** 系统创建用户并返回 JWT token

### Requirement: 用户可登录
#### Scenario: 用户登录
- **WHEN** 用户输入凭证并提交
- **THEN** 系统验证并返回 JWT token
- **AND** 前端将用户名写入 localStorage

### Requirement: 前端展示当前登录用户信息
系统 SHALL 在页面顶部 Header 区域展示当前登录用户的用户名和登出入口。用户信息在登录成功后缓存到 localStorage，Layout 组件挂载时优先读取缓存，若不存在则请求 `/api/auth/me` 兜底获取。

#### Scenario: 登录成功后展示用户名
- **GIVEN** 用户已成功登录
- **WHEN** 用户进入任意需要 Layout 的页面
- **THEN** 页面顶部 Header 右侧显示当前用户名

#### Scenario: 直接刷新页面后展示用户名
- **GIVEN** 用户已登录且 localStorage 中有 token
- **WHEN** 用户直接刷新页面
- **THEN** 页面顶部 Header 右侧仍能正确显示用户名

### Requirement: 用户可主动登出
系统 SHALL 提供登出功能，用户点击后清除 localStorage 中的 token 和 username，并跳转至登录页。

#### Scenario: 用户点击登出
- **GIVEN** 用户已登录
- **WHEN** 用户点击页面顶部 Header 右侧的用户名展开菜单，选择 "登出"
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

### Requirement: 数据按用户隔离
#### Scenario: 用户A添加自选股
- **GIVEN** 用户A已登录
- **WHEN** 用户A添加自选股 600519
- **THEN** 用户B查看自选股列表时不显示 600519

## 状态

🚧 计划中

## 优先级

**P0** — 所有个性化功能的前提。
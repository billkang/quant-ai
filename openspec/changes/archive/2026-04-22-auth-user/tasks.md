# Tasks: auth-user

## Task 1: 创建 users 数据模型和数据库迁移
- [x] 在 `server/src/models/models.py` 中新增 `User` 模型
- [x] 在 `watchlist`, `positions`, `transactions`, `diagnostic_history`, `strategy_backtests`, `alerts` 表中增加 `user_id` 字段
- [x] 创建 Alembic migration 文件并执行 upgrade
- [x] 验证：数据库中 users 表和各表的 user_id 字段已创建

## Task 2: 实现用户认证 API (注册/登录/信息)
- [x] 创建 `server/src/api/auth.py`，实现 `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `PUT /api/auth/password`
- [x] 使用 bcrypt 哈希密码
- [x] 使用 JWT 生成/验证 token
- [x] 在 `server/src/main.py` 中注册 auth router
- [x] 验证：通过 pytest E2E 测试验证注册/登录/获取用户信息流程

## Task 3: 实现 get_current_user 依赖并隔离现有 API
- [x] 在 `server/src/api/deps.py` 中新增 `get_current_user` 依赖
- [x] 修改 `crud.py` 相关函数添加 `user_id` 参数支持
- [x] 修改 `stocks.py` watchlist 相关端点：按 user_id 过滤
- [x] 修改 `portfolio.py` 所有端点：按 user_id 过滤
- [x] 修改 `ai.py` history 端点：按 user_id 过滤
- [x] 修改 `quant.py` backtests 和 alerts 端点：按 user_id 过滤
- [x] 验证：pytest E2E 测试验证用户数据隔离

## Task 4: 前端登录/注册页面和路由守卫
- [x] 创建 `client/src/pages/Login.tsx`（登录/注册双模式）
- [x] 在 `client/src/services/api.ts` 中增加 token interceptor
- [x] 在 `client/src/components/Layout.tsx` 中显示当前用户和登出按钮
- [x] 在 `client/src/App.tsx` 中添加 `/login` 路由
- [x] 未登录时 Layout 自动跳转登录页

## Task 5: 编写单元测试和 E2E 测试
- [x] 后端 E2E 测试：`tests/e2e/test_auth.py`（6 个测试全部通过）
- [x] 验证：所有测试通过

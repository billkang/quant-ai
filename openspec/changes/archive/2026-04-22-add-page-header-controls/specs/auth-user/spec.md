## MODIFIED Requirements

### Requirement: 用户可登录
用户登录后，系统 SHALL 将用户名缓存到 localStorage，以便 Layout 组件展示。

#### Scenario: 用户登录成功并缓存信息
- **WHEN** 用户输入凭证并提交
- **THEN** 系统验证并返回 JWT token
- **AND** 前端将用户名写入 localStorage

## ADDED Requirements

### Requirement: 用户信息展示在页面顶部 Header
系统 SHALL 在页面顶部 Header 区域展示当前登录用户的用户名和登出入口。该入口 SHALL 位于主内容区顶部的右侧，与告警入口、主题切换器形成全局操作区。

#### Scenario: 用户在 Header 看到用户名
- **GIVEN** 用户已成功登录
- **WHEN** 用户进入任意页面
- **THEN** 页面顶部 Header 右侧显示当前用户名

#### Scenario: 用户在 Header 执行登出
- **GIVEN** 用户已登录
- **WHEN** 用户点击 Header 右侧的用户名展开菜单，选择 "登出"
- **THEN** 系统清除认证信息并跳转至 `/login`

## REMOVED Requirements

（无）

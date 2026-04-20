## ADDED Requirements

### Requirement: OpenClaw Skill 封装
系统 SHALL 提供 OpenClaw Skill 供飞书调用。

#### Scenario: Skill 调用
- **WHEN** 用户在飞书中通过 OpenClaw 调用系统能力
- **THEN** 系统执行对应操作并返回结果

### Requirement: REST API 暴露
系统 SHALL 通过 REST API 暴露核心功能供 OpenClaw 调用。

#### Scenario: API 调用
- **WHEN** OpenClaw 调用系统 API
- **THEN** 系统验证请求并返回对应数据

### Requirement: 实时推送
系统 SHALL 支持通过 WebSocket 推送实时数据和预警。

#### Scenario: 推送通知
- **WHEN** 达到预设条件
- **THEN** 系统主动推送通知到飞书

### Requirement: 数据缓存
系统 SHALL 使用 Redis 缓存实时数据减少 API 调用。

#### Scenario: 缓存查询
- **WHEN** 请求实时行情
- **THEN** 系统先检查缓存，缓存命中直接返回，否则查询数据源
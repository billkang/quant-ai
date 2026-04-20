## ADDED Requirements

### Requirement: 富途持仓同步
系统 SHALL 通过 Clawdfolio 获取富途账户的持仓数据。

#### Scenario: 持仓同步
- **WHEN** 用户触发持仓同步
- **THEN** 系统从富途 OpenD 获取最新持仓并保存到数据库

### Requirement: 富途行情对接
系统 SHALL 对接富途 API 获取港股实时行情。

#### Scenario: 行情获取
- **WHEN** 用户请求港股实时行情
- **THEN** 系统返回富途 API 的行情数据

### Requirement: 订单同步
系统 SHALL 支持同步富途账户的订单记录。

#### Scenario: 订单同步
- **WHEN** 用户请求订单记录
- **THEN** 系统返回富途账户的历史订单

### Requirement: 风控集成
系统 SHALL 集成 Clawdfolio 的风险分析指标。

#### Scenario: 风险分析
- **WHEN** 用户请求风险分析
- **THEN** 系统返回 VaR、Sharpe、Max Drawdown 等指标
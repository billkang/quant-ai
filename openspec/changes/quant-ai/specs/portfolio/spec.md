## ADDED Requirements

### Requirement: 持仓记账
系统 SHALL 支持用户记录股票买入/卖出/分红。

#### Scenario: 记录买入
- **WHEN** 用户记录一次买入操作
- **THEN** 系统保存买入信息（股票、数量、价格、日期、佣金）

#### Scenario: 记录卖出
- **WHEN** 用户记录一次卖出操作
- **THEN** 系统保存卖出信息并更新持仓成本

### Requirement: 盈亏分析
系统 SHALL 支持展示单只股票和组合的盈亏情况。

#### Scenario: 盈亏展示
- **WHEN** 用户查看持仓
- **THEN** 系统展示每只股票的盈亏金额和盈亏比例

### Requirement: 仓位分布
系统 SHALL 支持展示持仓的仓位分布。

#### Scenario: 仓位分布
- **WHEN** 用户查看组合
- **THEN** 系统展示行业分布、市值分布的饼图

### Requirement: 历史交易记录
系统 SHALL 支持查看过往所有交易记录。

#### Scenario: 历史查询
- **WHEN** 用户请求查询历史交易
- **THEN** 系统返回按时间排序的交易记录列表
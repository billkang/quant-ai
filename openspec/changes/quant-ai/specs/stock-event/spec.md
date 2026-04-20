## ADDED Requirements

### Requirement: 聚合股票相关新闻
系统 SHALL 支持聚合 A 股和港股相关的新闻资讯。

#### Scenario: 获取股票新闻
- **WHEN** 用户请求某只股票的最新新闻
- **THEN** 系统返回该股票相关的新闻列表（标题、来源、时间、内容摘要）

### Requirement: 聚合公司公告
系统 SHALL 支持获取 A 股上市公司的重要公告。

#### Scenario: 获取公司公告
- **WHEN** 用户请求某家A股公司的公告
- **THEN** 系统返回近期的重要公告列表（公告标题、公告类型、发布日期）

### Requirement: 聚合宏观事件
系统 SHALL 支持获取重要宏观经济数据（利率、GDP、CPI 等）。

#### Scenario: 获取宏观数据
- **WHEN** 用户请求最新的宏观数据
- **THEN** 系统返回近期的重要宏观数据发布（数据名称、数值、发布时间）

### Requirement: 事件与股票关联分析
系统 SHALL 支持将重要事件与相关股票关联展示。

#### Scenario: 事件关联
- **WHEN** 发生重要的行业或宏观事件
- **THEN** 系统自动展示受影响的相关股票列表
## ADDED Requirements

### Requirement: 获取 A 股行情数据
系统 SHALL 支持通过 AkShare 获取 A 股股票的实时行情和历史 K 线数据。

#### Scenario: 获取实时行情
- **WHEN** 用户请求某只 A 股的实时行情
- **THEN** 系统返回最新价、开盘价、最高价、最低价、成交量、成交额

#### Scenario: 获取历史 K 线
- **WHEN** 用户指定股票代码、开始日期、结束日期和时间周期
- **THEN** 系统返回对应时间段的历史 K 线数据

### Requirement: 获取港股行情数据
系统 SHALL 支持通过 yfinance 获取港股股票的实时行情和历史 K 线数据。

#### Scenario: 获取港股实时行情
- **WHEN** 用户请求某只港股（如 00700.HK）的实时行情
- **THEN** 系统返回最新价、开盘价、最高价、最低价、成交量

### Requirement: 管理自选股
系统 SHALL 支持用户添加、删除、查看自选股列表。

#### Scenario: 添加自选股
- **WHEN** 用户添加一只股票到自选股列表
- **THEN** 系统保存股票信息到数据库并在列表中显示

#### Scenario: 删除自选股
- **WHEN** 用户从自选股列表中移除一只股票
- **THEN** 系统从数据库中删除该记录

### Requirement: 计算技术指标
系统 SHALL 支持计算常见技术指标（MA、MACD、RSI、KDJ、BOLL）。

#### Scenario: 计算移动平均线
- **WHEN** 用户请求某只股票 N 日均线
- **THEN** 系统返回 MA5、MA10、MA20、MA60 等指标数据
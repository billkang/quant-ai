## ADDED Requirements

### Requirement: 技术形态分析
系统 SHALL 支持识别常见的技术形态（突破、背离、金叉、死叉）。

#### Scenario: 金叉识别
- **WHEN** 短期均线上穿长期均线
- **THEN** 系统标记为金叉信号并通知用户

### Requirement: 趋势分析
系统 SHALL 支持多周期的趋势判断（上涨、下跌、横盘）。

#### Scenario: 趋势判断
- **WHEN** 用户请求某只股票的趋势分析
- **THEN** 系统返回日线、周线、月线的趋势判断

### Requirement: 估值分析
系统 SHALL 支持 PE、PB 等估值指标的历史分位展示。

#### Scenario: 估值分位
- **WHEN** 用户请求某只股票的估值分析
- **THEN** 系统返回当前 PE/PB 以及在历史数据中的分位

### Requirement: 资金流向分析
系统 SHALL 支持展示北向资金、南向资金的流向。

#### Scenario: 资金流向
- **WHEN** 用户请求某只股票的资金流向
- **THEN** 系统返回最近 N 天的北向/南向资金买卖情况
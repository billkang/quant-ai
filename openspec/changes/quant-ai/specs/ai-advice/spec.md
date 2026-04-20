## ADDED Requirements

### Requirement: AI 股票诊断
系统 SHALL 支持 AI 分析单只股票并给出投资建议。

#### Scenario: 诊断请求
- **WHEN** 用户请求诊断某只股票
- **THEN** 系统返回包含基本面、技术面、风险评估和建议的综合分析

### Requirement: AI 事件解读
系统 SHALL 支持 AI 分析新闻事件对持仓的影响。

#### Scenario: 事件解读
- **WHEN** 有重要新闻或事件发生
- **THEN** 系统自动分析并生成对相关持仓股的影响报告

### Requirement: AI 问答交互
系统 SHALL 支持用户通过自然语言提问关于股票的问题。

#### Scenario: 问答交互
- **WHEN** 用户用自然语言提问
- **THEN** 系统结合数据给出分析回答

### Requirement: AI 投资报告
系统 SHALL 支持每日/每周自动生成 AI 投资简报。

#### Scenario: 生成日报
- **WHEN** 每天收盘后
- **THEN** 系统自动生成当日投资简报推送给用户
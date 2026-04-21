# Tasks: 量化分析引擎

## Phase 1: 数据层（历史行情 + 技术指标）

### 1.1 数据库模型
- [x] 1.1.1 创建 `stock_daily_prices` 表（日K历史）
- [x] 1.1.2 创建 `stock_indicators` 表（技术指标）
- [x] 1.1.3 生成 Alembic migration

### 1.2 技术指标计算引擎
- [x] 1.2.1 实现 `IndicatorService` 骨架
- [x] 1.2.2 实现 MA（5/10/20/60日）计算
- [x] 1.2.3 实现 RSI（6/12/24日）计算
- [x] 1.2.4 实现 MACD（DIF/DEA/柱状图）计算
- [x] 1.2.5 实现 KDJ（K/D/J）计算
- [x] 1.2.6 实现布林带（上/中/下轨）计算
- [x] 1.2.7 实现成交量均线（5/10日）计算

### 1.3 数据 Pipeline（Scheduler）
- [x] 1.3.1 改造 `daily_data_update`：拉取行情并写入 `stock_daily_prices`
- [x] 1.3.2 添加指标计算步骤：拉取近60日 → 计算 → 写入 `stock_indicators`
- [x] 1.3.3 添加前复权处理逻辑
- [x] 1.3.4 添加停牌检测（无数据则标记 is_suspended）

### 1.4 前端指标展示
- [x] 1.4.1 StockDetail 页面添加指标卡片（RSI/MACD/MA/布林带）
- [x] 1.4.2 K线图叠加 MA5/MA20 线
- [x] 1.4.3 新增 API：`GET /api/quant/indicators/:code`

### Phase 1 验收
- [x] 收盘后自动拉取自选股行情并入库
- [x] 指标计算正确（与东方财富/TDX 交叉验证）
- [x] 前端能看到指标值

---

## Phase 2: 策略回测

### 2.1 回测框架
- [x] 2.1.1 实现 `Strategy` 抽象基类
- [x] 2.1.2 实现 `Portfolio`（模拟持仓/现金）
- [x] 2.1.3 实现 `BacktestService.run()` 引擎
- [x] 2.1.4 实现绩效计算（总收益/年化/最大回撤/夏普/胜率）

### 2.2 内置策略
- [x] 2.2.1 `MACrossStrategy`（MA5/MA20 金叉死叉）
- [x] 2.2.2 `RSIOversoldStrategy`（RSI<30 买入，>70 卖出）
- [x] 2.2.3 `MACDStrategy`（DIF上穿DEA买入）

### 2.3 回测 API 与存储
- [x] 2.3.1 创建 `strategy_backtests` 表
- [x] 2.3.2 API：`POST /api/quant/backtest`
- [x] 2.3.3 API：`GET /api/quant/backtests`
- [x] 2.3.4 API：`GET /api/quant/backtests/:id`（含收益曲线）

### 2.4 前端回测页面
- [x] 2.4.1 策略选择器（MA交叉/RSI/MACD）
- [x] 2.4.2 回测参数配置（股票/时间段/初始资金）
- [x] 2.4.3 回测结果展示：收益曲线 vs 基准
- [x] 2.4.4 回测结果展示：绩效指标卡片
- [x] 2.4.5 回测结果展示：交易记录列表

### Phase 2 验收
- [x] 能对一个股票跑 MA交叉回测
- [x] 收益曲线正确
- [x] 绩效指标计算正确

---

## Phase 3: 组合分析 + 告警

### 3.1 组合风险分析
- [x] 3.1.1 计算组合夏普比率
- [x] 3.1.2 计算组合最大回撤
- [x] 3.1.3 计算持仓股票相关性矩阵
- [x] 3.1.4 计算行业分布（占位实现）
- [x] 3.1.5 API：`GET /api/quant/portfolio/analysis`
- [x] 3.1.6 前端：Portfolio 页面新增风险指标
- [x] 3.1.7 前端：相关性矩阵热力图
- [x] 3.1.8 前端：行业分布饼图

### 3.2 告警系统
- [x] 3.2.1 创建 `alerts` 表
- [x] 3.2.2 实现告警规则保存（简化版，无独立规则表）
- [x] 3.2.3 Scheduler 每日扫描并生成告警
- [x] 3.2.4 API：`GET /api/quant/alerts`
- [x] 3.2.5 API：`POST /api/quant/alerts/rules`
- [x] 3.2.6 前端：告警页面（规则管理 + 历史）
- [x] 3.2.7 前端：Layout 添加未读告警角标

### Phase 3 验收
- [x] 持仓相关性矩阵能展示
- [ ] 价格突破告警能触发并显示（需完成 3.2.3）

---

## Phase 4: 基本面数据 + AI 增强

### 4.1 基本面数据
- [x] 4.1.1 创建 `stock_fundamentals` 表
- [x] 4.1.2 实现 `FundamentalService`（从东方财富 API 拉取）
- [x] 4.1.3 Scheduler 季度更新（财报发布后）
- [x] 4.1.4 API：`GET /api/quant/fundamentals/:code`
- [x] 4.1.5 前端：StockDetail 新增基本面卡片（PE/PB/ROE）

### 4.2 AI 诊断增强
- [x] 4.2.1 修改 `ai_diagnostic.py` prompt，注入真实指标值
- [x] 4.2.2 AI 分析 MA 趋势、RSI 状态、MACD 信号
- [x] 4.2.3 AI 分析 PE 分位、ROE 水平
- [x] 4.2.4 前端：AI 诊断详情页展示技术面/基本面/风险分析（详情 Modal 已分区域展示）

### Phase 4 验收
- [x] AI 诊断引用真实指标而非猜测
- [x] 基本面数据能展示

---

## 非功能性任务

- [ ] 所有新 API 添加 pytest 测试
- [ ] 前端新增 vitest 组件测试
- [x] 更新 AGENTS.md（新增 Data Pipeline 命令）
- [x] Docker 构建验证

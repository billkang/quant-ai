# Design: 量化分析引擎

## 架构概览

```
┌─────────────────────────────────────────────────────────────────┐
│                        量化分析引擎架构                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │  Data Layer │    │ Indicator   │    │ Backtest    │         │
│  │  数据层      │───▶│  Engine     │───▶│  Engine     │         │
│  │             │    │  指标计算    │    │  策略回测    │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│         │                  │                  │                 │
│         ▼                  ▼                  ▼                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │ Fundamental │    │ Alert       │    │ Portfolio   │         │
│  │ 基本面数据   │    │ 告警系统     │    │ 组合分析     │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Scheduler Pipeline (Data Pipeline)          │   │
│  │  收盘 15:30 ──▶ 拉行情 ──▶ 存日K ──▶ 算指标 ──▶ 生成告警   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 数据模型

### 1. stock_daily_prices（日K历史）

```sql
CREATE TABLE stock_daily_prices (
    id SERIAL PRIMARY KEY,
    stock_code VARCHAR(20) NOT NULL,
    trade_date DATE NOT NULL,
    open DECIMAL(12,4),
    high DECIMAL(12,4),
    low DECIMAL(12,4),
    close DECIMAL(12,4),
    volume BIGINT,
    amount DECIMAL(16,2),
    is_suspended BOOLEAN DEFAULT FALSE,
    adjusted BOOLEAN DEFAULT TRUE,  -- 前复权
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(stock_code, trade_date)
);
```

### 2. stock_indicators（技术指标）

```sql
CREATE TABLE stock_indicators (
    id SERIAL PRIMARY KEY,
    stock_code VARCHAR(20) NOT NULL,
    trade_date DATE NOT NULL,
    ma5 DECIMAL(12,4),
    ma10 DECIMAL(12,4),
    ma20 DECIMAL(12,4),
    ma60 DECIMAL(12,4),
    rsi6 DECIMAL(8,4),
    rsi12 DECIMAL(8,4),
    rsi24 DECIMAL(8,4),
    macd_dif DECIMAL(12,4),
    macd_dea DECIMAL(12,4),
    macd_bar DECIMAL(12,4),
    kdj_k DECIMAL(8,4),
    kdj_d DECIMAL(8,4),
    kdj_j DECIMAL(8,4),
    boll_upper DECIMAL(12,4),
    boll_mid DECIMAL(12,4),
    boll_lower DECIMAL(12,4),
    vol_ma5 DECIMAL(16,2),
    vol_ma10 DECIMAL(16,2),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(stock_code, trade_date)
);
```

### 3. stock_fundamentals（基本面）

```sql
CREATE TABLE stock_fundamentals (
    id SERIAL PRIMARY KEY,
    stock_code VARCHAR(20) NOT NULL,
    report_date DATE NOT NULL,
    pe_ttm DECIMAL(10,4),
    pb DECIMAL(10,4),
    ps DECIMAL(10,4),
    roe DECIMAL(10,4),
    roa DECIMAL(10,4),
    gross_margin DECIMAL(10,4),
    net_margin DECIMAL(10,4),
    revenue_growth DECIMAL(10,4),
    profit_growth DECIMAL(10,4),
    debt_ratio DECIMAL(10,4),
    free_cash_flow DECIMAL(16,2),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(stock_code, report_date)
);
```

### 4. strategy_backtests（回测记录）

```sql
CREATE TABLE strategy_backtests (
    id SERIAL PRIMARY KEY,
    strategy_name VARCHAR(100) NOT NULL,
    stock_code VARCHAR(20) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    initial_cash DECIMAL(16,2),
    final_value DECIMAL(16,2),
    total_return DECIMAL(10,4),
    annualized_return DECIMAL(10,4),
    max_drawdown DECIMAL(10,4),
    sharpe_ratio DECIMAL(10,4),
    win_rate DECIMAL(10,4),
    trade_count INT,
    trades JSON,           -- [{date, action, price, shares, value}]
    equity_curve JSON,     -- [{date, value}]
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 5. alerts（告警）

```sql
CREATE TABLE alerts (
    id SERIAL PRIMARY KEY,
    stock_code VARCHAR(20) NOT NULL,
    alert_type VARCHAR(50) NOT NULL,  -- price_break / indicator_signal / news_sentiment
    condition VARCHAR(200),           -- "price < 1600" / "rsi6 < 30"
    triggered_at TIMESTAMP,
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## 服务模块设计

### IndicatorService（技术指标计算）

```python
class IndicatorService:
    def calculate_all(self, prices: list[PriceRow]) -> list[IndicatorRow]:
        df = pd.DataFrame(prices)
        df = self._add_ma(df)
        df = self._add_rsi(df)
        df = self._add_macd(df)
        df = self._add_kdj(df)
        df = self._add_boll(df)
        df = self._add_vol_ma(df)
        return df.to_dict('records')

    def _add_ma(self, df: pd.DataFrame) -> pd.DataFrame:
        df['MA5'] = df['close'].rolling(5).mean()
        df['MA10'] = df['close'].rolling(10).mean()
        df['MA20'] = df['close'].rolling(20).mean()
        df['MA60'] = df['close'].rolling(60).mean()
        return df

    def _add_rsi(self, df: pd.DataFrame, periods=[6, 12, 24]) -> pd.DataFrame:
        for p in periods:
            delta = df['close'].diff()
            gain = (delta.where(delta > 0, 0)).rolling(p).mean()
            loss = (-delta.where(delta < 0, 0)).rolling(p).mean()
            rs = gain / loss
            df[f'RSI{p}'] = 100 - (100 / (1 + rs))
        return df

    def _add_macd(self, df: pd.DataFrame) -> pd.DataFrame:
        ema12 = df['close'].ewm(span=12, adjust=False).mean()
        ema26 = df['close'].ewm(span=26, adjust=False).mean()
        df['MACD_DIF'] = ema12 - ema26
        df['MACD_DEA'] = df['MACD_DIF'].ewm(span=9, adjust=False).mean()
        df['MACD_BAR'] = 2 * (df['MACD_DIF'] - df['MACD_DEA'])
        return df
```

### BacktestService（策略回测）

```python
class BacktestService:
    def run(self, strategy: Strategy, stock_code: str,
            start: date, end: date, initial_cash: float = 100000) -> BacktestResult:
        data = self._get_data(stock_code, start, end)
        signals = strategy.generate_signals(data)

        portfolio = Portfolio(initial_cash)
        for i, row in data.iterrows():
            signal = signals[i]
            if signal == 'buy' and portfolio.can_buy(row['close']):
                portfolio.buy(stock_code, row['close'], row['trade_date'])
            elif signal == 'sell' and portfolio.has_position(stock_code):
                portfolio.sell(stock_code, row['close'], row['trade_date'])

        return portfolio.report()
```

### Strategy（策略基类）

```python
class Strategy(ABC):
    @abstractmethod
    def generate_signals(self, data: pd.DataFrame) -> pd.Series:
        """Return Series of 'buy'/'sell'/'hold' for each row"""
        pass

class MACrossStrategy(Strategy):
    def __init__(self, short=5, long=20):
        self.short = short
        self.long = long

    def generate_signals(self, data: pd.DataFrame) -> pd.Series:
        data['MA_short'] = data['close'].rolling(self.short).mean()
        data['MA_long'] = data['close'].rolling(self.long).mean()

        signals = pd.Series('hold', index=data.index)
        signals[data['MA_short'] > data['MA_long']] = 'buy'
        signals[data['MA_short'] < data['MA_long']] = 'sell'
        # 只保留交叉点
        signals = signals[signals != signals.shift()].fillna('hold')
        return signals
```

## Scheduler Pipeline 设计

```
每日 15:30（收盘后）
├── 1. 拉取自选股当日行情
│   └── stock_service.get_a_stock_kline(symbol, "daily", limit=1)
├── 2. 写入 stock_daily_prices（前复权处理）
│   └── crud.save_daily_prices()
├── 3. 重新计算近 60 日指标
│   └── indicator_service.calculate_all(prices)
├── 4. 写入 stock_indicators
│   └── crud.save_indicators()
├── 5. 扫描告警规则
│   └── alert_service.check_rules()
├── 6. 生成每日简报（可选）
│   └── 推送到前端或邮件
```

## API 路由设计

```
GET  /api/quant/indicators/:code          # 获取某股最新指标
GET  /api/quant/indicators/:code/history  # 获取历史指标（用于图表）
GET  /api/quant/fundamentals/:code        # 获取基本面数据
POST /api/quant/backtest                  # 执行回测
GET  /api/quant/backtests                 # 回测历史列表
GET  /api/quant/backtests/:id             # 回测详情（含收益曲线）
GET  /api/quant/alerts                    # 告警列表
PUT  /api/quant/alerts/:id/read           # 标记已读
POST /api/quant/alerts/rules              # 创建告警规则
GET  /api/quant/portfolio/analysis        # 组合风险分析
```

## AI 诊断增强

当前 AI prompt：
```
"当前价格: {price}, 涨跌幅: {changePercent}%"
```

增强后 prompt：
```
"当前价格: {price}
技术指标:
- MA5: {ma5} | MA20: {ma20} (趋势: {'上行' if ma5 > ma20 else '下行'})
- RSI(6): {rsi6} (状态: {'超买' if rsi6 > 70 else '超卖' if rsi6 < 30 else '中性'})
- MACD: DIF={macd_dif}, DEA={macd_dea} (信号: {'金叉' if macd_golden else '死叉' if macd_dead else '中性'})
- 布林带: 股价位于{boll_position}
基本面:
- PE(TTM): {pe_ttm} (行业分位: {pe_percentile}%)
- ROE: {roe}% (同比: {roe_change:+}%)
```

## 前端的量化页面

```
/stock/:code
├── 指标卡片（RSI/MACD/MA/布林带当前值）
└── K线图叠加 MA/布林带

/strategies
├── 策略列表（MA交叉 / RSI超卖 / 自定义）
├── 回测配置（股票/时间段/初始资金）
└── 回测结果（收益曲线 + 绩效指标 + 交易记录）

/portfolio
├── 持仓列表（已有）
├── 行业分布饼图
├── 风险指标（夏普/回撤/波动率）
└── 相关性矩阵热力图

/alerts
├── 告警规则管理
├── 告警历史
└── 未读告警角标
```

## 关键决策

1. **数据粒度**：日K足够，暂不做分钟级
2. **复权方式**：前复权，所有历史数据统一复权后存储
3. **指标计算**：全量 pandas（不是增量），每天重算近 60 日
4. **回测精度**：日线级别收盘撮合（不做 intraday）
5. **策略存储**：Python 代码动态加载（简单）或 JSON 规则引擎（安全）

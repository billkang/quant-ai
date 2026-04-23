## ADDED Requirements

### Requirement: Backtest task records strategy and version references
The system SHALL store `strategy_id` and `strategy_version_id` in each backtest task record to track which strategy was used.

#### Scenario: Submit backtest with strategy
- **WHEN** user sends `POST /api/quant/backtest` with `strategyId` and optional `strategyVersionId`
- **THEN** system stores the backtest with references to the strategy

### Requirement: Backtest supports parameterized strategies
The system SHALL accept `strategyParams` in backtest requests and validate them against the strategy's `params_schema`.

#### Scenario: Run parameterized backtest
- **WHEN** user submits backtest with `strategyId` pointing to a strategy with params_schema
- **AND** provides `strategyParams` matching the schema
- **THEN** system instantiates the strategy with those parameters and runs backtest

## MODIFIED Requirements

### Requirement: Backtest engine runs strategies with configurable parameters
The backtest engine MUST support running strategies defined in the `strategies` table with parameterized inputs, replacing the current hardcoded strategy registry.

#### Scenario: Run builtin ma_cross strategy
- **WHEN** user submits backtest with `strategyId` referencing builtin "ma_cross" strategy
- **AND** provides `strategyParams: {"short": 5, "long": 20}`
- **THEN** system loads the strategy code, instantiates with parameters, and runs backtest

#### Scenario: Strategy receives factor snapshot data
- **WHEN** backtest runs for a strategy with category "combined"
- **THEN** the strategy's `generate_signals` method receives a DataFrame containing OHLCV, technical indicators (ma5, rsi6, macd_dif, etc.), and event factor columns (avg_sentiment, event_strength, news_count)

### Requirement: Backtest results include factor snapshot references
Each backtest result MUST include the list of `factor_snapshot_ids` used during execution for reproducibility.

#### Scenario: Backtest result includes snapshot IDs
- **WHEN** backtest completes successfully
- **THEN** the response includes `factorSnapshotIds` array referencing all snapshots used

## REMOVED Requirements

### Requirement: Hardcoded strategy registry in BacktestService
**Reason**: Replaced by dynamic strategy loading from `strategies` table
**Migration**: Existing builtin strategies (ma_cross, rsi_oversold, macd_signal) are migrated to `strategies` table with `is_builtin: true`

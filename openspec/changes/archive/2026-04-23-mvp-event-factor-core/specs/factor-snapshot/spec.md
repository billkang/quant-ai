## ADDED Requirements

### Requirement: Factor snapshots align technical and event factors by date
The system SHALL generate daily `factor_snapshots` for each symbol that combine technical indicators and event factors for the same `trade_date`.

#### Scenario: Generate snapshot for a single day
- **GIVEN** symbol "600519" on 2025-01-15 has both `stock_indicators` record and `event_factors` record
- **WHEN** snapshot generation runs
- **THEN** system creates a `factor_snapshot` with `technical` and `events` fields populated

#### Scenario: Missing event factors defaults to empty
- **GIVEN** symbol "600519" on 2025-01-15 has `stock_indicators` but no `event_factors`
- **WHEN** snapshot generation runs
- **THEN** system creates a `factor_snapshot` with `events` as empty object

### Requirement: Factor snapshots are queryable by symbol and date range
The system SHALL provide API to retrieve factor snapshots for a symbol over a date range.

#### Scenario: Query snapshot history
- **WHEN** user sends `GET /api/factors/snapshots/600519?start=2025-01-01&end=2025-01-31`
- **THEN** system returns array of snapshots ordered by trade_date

#### Scenario: Query latest snapshot
- **WHEN** user sends `GET /api/factors/snapshot/latest?symbol=600519`
- **THEN** system returns the most recent snapshot for that symbol

### Requirement: Backtest engine uses factor snapshots as input
The backtest engine SHALL read price and factor data from `factor_snapshots` instead of directly from `stock_daily_prices` and `stock_indicators`.

#### Scenario: Run backtest with snapshot data
- **WHEN** user submits a backtest for symbol "600519" from 2025-01-01 to 2025-01-31
- **THEN** system loads `factor_snapshots` for that symbol and date range
- **AND** passes a DataFrame with OHLCV, technical columns, and event columns to the strategy

#### Scenario: Snapshot missing for some dates
- **GIVEN** backtest range includes dates without `factor_snapshots`
- **WHEN** backtest starts
- **THEN** system automatically generates missing snapshots before running the backtest

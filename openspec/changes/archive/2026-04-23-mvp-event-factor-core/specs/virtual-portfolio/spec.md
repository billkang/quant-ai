## ADDED Requirements

### Requirement: Positions are linked to backtest tasks
The system SHALL associate positions with a `backtest_task_id` instead of representing real trades. Positions reflect simulated holdings from a backtest run.

#### Scenario: Create virtual position from backtest
- **GIVEN** a backtest task completed with final holding of 100 shares of "600519"
- **WHEN** system saves the backtest result
- **THEN** it also creates a `strategy_positions` record linked to the backtest task

#### Scenario: Query positions for a backtest
- **WHEN** user sends `GET /api/portfolio?backtest_task_id=123`
- **THEN** system returns positions associated with that backtest task

### Requirement: Virtual positions track unrealized PnL
The system SHALL calculate and store unrealized PnL for virtual positions based on the latest closing price.

#### Scenario: Calculate PnL
- **GIVEN** a virtual position with `quantity: 100`, `avg_cost: 1800`, and current close price `1850`
- **WHEN** PnL is calculated
- **THEN** `unrealized_pnl` equals 5000

### Requirement: Virtual positions support active/inactive states
The system SHALL track whether a virtual position is currently active. Closed positions (zero quantity) are marked inactive.

#### Scenario: Close position
- **GIVEN** a virtual position with 100 shares
- **WHEN** a sell transaction reduces quantity to 0
- **THEN** the position's `is_active` is set to false

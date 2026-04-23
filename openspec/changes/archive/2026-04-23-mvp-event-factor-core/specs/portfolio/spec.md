## ADDED Requirements

### Requirement: Positions have backtest association
The system SHALL add `backtest_task_id`, `strategy_id`, `user_id`, and `is_active` fields to the positions model to support virtual portfolio tracking.

## MODIFIED Requirements

### Requirement: Portfolio positions represent virtual holdings
The portfolio system MUST treat positions as virtual/simulated holdings tied to backtest tasks rather than real trades.

#### Scenario: Get virtual portfolio
- **WHEN** user sends `GET /api/portfolio`
- **THEN** system returns active virtual positions for the user, including `backtestTaskId` and `strategyId`

#### Scenario: Add virtual position
- **WHEN** system creates a position from backtest trades
- **THEN** it sets `backtest_task_id` to the associated backtest and `is_active` to true

## REMOVED Requirements

### Requirement: Manual position and transaction entry
**Reason**: Portfolio is now derived from backtest results, not manually entered
**Migration**: Manual CRUD operations on positions are disabled. Positions are auto-generated from backtest `trades` JSON.

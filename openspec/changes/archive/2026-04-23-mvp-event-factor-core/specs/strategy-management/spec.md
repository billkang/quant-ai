## ADDED Requirements

### Requirement: Strategies can be created and managed
The system SHALL allow users to create, read, update, and delete strategy definitions. Each strategy has a name, description, category, strategy code identifier, and structured parameter schema.

#### Scenario: Create a custom strategy
- **WHEN** user sends `POST /api/strategies` with name, description, category, and params_schema
- **THEN** system creates the strategy and returns its ID

#### Scenario: List strategies
- **WHEN** user sends `GET /api/strategies`
- **THEN** system returns all strategies belonging to the user plus builtin strategies

#### Scenario: Update strategy metadata
- **WHEN** user sends `PUT /api/strategies/{id}` with new name or description
- **THEN** system updates the strategy

#### Scenario: Delete strategy
- **WHEN** user sends `DELETE /api/strategies/{id}`
- **THEN** system removes the strategy and all its versions

### Requirement: Strategies support version management
The system SHALL support versioning of strategy code and parameter schemas. Creating a new version SHALL NOT affect previous versions.

#### Scenario: Create new version
- **WHEN** user sends `POST /api/strategies/{id}/versions` with updated strategy_code and changelog
- **THEN** system creates a new version with incremented version_number

#### Scenario: List version history
- **WHEN** user sends `GET /api/strategies/{id}/versions`
- **THEN** system returns all versions ordered by version_number descending

### Requirement: Strategy parameters are structured via JSON Schema
The system SHALL validate strategy parameters against a JSON Schema defined in `params_schema`. Backtest requests with invalid parameters SHALL be rejected.

#### Scenario: Valid parameters pass validation
- **WHEN** backtest request includes `strategyParams: {"short": 5, "long": 20}` for an MA cross strategy
- **AND** the strategy's `params_schema` defines `short` as integer with min 2 max 60
- **THEN** system accepts the parameters and runs the backtest

#### Scenario: Invalid parameters are rejected
- **WHEN** backtest request includes `strategyParams: {"short": 200}`
- **AND** the schema defines max 60
- **THEN** system returns validation error with code != 0

### Requirement: Builtin strategies are available out of the box
The system SHALL provide builtin strategies that users can use without creation. Builtin strategies are read-only.

#### Scenario: List builtin strategies
- **WHEN** user sends `GET /api/strategies/builtin`
- **THEN** system returns builtin strategies including ma_cross, rsi_oversold, macd_signal

#### Scenario: Cannot delete builtin strategy
- **WHEN** user sends `DELETE /api/strategies/{id}` for a builtin strategy
- **THEN** system returns 403 Forbidden

### Requirement: Strategies can use event factors in signal generation
Strategies in the `event` or `combined` category SHALL have access to event factor columns from `factor_snapshots` during backtest execution.

#### Scenario: Combined strategy uses technical and event factors
- **GIVEN** a strategy with category "combined" and code "ma_event_filtered"
- **WHEN** backtest runs for a date range
- **THEN** the strategy receives DataFrame columns including both technical indicators (`ma5`, `rsi6`) and event factors (`avg_sentiment`, `event_strength`)

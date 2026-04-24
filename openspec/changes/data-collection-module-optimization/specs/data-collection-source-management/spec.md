## ADDED Requirements

### Requirement: Channel category management
The system SHALL support categorizing data collection channels into at least two categories: `stock_info` and `global_event`.

#### Scenario: View channels by category
- **WHEN** user navigates to the channel management page
- **THEN** channels SHALL be grouped and displayed by their assigned category

#### Scenario: Assign channel category
- **WHEN** administrator creates or edits a channel
- **THEN** the system SHALL allow selecting a category from the predefined list

### Requirement: Data source and channel decoupling
The system SHALL distinguish between built-in data sources and external collection channels. Built-in data sources SHALL NOT include external fetcher configurations such as Eastmoney individual stock news, Eastmoney stock announcements, A-share macro data, or Hong Kong stock news sources.

#### Scenario: View built-in data sources
- **WHEN** user opens the data source list
- **THEN** only system built-in sources (e.g., market data, K-line) SHALL be displayed
- **AND** external fetcher configurations SHALL NOT appear in the list

#### Scenario: View external channels
- **WHEN** user opens the channel management page
- **THEN** external fetcher configurations SHALL be listed under their respective categories

### Requirement: Channel activation
The system SHALL allow users to activate or deactivate individual channels via a checkbox or toggle control.

#### Scenario: Activate a channel
- **WHEN** user checks the activation checkbox for a deactivated channel
- **THEN** the channel SHALL be marked as enabled
- **AND** the scheduler SHALL include this channel in subsequent automatic collection runs

#### Scenario: Deactivate a channel
- **WHEN** user unchecks the activation checkbox for an active channel
- **THEN** the channel SHALL be marked as disabled
- **AND** the scheduler SHALL skip this channel in subsequent automatic collection runs
- **AND** existing historical data SHALL NOT be affected

### Requirement: Channel-data source mapping
Each channel SHALL maintain a mapping relationship to its corresponding data source type, indicating what kind of data it produces.

#### Scenario: View channel mapping
- **WHEN** user views channel details
- **THEN** the associated data source type or output data category SHALL be displayed

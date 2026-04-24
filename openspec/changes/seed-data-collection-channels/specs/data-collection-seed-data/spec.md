## ADDED Requirements

### Requirement: System provides seed data for data collection verification
The system SHALL include seed data that creates at least one built-in data source for each major category (A-share, HK stock, international news, financial news, sector data, macro data), with each data source containing at least one valid data channel.

#### Scenario: Application starts with seed data
- **WHEN** the application starts and seed scripts execute
- **THEN** the database SHALL contain built-in data sources with associated channels
- **AND** each channel SHALL have valid collection_method and endpoint fields

#### Scenario: Data source list shows all built-in sources
- **WHEN** user opens the data source list page
- **THEN** all built-in data sources SHALL be displayed
- **AND** each data source SHALL be expandable to show its associated channels

#### Scenario: Channel management shows seeded channels
- **WHEN** user navigates to channel management
- **THEN** all seeded channels SHALL be listed
- **AND** each channel SHALL display its parent data source name

## MODIFIED Requirements

### Requirement: Data source list returns all built-in sources
The data source list API SHALL return all records where `is_builtin = 1`, regardless of category or other filters.

#### Scenario: Request data source list
- **WHEN** client sends `GET /api/event-sources`
- **THEN** the response SHALL include all built-in data sources
- **AND** external (non-built-in) sources SHALL NOT be included

### Requirement: Collection monitoring aggregates by channel
The collection monitoring API SHALL aggregate job statistics by data channel (source_id) and return channel-level metrics.

#### Scenario: View collection monitoring
- **WHEN** client sends `GET /api/event-jobs/monitor`
- **THEN** the response SHALL contain aggregated statistics per channel
- **AND** each entry SHALL include channel name, total jobs, success count, failed count, and last run time

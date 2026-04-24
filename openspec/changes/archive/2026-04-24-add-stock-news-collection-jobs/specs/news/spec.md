## MODIFIED Requirements

### Requirement: Scheduled news collection interval
The system SHALL execute automatic news collection every hour instead of every 6 hours.

#### Scenario: Hourly scheduler trigger
- **WHEN** the system scheduler is running
- **THEN** the news collection task is triggered at the top of every hour (minute 0)

#### Scenario: Backward compatibility of source intervals
- **WHEN** a news source has `interval_minutes` configured
- **THEN** the hourly scheduler still respects each source's `interval_minutes` and `last_fetched_at` deduplication logic, skipping sources that are not yet due

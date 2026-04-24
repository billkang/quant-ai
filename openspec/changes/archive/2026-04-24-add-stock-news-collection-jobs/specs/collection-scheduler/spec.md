## ADDED Requirements

### Requirement: High-frequency stock collection during trading hours
The system SHALL execute stock collection every 5 minutes during A-share trading hours (09:30-11:30, 13:00-15:00, Monday-Friday).

#### Scenario: Trading hours active
- **WHEN** the current time is within 09:30-11:30 or 13:00-15:00 on a weekday
- **THEN** the scheduler triggers a stock collection job every 5 minutes

#### Scenario: Non-trading hours
- **WHEN** the current time is outside trading hours or on weekends/holidays
- **THEN** the scheduler skips the 5-minute stock collection trigger

### Requirement: Collection of watchlist quotes
Each stock collection job SHALL fetch the latest real-time quote for every stock in the user's watchlist.

#### Scenario: Watchlist has multiple stocks
- **WHEN** a stock collection job runs and the watchlist contains 10 stocks
- **THEN** the system fetches quotes for all 10 stocks and updates Redis cache with TTL 300 seconds

### Requirement: Collection of market indices
Each stock collection job SHALL fetch the latest real-time data for key market indices.

#### Scenario: Market indices update
- **WHEN** a stock collection job runs
- **THEN** the system fetches quotes for 上证指数 (000001), 深证成指 (399001), and 创业板指 (399006) and stores them in Redis under key `market:indices`

### Requirement: Collection of sector data
Each stock collection job SHALL fetch the latest sector/industry board performance data.

#### Scenario: Sector data update
- **WHEN** a stock collection job runs
- **THEN** the system fetches the top industry boards by change percentage and stores them in Redis under key `market:sectors`

### Requirement: Hourly news collection
The system SHALL execute news collection every hour for all enabled news sources.

#### Scenario: Hourly news fetch
- **WHEN** the clock hits the top of the hour
- **THEN** the scheduler triggers a news collection job that iterates all enabled `EventSource` and `news_sources` records, respects `interval_minutes` and `last_fetched_at` deduplication rules, and writes new articles to the database

#### Scenario: News collection respects source intervals
- **WHEN** a news source has `interval_minutes=120` and was fetched 30 minutes ago
- **THEN** the system skips that source and records `skipped` in the job log

### Requirement: Progress reporting in collection tasks
All collection tasks SHALL report progress to the corresponding `CollectionJob` record.

#### Scenario: Stock collection reports progress
- **WHEN** a stock collection job processes watchlist stocks
- **THEN** the system sets `total_items` to watchlist count before starting and increments `processed_items` after each stock, updating `progress` proportionally

#### Scenario: News collection reports progress
- **WHEN** a news collection job processes enabled sources
- **THEN** the system sets `total_items` to enabled source count and increments `processed_items` after each source fetch completes

### Requirement: Error handling and logging in collection tasks
Collection tasks SHALL capture errors per-item without failing the entire job.

#### Scenario: Single stock quote fails
- **WHEN** a stock collection job fetches 10 stocks and the 3rd stock API call throws an exception
- **THEN** the system logs the error with stock code to `error_log`, continues processing the remaining 7 stocks, and marks the job status as "completed" with partial success

#### Scenario: News source fetch fails
- **WHEN** a news collection job fetches 5 sources and the 2nd source throws an exception
- **THEN** the system logs the error with source name to `error_log`, continues processing the remaining 3 sources, and marks the job status as "completed" with partial success

### Requirement: Job overlap prevention
The scheduler SHALL prevent multiple instances of the same job type from running concurrently.

#### Scenario: Previous stock collection still running
- **WHEN** a 5-minute stock collection trigger fires while the previous stock collection job is still "running"
- **THEN** the scheduler skips the new trigger and logs a warning message

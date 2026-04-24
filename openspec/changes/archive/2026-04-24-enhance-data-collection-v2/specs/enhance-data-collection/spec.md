## ADDED Requirements

### Requirement: Data channel management
The system SHALL provide a `DataChannel` entity to manage external data source configurations.

#### Scenario: List channels
- **WHEN** user opens the "渠道管理" tab
- **THEN** the system displays a list of configured channels with name, provider, endpoint, timeout, and availability status

#### Scenario: Create channel
- **WHEN** user creates a new channel with provider "akshare" and timeout 30
- **THEN** the system stores the channel configuration and returns the new channel ID

#### Scenario: Update channel proxy
- **WHEN** user updates a channel's proxy configuration
- **THEN** the system persists the change and subsequent fetchers use the new proxy

### Requirement: Sector classification management
The system SHALL provide a `Sector` entity based on CSRC industry classification, allowing users to enable/disable sectors for data collection.

#### Scenario: List sectors
- **WHEN** user opens the "板块管理" tab
- **THEN** the system displays the CSRC industry classification tree with enable/disable toggles

#### Scenario: Toggle sector for collection
- **WHEN** user disables the "房地产业" sector
- **THEN** the "板块轮动数据" fetcher excludes this sector from subsequent collections

### Requirement: Built-in data source protection
The system SHALL prevent deletion of built-in EventSources.

#### Scenario: Attempt to delete built-in source
- **WHEN** user attempts to delete the "个股行情数据采集" built-in source
- **THEN** the system returns HTTP 400 with detail "内置数据源不可删除"

#### Scenario: Edit built-in source schedule
- **WHEN** user edits the schedule of a built-in source
- **THEN** the system allows the update and persists the new schedule

### Requirement: Stock price data collection
The system SHALL implement a `StockPriceFetcher` that collects daily price data for watchlist stocks.

#### Scenario: Collect watchlist prices
- **WHEN** the "个股行情数据采集" fetcher runs
- **THEN** the system fetches the latest daily prices for all stocks in the watchlist and stores them in `stock_daily_prices`

### Requirement: Stock fundamental data collection
The system SHALL implement a `StockFundamentalFetcher` that collects financial data for watchlist stocks.

#### Scenario: Collect watchlist fundamentals
- **WHEN** the "个股财务数据采集" fetcher runs
- **THEN** the system fetches the latest financial indicators for watchlist stocks and stores them in `stock_fundamentals`

### Requirement: Sector rotation data collection
The system SHALL implement a `SectorRotationFetcher` that collects sector performance data for enabled sectors.

#### Scenario: Collect enabled sectors
- **WHEN** the "板块轮动数据" fetcher runs
- **THEN** the system fetches performance data for all enabled sectors and caches it in Redis

### Requirement: International market data collection
The system SHALL implement an `InternationalFetcher` that collects global market index data.

#### Scenario: Collect world indices
- **WHEN** the "国际市场数据" fetcher runs
- **THEN** the system fetches data for configured world indices and caches it in Redis

### Requirement: Enhanced collection monitoring
The system SHALL provide enriched collection monitoring with filtering by source category and data detail view.

#### Scenario: Filter jobs by source type
- **WHEN** user selects "个股行情" filter in the monitoring tab
- **THEN** the system displays only jobs whose source type is "stock_price"

#### Scenario: View job data details
- **WHEN** user clicks "详情" on a completed "个股行情数据采集" job
- **THEN** the system displays a list of stock daily prices collected in that job

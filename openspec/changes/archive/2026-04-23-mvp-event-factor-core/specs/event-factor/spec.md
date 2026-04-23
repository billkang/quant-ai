## ADDED Requirements

### Requirement: Event sources are configurable
The system SHALL allow administrators to create, edit, enable/disable, and delete event data sources through the management API.

#### Scenario: Create a new event source
- **WHEN** admin sends `POST /api/event-sources` with valid configuration
- **THEN** system creates the source and returns its ID

#### Scenario: Toggle source enabled state
- **WHEN** admin sends `PUT /api/event-sources/{id}` with `enabled: false`
- **THEN** system stops scheduling new fetch jobs for this source

#### Scenario: Trigger manual fetch
- **WHEN** admin sends `POST /api/event-sources/{id}/trigger`
- **THEN** system immediately executes a fetch job for this source and returns job ID

### Requirement: Events are collected automatically by scope
The system SHALL support three event scopes: `individual` (stock-specific), `sector` (industry-level), and `market` (economy-wide). Each source has a default scope, and fetched events are tagged accordingly.

#### Scenario: Individual event from stock news
- **WHEN** stock news fetcher retrieves an article about "600519"
- **THEN** system creates an `individual` scope event with `symbol: "600519"`

#### Scenario: Sector event from industry policy
- **WHEN** industry policy fetcher retrieves a policy about "new energy vehicles"
- **THEN** system creates a `sector` scope event with `sector: "汽车制造业"` (CSRC classification)

#### Scenario: Market event from macro data
- **WHEN** macro data fetcher retrieves "CPI released at 2.5%"
- **THEN** system creates a `market` scope event with `symbol: null` and `sector: null`

### Requirement: Events are deduplicated by title similarity
The system SHALL deduplicate events using title text similarity. Events with similarity score > 0.85 to an existing event within 7 days SHALL be rejected as duplicates.

#### Scenario: Same event from different sources
- **WHEN** fetcher retrieves "茅台发布2025年业绩预告" from source A
- **AND** within the same day fetcher retrieves "贵州茅台披露2025业绩预告" from source B
- **THEN** system stores the first event and rejects the second as duplicate (similarity > 0.85)

#### Scenario: Distinct events pass deduplication
- **WHEN** fetcher retrieves two different news articles with titles about unrelated topics
- **THEN** both events are stored

### Requirement: Events have extracted quantitative signals
The system SHALL extract structured signals from each event: `sentiment` (-1 to 1), `strength` (0 to 1), `certainty` (0 to 1), `urgency` (0 to 1), `duration`, and `tags`.

#### Scenario: Positive stock news
- **WHEN** an event titled "600519 季度净利润同比增长30%超预期" is processed
- **THEN** system extracts signals with sentiment > 0.5, strength > 0.6, tags containing ["earnings", "positive"]

#### Scenario: Negative policy news
- **WHEN** an event titled "监管层加强对白酒行业价格管控" is processed
- **THEN** system extracts signals with sentiment < -0.3, strength > 0.5, tags containing ["policy", "regulation"]

### Requirement: Extraction rules are versioned
The system SHALL support versioning of extraction rules (sentiment keywords, event classifiers, sector mappers). Only one version per rule type can be active at a time.

#### Scenario: Update sentiment dictionary
- **WHEN** admin creates a new version of sentiment_extractor rule via `POST /api/event-rules`
- **THEN** system creates the new version with `is_active: false`

#### Scenario: Activate new rule version
- **WHEN** admin sends `POST /api/event-rules/{id}/activate`
- **THEN** system deactivates the previous active version of the same rule type and activates the new one

### Requirement: Events can be edited and deleted by users
The system SHALL allow authenticated users to edit or delete automatically collected events.

#### Scenario: Edit event signals
- **WHEN** user sends `PUT /api/events/{id}` with corrected signals
- **THEN** system updates the event and triggers regeneration of affected `event_factors`

#### Scenario: Delete false positive event
- **WHEN** user sends `DELETE /api/events/{id}`
- **THEN** system removes the event and triggers regeneration of affected `event_factors`

### Requirement: Daily event factors are aggregated per symbol
The system SHALL aggregate all events per `symbol + trade_date` into a single `event_factors` record containing `individual_events`, `sector_events`, `market_events`, and `composite` score.

#### Scenario: Aggregate multiple individual news
- **GIVEN** symbol "600519" has 5 individual events on 2025-01-15
- **WHEN** daily aggregation runs
- **THEN** system creates one `event_factors` record with `individual_events.news_count: 5` and averaged sentiment scores

#### Scenario: Include sector and market events
- **GIVEN** on 2025-01-15 there are sector events for "白酒" and market events about CPI
- **WHEN** daily aggregation runs for symbol "600519" (in sector "白酒")
- **THEN** the `event_factors` record includes both `sector_events` and `market_events`

### Requirement: Fetch jobs are auditable
The system SHALL record every fetch execution as an `event_job` with status, counts, logs, and timestamps.

#### Scenario: Successful fetch job
- **WHEN** a scheduled fetch completes with 15 new events, 32 duplicates, 0 errors
- **THEN** system creates an `event_job` record with `status: "success"`, `new_events_count: 15`, `duplicate_count: 32`

#### Scenario: Failed fetch job
- **WHEN** a fetch fails due to network error
- **THEN** system creates an `event_job` with `status: "failed"`, `error_message` containing the exception, and updates `event_sources.last_error`

### Requirement: Sector mapping uses CSRC industry classification
The system SHALL use CSRC (证监会) industry classification for sector-level events and stock-to-sector mapping.

#### Scenario: Map stock to sector
- **WHEN** system needs to determine sector for symbol "600519"
- **THEN** it looks up the CSRC classification ("酒、饮料和精制茶制造业")

#### Scenario: Sector event affects all stocks in sector
- **GIVEN** a sector event for "酒、饮料和精制茶制造业"
- **WHEN** daily aggregation runs
- **THEN** the event is included in `sector_events` for all symbols mapped to that sector

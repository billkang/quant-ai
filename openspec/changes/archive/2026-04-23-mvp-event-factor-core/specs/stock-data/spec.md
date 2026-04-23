## ADDED Requirements

### Requirement: Stock data API provides event factor query
The system SHALL provide an endpoint to query daily event factors for a symbol.

#### Scenario: Query event factors
- **WHEN** user sends `GET /api/stocks/600519/event-factors?start=2025-01-01&end=2025-01-31`
- **THEN** system returns array of `event_factors` records for that symbol and date range

### Requirement: Stock data includes sector mapping
The system SHALL provide an endpoint to query a stock's CSRC sector classification.

#### Scenario: Query stock sector
- **WHEN** user sends `GET /api/stocks/600519/sector`
- **THEN** system returns `{ "sector": "酒、饮料和精制茶制造业", "sectorCode": "C15" }`

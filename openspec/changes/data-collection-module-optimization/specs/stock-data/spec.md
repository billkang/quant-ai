## ADDED Requirements

### Requirement: Data source list scope restriction
The data source list page SHALL only display system built-in data sources. External fetcher configurations previously shown in the data source list SHALL be removed from this page and managed under Channel Management instead.

#### Scenario: View restricted data source list
- **WHEN** user opens the data source list page
- **THEN** only built-in sources such as market quotation and K-line data SHALL be displayed
- **AND** external fetchers (Eastmoney news, Eastmoney announcements, A-share macro data, HK stock news) SHALL NOT appear

#### Scenario: Navigate to external fetcher management
- **WHEN** user needs to manage external fetchers
- **THEN** the system SHALL provide a link or instruction directing the user to the Channel Management page

## MODIFIED Requirements

### Requirement: Data source list page content
The data source list page previously displayed all configured data sources including external fetchers. The page SHALL now only display built-in system data sources.

#### Scenario: Historical data source view
- **WHEN** user previously bookmarked or accessed the data source list
- **THEN** the page SHALL no longer show external fetcher entries
- **AND** a navigation hint SHALL guide users to Channel Management for external fetchers

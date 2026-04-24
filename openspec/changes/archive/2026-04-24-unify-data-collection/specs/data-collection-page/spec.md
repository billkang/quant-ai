## ADDED Requirements

### Requirement: Unified data collection page
The system SHALL provide a unified "数据采集" page accessible at `/data-collection` that consolidates all data collection management functions.

#### Scenario: Page loads with sources tab
- **WHEN** user navigates to `/data-collection`
- **THEN** the page displays the "采集源" tab by default, showing the EventSource list

#### Scenario: Switch to monitoring tab
- **WHEN** user clicks the "采集监控" tab
- **THEN** the page displays a unified list of all collection jobs (EventJob and CollectionJob)

### Requirement: Data source detail drawer
The system SHALL display a detail drawer when user clicks on a data source row, showing the source's basic information and historical collection jobs.

#### Scenario: Open source detail
- **WHEN** user clicks a row in the EventSource table
- **THEN** a Drawer slides out from the right showing the source's name, type, scope, schedule, config, and a table of historical EventJobs for this source

#### Scenario: Edit source in drawer
- **WHEN** user clicks "编辑" in the source detail drawer
- **THEN** the basic information section becomes an editable form with Save/Cancel buttons

### Requirement: EventSource edit capability
The system SHALL allow users to edit existing EventSource configurations through the UI.

#### Scenario: Save edit
- **WHEN** user modifies an EventSource's schedule and clicks Save
- **THEN** the system calls `PUT /api/event-sources/{id}` and refreshes the source list

### Requirement: Fetch error handling
The system SHALL return a clear error message when manual fetch fails, instead of a generic 500 error.

#### Scenario: Unknown source type
- **WHEN** user triggers fetch for a source with unknown `source_type`
- **THEN** the API returns `{"code": 0, "data": {"status": "error", "message": "..."}}` with a descriptive message

#### Scenario: AkShare fetch failure
- **WHEN** user triggers fetch and akshare API throws an exception
- **THEN** the job is marked as failed with the exception message, and the trigger API returns the error details

### Requirement: Filter EventJobs by source
The system SHALL support filtering EventJobs by `source_id`.

#### Scenario: Query jobs for a specific source
- **WHEN** user sends `GET /api/event-jobs?source_id=42`
- **THEN** the system returns only EventJobs whose `source_id` equals 42

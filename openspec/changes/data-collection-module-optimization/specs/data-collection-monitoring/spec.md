## ADDED Requirements

### Requirement: Collection monitoring filters
The collection monitoring page SHALL support filtering by collection time range, collection type (automatic/manual), collection source, and channel.

#### Scenario: Filter by time range
- **WHEN** user selects a start and end date in the monitoring page filter bar
- **THEN** only collection jobs within the selected time range SHALL be displayed

#### Scenario: Filter by collection type
- **WHEN** user selects "automatic" from the collection type filter
- **THEN** only automatically triggered collection jobs SHALL be displayed
- **WHEN** user selects "manual"
- **THEN** only manually triggered collection jobs SHALL be displayed

#### Scenario: Filter by collection source and channel
- **WHEN** user selects a specific collection source from the source filter dropdown
- **THEN** only jobs originating from that source SHALL be displayed
- **WHEN** user further selects a specific channel
- **THEN** only jobs for that channel under the selected source SHALL be displayed

### Requirement: Tree-structured monitoring details
The collection monitoring list SHALL support a tree-structured view with collection source as the root node, channels as second-level nodes, and individual collected data items as leaf nodes.

#### Scenario: Expand collection source
- **WHEN** user clicks to expand a collection source node
- **THEN** the channels under that source SHALL be loaded and displayed

#### Scenario: Expand channel to view data
- **WHEN** user clicks to expand a channel node
- **THEN** the specific collected data items (events/news/announcements) under that channel SHALL be loaded and displayed
- **AND** each item SHALL show its title, collection time, and status

#### Scenario: View data item detail
- **WHEN** user clicks on a specific collected data item in the tree
- **THEN** a detail panel or modal SHALL display the full content of that item

### Requirement: Monitoring data aggregation
The system SHALL aggregate collection monitoring data by source and channel to support the tree view, while preserving the ability to view individual records.

#### Scenario: Aggregate job statistics
- **WHEN** user views the monitoring page
- **THEN** each source node SHALL display aggregated statistics (total jobs, success count, failure count) for its child channels

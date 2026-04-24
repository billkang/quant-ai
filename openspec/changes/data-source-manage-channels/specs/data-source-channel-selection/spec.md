## ADDED Requirements

### Requirement: Data source can be associated with multiple channels
The system SHALL allow an EventSource to be linked to zero or more DataChannels through a source_channel_links association table.

#### Scenario: Associate channels to a data source
- **WHEN** admin sends `POST /api/event-sources/{id}/channels` with a list of `channel_ids`
- **THEN** the system SHALL create entries in `source_channel_links` for each `(source_id, channel_id)` pair
- **AND** duplicate associations SHALL be ignored

#### Scenario: Remove channel association from a data source
- **WHEN** admin sends `DELETE /api/event-sources/{id}/channels/{channel_id}`
- **THEN** the corresponding entry in `source_channel_links` SHALL be removed
- **AND** the DataChannel itself SHALL NOT be deleted

### Requirement: Channel can be referenced by multiple data sources
The system SHALL allow a single DataChannel to be linked to multiple EventSources simultaneously.

#### Scenario: Same channel referenced by two sources
- **WHEN** channel "新浪财经" is associated with both "财经资讯" and "A股个股信息"
- **THEN** both data sources SHALL list the channel in their `GET /api/event-sources/{id}/channels` response
- **AND** the channel SHALL appear in both sources' channel selection UI

### Requirement: API returns selected channel IDs for data sources
The system SHALL include `selected_channel_ids` in the response of `GET /api/event-sources` and `GET /api/event-sources/{id}`.

#### Scenario: List data sources with selected channels
- **WHEN** client requests `GET /api/event-sources`
- **THEN** each source object SHALL contain a `selected_channel_ids` array
- **AND** the array SHALL contain the IDs of all channels linked via `source_channel_links`

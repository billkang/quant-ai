## ADDED Requirements

### Requirement: Manual trigger respects source-channel associations
When a data source is manually triggered, the system SHALL execute only the channels explicitly selected for that source via `source_channel_links`. If no channels are selected, it SHALL fall back to all channels whose `data_source_id` matches the source and `enabled=1`.

#### Scenario: Trigger source with selected channels
- **WHEN** source "宏观数据" has channels ["中国宏观经济指标"] selected
- **AND** admin sends `POST /api/event-sources/{source_id}/trigger`
- **THEN** only the selected channel(s) SHALL be executed
- **AND** EventJob records SHALL have `channel_id` populated

#### Scenario: Trigger source without selected channels
- **WHEN** source "宏观数据" has no selected channels
- **AND** admin sends `POST /api/event-sources/{source_id}/trigger`
- **THEN** the system SHALL fall back to all default channels where `data_source_id = source.id` and `enabled = 1`

## MODIFIED Requirements

### Requirement: Data source list returns built-in sources with selected channels
The data source list API SHALL continue to return all `is_builtin=1` sources, and each source SHALL additionally include a `selected_channel_ids` field.

#### Scenario: Request data source list
- **WHEN** client sends `GET /api/event-sources`
- **THEN** the response SHALL include all built-in data sources
- **AND** each source SHALL contain `selected_channel_ids` reflecting its `source_channel_links`

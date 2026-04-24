## MODIFIED Requirements

### Requirement: Collection monitoring aggregates by channel across all sources
The collection monitoring API SHALL aggregate job statistics by `channel_id`. If a channel is linked to multiple sources, the monitoring entry SHALL display the channel name and a comma-separated list of referencing source names.

#### Scenario: View monitoring for a channel referenced by multiple sources
- **WHEN** channel "新浪财经" is linked to sources "财经资讯" and "A股个股信息"
- **AND** client sends `GET /api/event-jobs/monitor`
- **THEN** the aggregated entry for that channel SHALL show `dataSourceName` as "财经资讯, A股个股信息"
- **AND** job counts SHALL reflect all jobs with that `channel_id` regardless of `source_id`

### Requirement: Job list supports filtering by source or channel
The `GET /api/event-jobs` endpoint SHALL continue to support `source_id` and `channel_id` filters independently.

#### Scenario: Filter jobs by channel only
- **WHEN** client sends `GET /api/event-jobs?channel_id=5`
- **THEN** the response SHALL return all jobs whose `channel_id = 5` across any source

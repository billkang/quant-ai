## ADDED Requirements

### Requirement: CollectionJob data model
The system SHALL provide a `CollectionJob` entity to track the lifecycle of every collection task.

#### Scenario: Job record is created on task start
- **WHEN** a collection task starts
- **THEN** the system creates a `CollectionJob` with `status="running"`, `progress=0`, `processed_items=0`, and `start_time` set to current timestamp

#### Scenario: Job record is updated on progress
- **WHEN** a collection task processes items
- **THEN** the system updates `processed_items`, `progress=round(processed_items/total_items*100, 2)`, and `updated_at`

#### Scenario: Job record is finalized on completion
- **WHEN** a collection task finishes or fails
- **THEN** the system sets `status` to "completed" or "failed", `end_time` to current timestamp, and appends any error message to `error_log`

### Requirement: Job list query API
The system SHALL expose `GET /api/collection/jobs` to return a paginated list of collection jobs.

#### Scenario: Query all jobs
- **WHEN** user sends `GET /api/collection/jobs?page=1&pageSize=20`
- **THEN** the system returns an array of jobs ordered by `created_at DESC` with pagination metadata

#### Scenario: Filter by status
- **WHEN** user sends `GET /api/collection/jobs?status=running`
- **THEN** the system returns only jobs whose `status` equals "running"

#### Scenario: Filter by job type
- **WHEN** user sends `GET /api/collection/jobs?jobType=stock_collection`
- **THEN** the system returns only jobs whose `job_type` equals "stock_collection"

### Requirement: Job detail API
The system SHALL expose `GET /api/collection/jobs/{id}` to return the full details of a single collection job.

#### Scenario: Retrieve existing job
- **WHEN** user sends `GET /api/collection/jobs/42`
- **THEN** the system returns the job object including `id`, `job_type`, `status`, `progress`, `total_items`, `processed_items`, `error_log`, `start_time`, `end_time`, and timestamps

#### Scenario: Retrieve non-existent job
- **WHEN** user sends `GET /api/collection/jobs/99999`
- **THEN** the system returns HTTP 404 with detail "任务不存在"

### Requirement: Manual trigger API
The system SHALL expose `POST /api/collection/jobs/trigger` to allow manual initiation of a collection task.

#### Scenario: Trigger stock collection
- **WHEN** user sends `POST /api/collection/jobs/trigger` with body `{"job_type": "stock_collection"}`
- **THEN** the system creates a `CollectionJob` with status "running", starts the stock collection task in the background, and returns the job `id`

#### Scenario: Trigger news collection
- **WHEN** user sends `POST /api/collection/jobs/trigger` with body `{"job_type": "news_collection"}`
- **THEN** the system creates a `CollectionJob` with status "running", starts the news collection task in the background, and returns the job `id`

### Requirement: Cancel job API
The system SHALL expose `POST /api/collection/jobs/{id}/cancel` to request cancellation of a running job.

#### Scenario: Cancel running job
- **WHEN** user sends `POST /api/collection/jobs/42/cancel` for a job with status "running"
- **THEN** the system sets an internal cancellation flag for that job and updates `status` to "cancelled" within 5 seconds

#### Scenario: Cancel already completed job
- **WHEN** user sends `POST /api/collection/jobs/42/cancel` for a job with status "completed"
- **THEN** the system returns HTTP 400 with detail "任务已结束，无法取消"

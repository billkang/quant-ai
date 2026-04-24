## ADDED Requirements

### Requirement: Unified data management module
The system SHALL provide a unified "Data Management" module that consolidates the entry points for data collection, event query, and data management functionality.

#### Scenario: Navigate to unified module
- **WHEN** user clicks "数据管理" in the main navigation menu
- **THEN** the system SHALL navigate to the unified Data Management page
- **AND** the page SHALL display sub-functionalities via tabs or secondary navigation

### Requirement: Sub-function tabs
The Data Management module SHALL present sub-functions as tabs, including at minimum: Data Sources, Channel Management, Event Query, and Collection Monitoring.

#### Scenario: Switch between tabs
- **WHEN** user is on the Data Management page
- **THEN** tabs for each sub-function SHALL be visible
- **WHEN** user clicks a different tab
- **THEN** the content area SHALL switch to display the corresponding sub-function without a full page reload

### Requirement: Legacy navigation redirection
Existing navigation entries for "数据采集", "事件查询", and "数据管理" (if duplicated) SHALL redirect to or be replaced by the unified "数据管理" entry.

#### Scenario: Access legacy route
- **WHEN** user attempts to navigate to the legacy standalone "数据采集" or "事件查询" route
- **THEN** the system SHALL redirect to the corresponding tab within the unified "数据管理" module

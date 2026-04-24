## ADDED Requirements

### Requirement: Event query integrated into data management
The event query functionality SHALL be accessible as a sub-tab within the unified "Data Management" module, while preserving all existing query, editing, and management capabilities.

#### Scenario: Access event query from data management
- **WHEN** user navigates to "数据管理" and selects the "事件查询" tab
- **THEN** the event query interface SHALL be displayed with all existing filters and actions available
- **AND** the event list, edit, delete, and trigger operations SHALL function identically to the standalone page

#### Scenario: Deep link to event query
- **WHEN** user accesses the legacy event query URL directly
- **THEN** the system SHALL redirect to the "数据管理" page with the "事件查询" tab pre-selected

## MODIFIED Requirements

### Requirement: Event query navigation entry
The standalone top-level navigation entry for "事件查询" SHALL be removed from the main sidebar menu and replaced by the "数据管理" unified entry.

#### Scenario: Main menu navigation
- **WHEN** user views the main application sidebar
- **THEN** "事件查询" SHALL NOT appear as a top-level menu item
- **AND** "数据管理" SHALL be present and expandable or navigable to reveal sub-functions including event query

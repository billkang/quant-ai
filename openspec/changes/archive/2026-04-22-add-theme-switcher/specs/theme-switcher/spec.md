## ADDED Requirements

### Requirement: System provides multiple color themes
The system SHALL provide at least three distinct color themes, each with a unique Chinese name:
- **深海蓝** (ocean-blue): Deep blue dark theme, retained as the default
- **晨曦白** (dawn-white): Clean light theme for daytime usage
- **极夜黑** (midnight-black): Pure dark theme with high contrast

Each theme SHALL define a complete set of color tokens covering background, surface, elevated, text (primary/secondary/muted), accent, border, market colors (up/down), and shadows.

#### Scenario: Default theme on first visit
- **WHEN** a user opens the application for the first time
- **THEN** the system applies the 「深海蓝」 theme by default

#### Scenario: Theme variable completeness
- **WHEN** inspecting any theme definition
- **THEN** all CSS custom properties referenced by the application are present and have valid color values

### Requirement: User can switch themes via UI
The system SHALL expose a theme switcher control in the global layout (header or sidebar) that allows the user to select any available theme. The switcher SHALL be accessible from every page.

#### Scenario: Successful theme switch
- **WHEN** user opens the theme switcher dropdown and clicks a different theme
- **THEN** the entire application immediately updates to the selected theme without requiring a page refresh

#### Scenario: Switcher visibility
- **WHEN** user navigates to any page in the application
- **THEN** the theme switcher control is visible and functional

### Requirement: Theme preference is persisted
The system SHALL persist the user's selected theme identifier to browser localStorage under the key `quant-ai-theme`. On subsequent visits, the system SHALL automatically restore the saved theme before the first paint to avoid flash of un-themed content (FOUT).

#### Scenario: Theme survives refresh
- **WHEN** user selects 「极夜黑」 theme and refreshes the browser
- **THEN** the application loads with 「极夜黑」 theme already applied

#### Scenario: First-time visitor
- **WHEN** a user with no prior visit opens the application
- **THEN** the system uses the default 「深海蓝」 theme and does not write to localStorage until the user explicitly changes the theme

### Requirement: Ant Design components follow the active theme
The system SHALL synchronize Ant Design's runtime theme tokens (`colorPrimary`, `colorBgBase`, `colorTextBase`, `colorBorder`, etc.) with the active custom theme so that all AntD components render in a style consistent with the custom CSS variables.

#### Scenario: AntD Button matches theme
- **WHEN** the active theme is 「晨曦白」
- **THEN** an Ant Design primary button uses the light theme's accent color and readable text color

#### Scenario: AntD Card matches theme
- **WHEN** the active theme is 「极夜黑」
- **THEN** an Ant Design card uses the dark background and border colors defined by the theme

### Requirement: Theme switch is flicker-free
The system SHALL ensure that theme switching does not cause visible layout shifts, flashes of the previous theme, or unstyled content. The transition between themes SHOULD be smooth (CSS transition on color properties where feasible).

#### Scenario: No flash on theme change
- **WHEN** user switches from 「深海蓝」 to 「晨曦白」
- **THEN** the color transition is smooth and no intermediate unstyled state is visible

#### Scenario: No flash on page load
- **WHEN** a returning user loads the application
- **THEN** the saved theme is applied before React hydrates, preventing any flash of the default theme

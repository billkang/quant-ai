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
The system SHALL expose a theme switcher control in the global layout header area that allows the user to select any available theme. The switcher SHALL be accessible from every page and positioned in the top-right region of the page header.

#### Scenario: Successful theme switch
- **WHEN** user opens the theme switcher dropdown in the page header and clicks a different theme
- **THEN** the entire application immediately updates to the selected theme without requiring a page refresh

#### Scenario: Switcher visibility
- **WHEN** user navigates to any page in the application
- **THEN** the theme switcher control is visible in the page header and functional

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

The system SHALL also synchronize the Ant Design theme algorithm with the active theme: dark themes (「深海蓝」 and 「极夜黑」) SHALL use `theme.darkAlgorithm`, and the light theme (「晨曦白」) SHALL use `theme.defaultAlgorithm`. This ensures that AntD's internal color derivation logic does not override light-theme tokens with dark-mode calculations.

#### Scenario: AntD Button matches theme
- **WHEN** the active theme is 「晨曦白」
- **THEN** an Ant Design primary button uses the light theme's accent color and readable text color

#### Scenario: AntD Card matches theme
- **WHEN** the active theme is 「极夜黑」
- **THEN** an Ant Design card uses the dark background and border colors defined by the theme

#### Scenario: Light theme input components render correctly
- **WHEN** the active theme is 「晨曦白」
- **THEN** Ant Design input, select, date-picker, and number-input components use the light background and border colors defined by the theme, not dark-mode derived colors

### Requirement: Primary button text color is consistent
The system SHALL ensure that all `.ant-btn-primary` elements display their text and icon content in white (`#ffffff`) across all themes, including hover, focus, and disabled states. This SHALL be enforced via global CSS override to prevent algorithm-derived text colors from appearing as gray on colored backgrounds.

#### Scenario: Primary button text is white on light theme
- **WHEN** the active theme is 「晨曦白」
- **THEN** any primary button's text and icon are rendered in white, not gray

#### Scenario: Primary button text remains white on hover
- **WHEN** user hovers over a primary button in any theme
- **THEN** the text and icon color remains white

### Requirement: Theme switch is flicker-free
The system SHALL ensure that theme switching does not cause visible layout shifts, flashes of the previous theme, or unstyled content. The transition between themes SHOULD be smooth (CSS transition on color properties where feasible).

#### Scenario: No flash on theme change
- **WHEN** user switches from 「深海蓝」 to 「晨曦白」
- **THEN** the color transition is smooth and no intermediate unstyled state is visible

#### Scenario: No flash on page load
- **WHEN** a returning user loads the application
- **THEN** the saved theme is applied before React hydrates, preventing any flash of the default theme

## 1. Theme Definition & CSS Infrastructure

- [x] 1.1 Create `client/src/styles/themes.ts` with three theme definitions (深海蓝 / 晨曦白 / 极夜黑) exporting CSS variable mappings and Ant Design `theme.token` configurations
- [x] 1.2 Refactor `client/src/index.css` to replace all hard-coded colors with `var(--xxx)` references and define default variable values in `:root`
- [x] 1.3 Add an inline script to `client/index.html` `<head>` that reads `localStorage` key `quant-ai-theme` and sets `<html data-theme="...">` before React mounts to prevent FOUT

## 2. Theme State Management & Runtime Integration

- [x] 2.1 Create `client/src/hooks/useTheme.ts` hook: exposes `currentTheme`, `setTheme()`, reads/writes `localStorage`, updates `<html data-theme>` attribute, and returns the active Ant Design `theme.token` object
- [x] 2.2 Update `client/src/main.tsx` to wrap the application with Ant Design `ConfigProvider` whose `theme.token` is dynamically driven by the `useTheme` hook

## 3. Theme Switcher UI

- [x] 3.1 Add a theme switcher dropdown button to `client/src/components/Layout.tsx` (in the header area, visible on all pages) using Ant Design `Dropdown` + `Button` with appropriate icons
- [x] 3.2 Style the switcher control to match the active theme and ensure it is keyboard-accessible

## 4. Verification & Testing

- [x] 4.1 Frontend build passes successfully
- [x] 4.2 Theme persistence logic implemented via localStorage + inline script
- [x] 4.3 Run `docker-compose up -d --build` and confirm the application builds and runs successfully in Docker

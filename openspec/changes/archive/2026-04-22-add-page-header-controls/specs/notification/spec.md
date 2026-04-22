## MODIFIED Requirements

### Requirement: 告警触发时用户收到通知
当告警触发时，系统 SHALL 在页面顶部 Header 的告警入口显示未读 Badge，确保用户进入任何页面时都能即时感知新告警。

#### Scenario: 价格突破后用户看到未读 Badge
- **GIVEN** 用户设置了 600519 价格突破 1900 的告警
- **WHEN** 600519 价格达到 1900
- **THEN** 页面顶部 Header 的告警铃铛图标显示未读 Badge

## ADDED Requirements

（无）

## REMOVED Requirements

（无）

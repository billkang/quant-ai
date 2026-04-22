## Context

当前项目的端到端测试位于 `server/tests/e2e/`，使用 FastAPI `TestClient` 直接调用后端 API。这种测试方式虽然能验证 API 契约和业务逻辑，但存在以下盲区：
- 无法检测前端组件渲染异常、CSS 样式问题、JavaScript 运行时错误
- 无法验证用户真实交互路径（点击、表单填写、页面跳转、Ant Design 组件行为）
- 无法覆盖跨域、Cookie/Session 在浏览器中的实际表现
- 无法发现浏览器兼容性（如 Chrome/Firefox/Safari 差异）问题

Playwright 是由 Microsoft 维护的现代浏览器自动化框架，支持 Chromium、Firefox 和 WebKit，提供自动等待、Trace Viewer、截图/视频录制、Codegen 等能力，非常适合作为真正的 E2E 测试工具。

## Goals / Non-Goals

**Goals:**
- 在 `client/` 目录建立可维护的 Playwright E2E 测试框架
- 实现 Page Object Model（POM）模式，将页面元素定位与测试逻辑解耦
- 编写覆盖核心用户旅程的 E2E 测试用例：注册/登录、Dashboard、选股器、投资组合、量化分析、AI 对话、通知中心
- 提供测试数据种子机制，确保每次测试运行在一致的初始状态下
- 支持本地开发调试（ headed 模式 + UI 模式）和 CI 无头运行
- 与现有 Docker Compose 编排集成，能在容器化环境中运行

**Non-Goals:**
- 不替代现有 `server/tests/e2e/` 的 API 集成测试（两者互补）
- 不替代 `client/` 的 Vitest 单元测试
- 不要求 100% 页面覆盖，优先保障核心用户旅程的“黄金路径”
- 不测试外部数据源（AkShare、yfinance、DeepSeek API）的真实返回，相关外部调用在 E2E 中保持 Mock 或依赖种子数据
- 不引入视觉回归测试（Visual Regression Testing）—— 仅验证功能行为

## Decisions

### 1. 使用 Playwright 而非 Cypress 或 Selenium
- **Rationale**: Playwright 原生支持多浏览器（Chromium/Firefox/WebKit），自动等待机制减少 flaky tests，Trace Viewer 提供强大的调试能力，与 Docker 和 CI 集成更顺畅。Codegen 功能可加速测试编写。
- **Alternatives considered**: Cypress（仅支持 Chromium 系浏览器，跨域处理复杂）；Selenium（生态老旧，配置繁琐，等待机制弱）。

### 2. E2E 测试代码放在 `client/e2e/` 而非独立仓库
- **Rationale**: E2E 测试的对象是前端应用，与前端代码同仓库便于版本同步、共享类型定义、随前端 PR 一起评审。Playwright 官方也推荐此模式。
- **Alternatives considered**: 独立 `e2e-tests/` 仓库（增加同步成本，不利于本地开发快速迭代）。

### 3. 采用 Page Object Model（POM）模式
- **Rationale**: 将页面元素选择器和交互逻辑封装在 `client/e2e/pages/` 下的类中，测试用例只关注业务流程。当 UI 变更时，只需修改 POM 文件，减少测试维护成本。
- **Structure**: `BasePage`（通用方法如 `goto`, `waitForLoad`）→ `LoginPage`, `DashboardPage`, `ScreenerPage`, `PortfolioPage`, `QuantPage`, `AiChatPage`, `NotificationPage`。

### 4. 测试数据通过后端 API Seed Endpoint 预置，而非 UI 操作
- **Rationale**: 通过 UI 一步步创建测试数据（如注册 → 登录 → 添加股票到自选）会导致测试冗长、缓慢且不稳定。使用 Playwright 的 `request` fixture 直接调用内部 Seed API 初始化数据，测试用例从已登录状态直接开始业务验证。
- **Security**: Seed API 仅在 `NODE_ENV=test` 或 Docker E2E profile 下暴露，生产环境禁用。

### 5. Docker Compose 中新增 `playwright` 服务，依赖 `client` 和 `server`
- **Rationale**: 保证 E2E 测试在一致的环境中运行，避免开发者本地环境差异导致测试失败。`playwright` 服务使用官方 `mcr.microsoft.com/playwright` 镜像，内置浏览器依赖。
- **Run mode**: 默认无头模式（`headless: true`），失败时自动保存截图和视频到 `client/playwright-report/`。

### 6. 配置 `fullyParallel: false` 并配合 `testIsolation: 'build'`（或按流程分组）
- **Rationale**: 部分用户旅程（如登录 → Dashboard → 选股器）具有状态依赖。使用 `fullyParallel: false` 配合 `project` 分组，确保依赖顺序的测试串行执行；独立无状态测试可并行。
- **Alternative**: 每个测试完全独立（登录/注销在每个测试前后执行）—— 太慢，浪费 CI 资源。

## Risks / Trade-offs

- **[Risk] Flaky tests 因网络延迟或 Ant Design 动画导致** → **Mitigation**: 全局禁用 CSS 动画（`prefers-reduced-motion` 或注入样式），使用 Playwright 自动等待策略，为不稳定操作增加显式 `waitFor`。
- **[Risk] 维护成本高，UI 频繁变更导致选择器失效** → **Mitigation**: 统一使用 `data-testid` 属性定位元素（避免依赖文本或 CSS 类），POM 模式集中管理选择器。
- **[Risk] E2E 测试运行时间长，拖慢 CI 反馈** → **Mitigation**: 仅覆盖核心用户旅程（<30 个测试文件），CI 中并行运行（sharding），失败用例优先重试（`retries: 2`）。
- **[Risk] Docker 中 Playwright 容器体积大** → **Mitigation**: 仅安装 Chromium（`npx playwright install chromium`），不安装 Firefox/WebKit 除非需要。
- **[Risk] 种子数据 API 被意外暴露** → **Mitigation**: 种子路由通过环境变量开关控制，默认关闭；Docker E2E  profile 中通过独立网络隔离。

## Migration Plan

1. **Phase 1**: 初始化 Playwright 框架（安装依赖、配置 `playwright.config.ts`、添加 `.gitignore`）
2. **Phase 2**: 实现 `BasePage` 和核心页面的 POM（Login、Dashboard）
3. **Phase 3**: 编写第一批核心用户旅程测试（登录 → Dashboard → 选股器）
4. **Phase 4**: 扩展剩余页面测试（投资组合、量化分析、AI 对话、通知）
5. **Phase 5**: 集成 Docker Compose 和 CI pipeline，验证全流程

**Rollback**: 若发现 Playwright 与现有工作流冲突，可直接删除 `client/e2e/` 目录、`playwright.config.ts` 及相关 npm scripts，不影响现有功能代码。

## Open Questions

- 是否在 CI 中同时运行 Firefox 和 WebKit 测试，还是仅 Chromium？（建议初期仅 Chromium，后续按需扩展）
- 种子数据 API 的实现方式：是复用现有 `server/tests/e2e/conftest.py` 中的 fixture 逻辑，还是新建 FastAPI router？
- 是否需要对移动端视口（Responsive）进行 E2E 覆盖？（建议初期仅桌面端，后续迭代）

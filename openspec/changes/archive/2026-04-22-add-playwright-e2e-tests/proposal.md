## Why

当前项目的 `server/tests/e2e/` 目录下的测试使用的是 FastAPI `TestClient`，本质上是对后端 API 的集成测试，无法验证前端渲染、用户交互、页面跳转等真实浏览器行为。为了保障产品交付质量，需要引入基于 Playwright 的真正端到端（E2E）测试，从用户视角验证完整的业务流。

## What Changes

- 在 `client/` 目录下初始化 Playwright 测试框架（`@playwright/test`）
- 新增 `client/e2e/` 目录，存放面向真实浏览器的 E2E 测试用例
- 编写覆盖核心用户旅程的测试套件：登录/注册、Dashboard 看板、股票选股器、投资组合、量化分析、AI 对话、通知中心
- 在 `docker-compose.yml` 中添加 Playwright 专用服务容器，支持在 CI/CD 中无头运行
- 新增 `pnpm run test:e2e` 和 `pnpm run test:e2e:ui` 脚本，支持本地调试和 CI 运行
- 配置测试数据 fixture（通过 API 预置种子数据），确保测试可重复、不依赖外部状态
- 在 `client/.gitignore` 中排除 Playwright 生成的 `test-results/`、`playwright-report/` 和 `playwright/.cache/`

## Capabilities

### New Capabilities
- `playwright-e2e-testing`: 基于 Playwright 的浏览器端端到端测试基础设施，包括框架配置、页面对象模型（POM）、核心用户旅程测试用例、种子数据管理和 CI 集成。

### Modified Capabilities
<!-- 无现有 spec 需求变更 -->

## Impact

- **前端依赖**: `client/package.json` 新增 `@playwright/test` devDependency
- **CI/CD**: 可能需要调整 GitHub Actions（或其他 CI）以运行 `pnpm run test:e2e`
- **Docker**: `docker-compose.yml` 新增 `playwright` 服务，依赖 `server` 和 `client` 服务
- **测试策略**: 现有 `server/tests/e2e/` 继续保留为后端集成测试；Playwright E2E 作为独立测试层级，不替代现有测试
- **开发工作流**: 开发者本地需要安装 Playwright 浏览器二进制文件（通过 `npx playwright install`）

## Why

The GitHub Actions CI workflow's `backend` job fails at the lint step because `ruff` is not found on `PATH`. The current `uv pip install --system -r pyproject.toml` command installs only runtime dependencies and omits the `[dev]` extras that include `ruff`, `mypy`, and `pytest`. This blocks all PRs from passing CI.

## What Changes

- Update `.github/workflows/ci.yml` to install Python dev dependencies in the `backend` job by adding `--extra dev` to the `uv pip install` command.
- Ensure `ruff check`, `ruff format`, `mypy`, and `pytest` all have their required executables available in CI.

## Capabilities

### New Capabilities

None. This is an infrastructure fix to an existing CI workflow.

### Modified Capabilities

None. No product-level requirements or API behaviors are changing.

## Impact

- `.github/workflows/ci.yml` — single-line change in the dependency installation step.
- No impact on application code, APIs, database schema, or frontend behavior.
- CI pipeline reliability improvement; no breaking changes.

## Context

The CI workflow (`.github/workflows/ci.yml`) uses `uv pip install --system -r pyproject.toml` to install Python dependencies. This command resolves and installs only the core `dependencies` array from `[project]` in `pyproject.toml`. The `[project.optional-dependencies] dev` group — which contains `ruff`, `mypy`, and `pytest` — is not included. Consequently, subsequent steps that invoke `ruff`, `mypy`, and `pytest` fail with "command not found".

## Goals / Non-Goals

**Goals:**
- Make the `backend` CI job install dev dependencies so linting, type-checking, and testing tools are available.
- Keep the fix minimal and aligned with existing `uv` usage patterns.

**Non-Goals:**
- Changing application code, dependency versions, or linting rules.
- Switching from `uv` to another package manager.
- Restructuring the CI workflow beyond the dependency installation step.

## Decisions

**Decision**: Append `--extra dev` to the existing `uv pip install` command.

- **Rationale**: `uv pip install` supports PEP 508 extras via `--extra`. The project already defines `dev` optional dependencies in `pyproject.toml`. This is the most explicit and minimal change.
- **Alternative considered**: Use `uv pip install --system -e ".[dev]"`. Rejected because editable installs are unnecessary in CI and the existing workflow already uses `-r pyproject.toml`; adding `--extra dev` is a smaller delta.

## Risks / Trade-offs

- **[Risk]** Installing dev dependencies slightly increases CI install time.  
  **Mitigation**: `uv` is extremely fast; the extra packages (`pytest`, `ruff`, `mypy`) are small and cached by GitHub Actions.
- **[Risk]** If future dev dependencies are heavy, install time could grow.  
  **Mitigation**: Address when it becomes measurable; current dev group is minimal.

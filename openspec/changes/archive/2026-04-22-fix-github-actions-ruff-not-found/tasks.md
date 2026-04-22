## 1. Fix CI Dependency Installation

- [x] 1.1 Update `.github/workflows/ci.yml` to add `--extra dev` to the `uv pip install` command in the `backend` job.
- [x] 1.2 Verify the workflow YAML syntax is valid.

## 2. Validate Fix

- [x] 2.1 Confirm `ruff`, `mypy`, and `pytest` are all available after the install step by reviewing a successful CI run.

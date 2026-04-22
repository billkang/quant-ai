## Context

The CI `backend` job currently fails at the `mypy` step because of 33 type errors across 12 Python files. The majority of errors are caused by SQLAlchemy 2.0 `Column[T]` expressions being passed directly to functions that expect the scalar type `T`. Other errors include missing stub packages, incompatible numeric assignments, and un-awaited coroutines passed to `json.loads`.

The project uses SQLAlchemy 2.x with typed columns. When accessing a model attribute (e.g., `user.id`), the static type is `Column[int]`, but at runtime it resolves to `int`. MyPy correctly flags these mismatches.

## Goals / Non-Goals

**Goals:**
- Eliminate all current mypy errors so the CI `mypy` step passes.
- Add `types-requests` to dev dependencies for complete third-party type coverage.
- Keep changes minimal and non-breaking.

**Non-Goals:**
- Enabling `check_untyped_defs` or adding comprehensive type annotations to untyped functions.
- Refactoring business logic or changing API contracts.
- Fixing runtime bugs (unless they are directly exposed by the type errors).

## Decisions

**Decision 1**: Add `types-requests` to `[project.optional-dependencies] dev`.
- **Rationale**: `requests` is used in `fundamental_service.py`, `stock_data.py`, and `main.py`. The `types-requests` stub package is the standard way to get type coverage for `requests`.
- **Alternative considered**: Add `ignore_missing_imports = true` for `requests` module only. Rejected because we already have global `ignore_missing_imports = true` in `tool.mypy`, yet mypy still reports the error when it detects usage of specific untyped functions. Installing stubs is cleaner.

**Decision 2**: For `Column[T]` mismatches, cast values using `typing.cast(T, column_value)` or access the scalar via `column_value` if the context already guarantees it is a scalar.
- **Rationale**: `cast` is the most surgical fix — it tells mypy the runtime type without changing runtime behavior. Using `.scalar()` or explicit variable assignment with a type annotation is also acceptable where it improves readability.
- **Alternative considered**: Change function signatures to accept `Column[T]`. Rejected because it would leak ORM internals into service/API layers and is semantically incorrect (those functions operate on values, not expressions).

**Decision 3**: For `Awaitable[Any] | Any` passed to `json.loads`, explicitly `await` the coroutine before calling `loads`.
- **Rationale**: The variable was the result of an `async` call that was not awaited. Awaiting it fixes both the type error and a potential runtime bug.

## Risks / Trade-offs

- **[Risk]** Adding `cast` calls could mask genuine type issues in the future.  
  **Mitigation**: Only cast in places where the runtime type is guaranteed (e.g., after a DB query returns a concrete row). Avoid casting in ambiguous control-flow branches.
- **[Risk]** Some `float` → `int` assignments may be truncating at runtime.  
  **Mitigation**: Audit each site to ensure truncation is intentional; if not, change the target variable type to `float`.

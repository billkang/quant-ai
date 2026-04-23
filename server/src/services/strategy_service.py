"""Strategy management service."""

from typing import Any, cast

from jsonschema import Draft7Validator
from sqlalchemy.orm import Session

from src.models import models


class StrategyService:
    """CRUD and validation for strategies."""

    def __init__(self, db: Session):
        self.db = db

    def list_strategies(self, user_id: int | None = None) -> list[models.Strategy]:
        """Return builtin + user strategies."""
        query = self.db.query(models.Strategy).filter(models.Strategy.is_active == 1)
        if user_id is not None:
            query = query.filter(
                (models.Strategy.user_id == user_id) | (models.Strategy.is_builtin == 1)
            )
        else:
            query = query.filter(models.Strategy.is_builtin == 1)
        return query.order_by(
            models.Strategy.is_builtin.desc(), models.Strategy.created_at.desc()
        ).all()

    def get_builtin_strategies(self) -> list[models.Strategy]:
        return (
            self.db.query(models.Strategy)
            .filter(models.Strategy.is_builtin == 1, models.Strategy.is_active == 1)
            .all()
        )

    def get_strategy(self, strategy_id: int) -> models.Strategy | None:
        return self.db.query(models.Strategy).filter(models.Strategy.id == strategy_id).first()

    def create_strategy(self, user_id: int | None, **kwargs) -> models.Strategy:
        strategy = models.Strategy(user_id=user_id, **kwargs)
        self.db.add(strategy)
        self.db.commit()
        self.db.refresh(strategy)
        return strategy

    def update_strategy(self, strategy_id: int, **kwargs) -> models.Strategy | None:
        strategy = self.get_strategy(strategy_id)
        if not strategy:
            return None
        for key, value in kwargs.items():
            if hasattr(strategy, key):
                setattr(strategy, key, value)
        self.db.commit()
        self.db.refresh(strategy)
        return strategy

    def delete_strategy(self, strategy_id: int) -> bool:
        strategy = self.get_strategy(strategy_id)
        if not strategy or strategy.is_builtin == 1:
            return False
        self.db.delete(strategy)
        self.db.commit()
        return True

    def validate_params(self, strategy_id: int, params: dict[str, Any]) -> tuple[bool, str]:
        """Validate strategy parameters against JSON Schema."""
        strategy = self.get_strategy(strategy_id)
        if not strategy:
            return False, "Strategy not found"

        schema: dict[str, Any] = cast(dict[str, Any], strategy.params_schema) or {}
        if not schema:
            return True, ""  # No schema = no validation

        try:
            # Fill defaults
            defaults = {
                k: v["default"]
                for k, v in schema.get("properties", {}).items()
                if "default" in v and k not in params
            }
            params_with_defaults = {**defaults, **params}

            validator = Draft7Validator(schema)
            errors = list(validator.iter_errors(params_with_defaults))
            if errors:
                messages = [f"{e.path}: {e.message}" for e in errors]
                return False, "; ".join(messages)
            return True, ""
        except Exception as e:
            return False, str(e)

    # ───────────────────────────────────────────────
    #  Versions
    # ───────────────────────────────────────────────

    def list_versions(self, strategy_id: int) -> list[models.StrategyVersion]:
        return (
            self.db.query(models.StrategyVersion)
            .filter(models.StrategyVersion.strategy_id == strategy_id)
            .order_by(models.StrategyVersion.version_number.desc())
            .all()
        )

    def create_version(
        self, strategy_id: int, params_schema: dict | None = None, changelog: str = ""
    ) -> models.StrategyVersion:
        latest = (
            self.db.query(models.StrategyVersion)
            .filter(models.StrategyVersion.strategy_id == strategy_id)
            .order_by(models.StrategyVersion.version_number.desc())
            .first()
        )
        version_number = (latest.version_number + 1) if latest else 1
        version = models.StrategyVersion(
            strategy_id=strategy_id,
            version_number=version_number,
            params_schema=params_schema,
            changelog=changelog,
        )
        self.db.add(version)
        self.db.commit()
        self.db.refresh(version)
        return version

"""Seed builtin strategies for mvp-event-factor-core."""

from sqlalchemy.orm import Session

from src.models.database import SessionLocal
from src.models.models import Strategy, StrategyVersion

BUILTIN_STRATEGIES = [
    {
        "name": "双均线交叉",
        "description": "短期均线上穿长期均线买入，下穿卖出",
        "category": "technical",
        "strategy_code": "ma_cross",
        "params_schema": {
            "type": "object",
            "properties": {
                "short": {
                    "type": "integer",
                    "minimum": 2,
                    "maximum": 60,
                    "default": 5,
                    "title": "短期均线",
                },
                "long": {
                    "type": "integer",
                    "minimum": 5,
                    "maximum": 120,
                    "default": 20,
                    "title": "长期均线",
                },
            },
            "required": ["short", "long"],
        },
    },
    {
        "name": "RSI超卖反弹",
        "description": "RSI低于阈值买入，高于阈值卖出",
        "category": "technical",
        "strategy_code": "rsi_oversold",
        "params_schema": {
            "type": "object",
            "properties": {
                "period": {
                    "type": "integer",
                    "minimum": 2,
                    "maximum": 30,
                    "default": 6,
                    "title": "RSI周期",
                },
                "oversold": {
                    "type": "integer",
                    "minimum": 10,
                    "maximum": 40,
                    "default": 30,
                    "title": "超卖阈值",
                },
                "overbought": {
                    "type": "integer",
                    "minimum": 60,
                    "maximum": 90,
                    "default": 70,
                    "title": "超买阈值",
                },
            },
            "required": ["period", "oversold", "overbought"],
        },
    },
    {
        "name": "MACD信号",
        "description": "MACD柱状线由负转正买入，由正转负卖出",
        "category": "technical",
        "strategy_code": "macd_signal",
        "params_schema": {
            "type": "object",
            "properties": {
                "fast": {
                    "type": "integer",
                    "minimum": 5,
                    "maximum": 30,
                    "default": 12,
                    "title": "快线周期",
                },
                "slow": {
                    "type": "integer",
                    "minimum": 10,
                    "maximum": 60,
                    "default": 26,
                    "title": "慢线周期",
                },
                "signal": {
                    "type": "integer",
                    "minimum": 5,
                    "maximum": 20,
                    "default": 9,
                    "title": "信号周期",
                },
            },
            "required": ["fast", "slow", "signal"],
        },
    },
]


def seed_builtin_strategies(db: Session) -> None:
    for s in BUILTIN_STRATEGIES:
        existing = db.query(Strategy).filter(Strategy.strategy_code == s["strategy_code"]).first()
        if existing:
            continue
        strategy = Strategy(
            user_id=None,
            name=s["name"],
            description=s["description"],
            category=s["category"],
            strategy_code=s["strategy_code"],
            params_schema=s["params_schema"],
            is_builtin=1,
            is_active=1,
        )
        db.add(strategy)
        db.commit()
        db.refresh(strategy)

        # Create initial version
        version = StrategyVersion(
            strategy_id=strategy.id,
            version_number=1,
            params_schema=s["params_schema"],
            changelog="内置策略初始版本",
        )
        db.add(version)
        db.commit()


def main():
    db = SessionLocal()
    try:
        seed_builtin_strategies(db)
        print("Builtin strategies seeded successfully.")
    finally:
        db.close()


if __name__ == "__main__":
    main()

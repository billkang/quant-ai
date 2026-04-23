from abc import ABC, abstractmethod
from datetime import date, datetime

import numpy as np
import pandas as pd

from src.services.stock_data import stock_service


class Strategy(ABC):
    @abstractmethod
    def generate_signals(self, data: pd.DataFrame) -> pd.Series:
        """Return Series of 'buy'/'sell'/'hold' for each row."""
        pass


class MACrossStrategy(Strategy):
    def __init__(self, short=5, long=20):
        self.short = short
        self.long = long

    def generate_signals(self, data: pd.DataFrame) -> pd.Series:
        data["MA_short"] = data["close"].rolling(window=self.short, min_periods=1).mean()
        data["MA_long"] = data["close"].rolling(window=self.long, min_periods=1).mean()

        signals = pd.Series("hold", index=data.index)
        signals[data["MA_short"] > data["MA_long"]] = "buy"
        signals[data["MA_short"] < data["MA_long"]] = "sell"
        # Only keep crossover points
        signals = signals.where(signals != signals.shift(), "hold")
        return signals


class RSIOversoldStrategy(Strategy):
    def __init__(self, period=6, oversold=30, overbought=70):
        self.period = period
        self.oversold = oversold
        self.overbought = overbought

    def generate_signals(self, data: pd.DataFrame) -> pd.Series:
        delta = data["close"].diff()
        gain = delta.where(delta > 0, 0.0)
        loss = -delta.where(delta < 0, 0.0)
        avg_gain = gain.rolling(window=self.period, min_periods=1).mean()
        avg_loss = loss.rolling(window=self.period, min_periods=1).mean()
        rs = avg_gain / avg_loss.replace(0, 1e-10)
        rsi = 100 - (100 / (1 + rs))

        signals = pd.Series("hold", index=data.index)
        signals[rsi < self.oversold] = "buy"
        signals[rsi > self.overbought] = "sell"
        signals = signals.where(signals != signals.shift(), "hold")
        return signals


class MACDStrategy(Strategy):
    def __init__(self, fast=12, slow=26, signal=9):
        self.fast = fast
        self.slow = slow
        self.signal = signal

    def generate_signals(self, data: pd.DataFrame) -> pd.Series:
        ema_fast = data["close"].ewm(span=self.fast, adjust=False).mean()
        ema_slow = data["close"].ewm(span=self.slow, adjust=False).mean()
        dif = ema_fast - ema_slow
        dea = dif.ewm(span=self.signal, adjust=False).mean()

        signals = pd.Series("hold", index=data.index)
        signals[dif > dea] = "buy"
        signals[dif < dea] = "sell"
        signals = signals.where(signals != signals.shift(), "hold")
        return signals


# Strategy registry mapping strategy_code -> class
STRATEGY_REGISTRY = {
    "ma_cross": MACrossStrategy,
    "rsi_oversold": RSIOversoldStrategy,
    "macd_signal": MACDStrategy,
}


class Portfolio:
    def __init__(self, initial_cash: float):
        self.cash = initial_cash
        self.positions: dict[str, int] = {}
        self.trades: list[dict] = []
        self.equity_curve: list[dict] = []
        self.initial_cash = initial_cash

    def buy(
        self, stock_code: str, price: float, trade_date: date | datetime, shares: int | None = None
    ):
        if shares is None:
            shares = int(self.cash / price / 100) * 100  # Round to 100 shares
        if shares <= 0:
            return
        cost = shares * price
        if cost > self.cash:
            return
        self.cash -= cost
        self.positions[stock_code] = self.positions.get(stock_code, 0) + shares
        self.trades.append(
            {
                "date": trade_date.strftime("%Y-%m-%d")
                if isinstance(trade_date, date)
                else str(trade_date),
                "action": "buy",
                "price": round(price, 2),
                "shares": shares,
                "value": round(cost, 2),
            }
        )

    def sell(
        self, stock_code: str, price: float, trade_date: date | datetime, shares: int | None = None
    ):
        if stock_code not in self.positions or self.positions[stock_code] <= 0:
            return
        if shares is None:
            shares = self.positions[stock_code]
        shares = min(shares, self.positions[stock_code])
        revenue = shares * price
        self.cash += revenue
        self.positions[stock_code] -= shares
        self.trades.append(
            {
                "date": trade_date.strftime("%Y-%m-%d")
                if isinstance(trade_date, date)
                else str(trade_date),
                "action": "sell",
                "price": round(price, 2),
                "shares": shares,
                "value": round(revenue, 2),
            }
        )

    def has_position(self, stock_code: str) -> bool:
        return self.positions.get(stock_code, 0) > 0

    def can_buy(self, price: float) -> bool:
        return self.cash >= price * 100

    def total_value(self, current_prices: dict[str, float]) -> float:
        val = self.cash
        for code, shares in self.positions.items():
            val += shares * current_prices.get(code, 0)
        return val

    def record_equity(self, trade_date, value: float):
        self.equity_curve.append(
            {
                "date": trade_date.strftime("%Y-%m-%d")
                if isinstance(trade_date, date)
                else str(trade_date),
                "value": round(value, 2),
            }
        )


class BacktestService:
    """Refactored backtest service supporting dynamic strategy loading from DB."""

    def run(
        self,
        strategy_name: str | None = None,
        strategy_code: str | None = None,
        stock_code: str = "",
        start_date: str = "",
        end_date: str = "",
        initial_cash: float = 100000,
        params: dict | None = None,
        db=None,
        use_snapshots: bool = False,
    ) -> dict:
        params = params or {}

        # Determine strategy class
        strategy_class = None
        if strategy_code and strategy_code in STRATEGY_REGISTRY:
            strategy_class = STRATEGY_REGISTRY[strategy_code]
        elif strategy_name and strategy_name in STRATEGY_REGISTRY:
            strategy_class = STRATEGY_REGISTRY[strategy_name]
        else:
            strategy_class = MACrossStrategy

        strategy = strategy_class(**params)

        # Use factor snapshots if available and requested
        if use_snapshots and db is not None:
            from src.services.factor_snapshot_builder import FactorSnapshotBuilder

            builder = FactorSnapshotBuilder(db)
            df = builder.to_dataframe(
                symbol=stock_code,
                start_date=pd.to_datetime(start_date),
                end_date=pd.to_datetime(end_date),
            )
            if df.empty:
                # Fallback to kline data
                df = self._fetch_kline(stock_code, start_date, end_date)
        else:
            df = self._fetch_kline(stock_code, start_date, end_date)

        if len(df) < 20:
            raise ValueError("Insufficient data for backtest")

        signals = strategy.generate_signals(df)
        portfolio = Portfolio(initial_cash)

        for i, (idx, row) in enumerate(df.iterrows()):
            signal = signals.iloc[i]
            trade_date = idx if isinstance(idx, date | datetime) else row.get("date", idx)
            price = row["close"]

            if (
                signal == "buy"
                and portfolio.can_buy(price)
                and not portfolio.has_position(stock_code)
            ):
                portfolio.buy(stock_code, price, trade_date)
            elif signal == "sell" and portfolio.has_position(stock_code):
                portfolio.sell(stock_code, price, trade_date)

            # Record equity
            current_value = portfolio.cash
            if portfolio.has_position(stock_code):
                current_value += portfolio.positions[stock_code] * price
            portfolio.record_equity(trade_date, current_value)

        # Final value
        final_price = df["close"].iloc[-1]
        final_value = portfolio.cash
        if portfolio.has_position(stock_code):
            final_value += portfolio.positions[stock_code] * final_price

        # Calculate metrics
        total_return = (final_value - initial_cash) / initial_cash * 100
        days = max(1, (pd.to_datetime(end_date) - pd.to_datetime(start_date)).days)
        annualized_return = ((final_value / initial_cash) ** (365 / days) - 1) * 100

        equity_values = [e["value"] for e in portfolio.equity_curve]
        max_drawdown = self._calc_max_drawdown(equity_values)
        sharpe_ratio = self._calc_sharpe(equity_values, days)
        win_rate = self._calc_win_rate(portfolio.trades)

        return {
            "total_return": float(round(total_return, 2)),
            "annualized_return": float(round(annualized_return, 2)),
            "max_drawdown": float(round(max_drawdown, 2)),
            "sharpe_ratio": float(round(sharpe_ratio, 2)),
            "win_rate": float(round(win_rate, 2)),
            "trade_count": len(portfolio.trades),
            "equity_curve": portfolio.equity_curve,
            "trades": portfolio.trades,
            "final_value": float(round(final_value, 2)),
        }

    def _fetch_kline(self, stock_code: str, start_date: str, end_date: str) -> pd.DataFrame:
        klines = stock_service.get_a_stock_kline(stock_code, "daily")
        if not klines:
            raise ValueError(f"No data found for {stock_code}")

        df = pd.DataFrame(klines)
        df["date"] = pd.to_datetime(df["date"])
        df = df[(df["date"] >= start_date) & (df["date"] <= end_date)]
        df = df.sort_values("date").reset_index(drop=True)
        return df

    def _calc_max_drawdown(self, equity_values: list[float]) -> float:
        peak = equity_values[0]
        max_dd = 0.0
        for val in equity_values:
            if val > peak:
                peak = val
            dd = (peak - val) / peak * 100
            if dd > max_dd:
                max_dd = dd
        return -max_dd

    def _calc_sharpe(self, equity_values: list[float], days: int) -> float:
        if len(equity_values) < 2 or days <= 0:
            return 0
        returns = np.diff(equity_values) / np.array(equity_values[:-1])
        if len(returns) == 0 or np.std(returns) == 0:
            return 0
        annual_return = np.mean(returns) * 252
        annual_vol = np.std(returns) * np.sqrt(252)
        if annual_vol == 0:
            return 0
        return (annual_return - 0.02) / annual_vol  # Assuming 2% risk-free rate

    def _calc_win_rate(self, trades: list[dict]) -> float:
        if not trades:
            return 0
        buys = [t for t in trades if t["action"] == "buy"]
        sells = [t for t in trades if t["action"] == "sell"]
        if not buys or not sells:
            return 0
        wins = 0
        total_pairs = min(len(buys), len(sells))
        for i in range(total_pairs):
            if sells[i]["price"] > buys[i]["price"]:
                wins += 1
        return wins / total_pairs * 100 if total_pairs > 0 else 0


backtest_service = BacktestService()

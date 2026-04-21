from typing import Any

import pandas as pd


class IndicatorService:
    """Calculate technical indicators from price data."""

    def calculate_all(self, prices: list[dict[str, Any]]) -> list[dict[str, Any]]:
        """Calculate all indicators from a list of price rows.

        Each price row should have: trade_date, open, high, low, close, volume, amount
        Returns list of dicts with all indicator fields.
        """
        if not prices or len(prices) < 60:
            # Need at least 60 days for MA60
            return []

        df = pd.DataFrame(prices)
        df = df.sort_values("trade_date").reset_index(drop=True)

        df = self._add_ma(df)
        df = self._add_rsi(df)
        df = self._add_macd(df)
        df = self._add_kdj(df)
        df = self._add_boll(df)
        df = self._add_vol_ma(df)

        # Convert back to list of dicts
        records = df.to_dict("records")
        # Clean NaN values
        for record in records:
            for key, value in record.items():
                if pd.isna(value):
                    record[key] = None
        return records

    def _add_ma(self, df: pd.DataFrame) -> pd.DataFrame:
        df["ma5"] = df["close"].rolling(window=5, min_periods=1).mean()
        df["ma10"] = df["close"].rolling(window=10, min_periods=1).mean()
        df["ma20"] = df["close"].rolling(window=20, min_periods=1).mean()
        df["ma60"] = df["close"].rolling(window=60, min_periods=1).mean()
        return df

    def _add_rsi(self, df: pd.DataFrame, periods: list[int] = None) -> pd.DataFrame:
        if periods is None:
            periods = [6, 12, 24]
        for p in periods:
            delta = df["close"].diff()
            gain = delta.where(delta > 0, 0.0)
            loss = -delta.where(delta < 0, 0.0)
            avg_gain = gain.rolling(window=p, min_periods=1).mean()
            avg_loss = loss.rolling(window=p, min_periods=1).mean()
            rs = avg_gain / avg_loss.replace(0, 1e-10)
            df[f"rsi{p}"] = 100 - (100 / (1 + rs))
        return df

    def _add_macd(self, df: pd.DataFrame) -> pd.DataFrame:
        ema12 = df["close"].ewm(span=12, adjust=False).mean()
        ema26 = df["close"].ewm(span=26, adjust=False).mean()
        df["macd_dif"] = ema12 - ema26
        df["macd_dea"] = df["macd_dif"].ewm(span=9, adjust=False).mean()
        df["macd_bar"] = 2 * (df["macd_dif"] - df["macd_dea"])
        return df

    def _add_kdj(self, df: pd.DataFrame, n: int = 9, m1: int = 3, m2: int = 3) -> pd.DataFrame:
        low_list = df["low"].rolling(window=n, min_periods=1).min()
        high_list = df["high"].rolling(window=n, min_periods=1).max()
        rsv = (df["close"] - low_list) / (high_list - low_list).replace(0, 1e-10) * 100

        df["kdj_k"] = rsv.ewm(com=m1 - 1, adjust=False).mean()
        df["kdj_d"] = df["kdj_k"].ewm(com=m2 - 1, adjust=False).mean()
        df["kdj_j"] = 3 * df["kdj_k"] - 2 * df["kdj_d"]
        return df

    def _add_boll(self, df: pd.DataFrame, n: int = 20, k: float = 2.0) -> pd.DataFrame:
        df["boll_mid"] = df["close"].rolling(window=n, min_periods=1).mean()
        std = df["close"].rolling(window=n, min_periods=1).std()
        df["boll_upper"] = df["boll_mid"] + k * std
        df["boll_lower"] = df["boll_mid"] - k * std
        return df

    def _add_vol_ma(self, df: pd.DataFrame) -> pd.DataFrame:
        df["vol_ma5"] = df["volume"].rolling(window=5, min_periods=1).mean()
        df["vol_ma10"] = df["volume"].rolling(window=10, min_periods=1).mean()
        return df


indicator_service = IndicatorService()

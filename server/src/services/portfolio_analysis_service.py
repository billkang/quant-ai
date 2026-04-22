from typing import cast

import numpy as np
import pandas as pd

from src.models import crud
from src.services.stock_data import stock_service


class PortfolioAnalysisService:
    def analyze(self, db) -> dict:
        positions = crud.get_positions(db)
        if not positions:
            return {
                "sharpeRatio": 0,
                "maxDrawdown": 0,
                "volatility": 0,
                "industryDistribution": {},
                "correlationMatrix": {},
            }

        # Get historical prices for each position
        price_data = {}
        stock_codes = []
        for pos in positions:
            code = cast(str, pos.stock_code)
            klines = stock_service.get_a_stock_kline(code, "daily")
            if klines:
                df = pd.DataFrame(klines)
                df["date"] = pd.to_datetime(df["date"])
                df = df.set_index("date").sort_index()
                price_data[code] = df["close"]
                stock_codes.append(code)

        if len(stock_codes) == 0:
            return {
                "sharpeRatio": 0,
                "maxDrawdown": 0,
                "volatility": 0,
                "industryDistribution": {},
                "correlationMatrix": {},
            }

        # Build returns DataFrame
        returns_df = pd.DataFrame(
            {code: price_data[code].pct_change().dropna() for code in stock_codes}
        )
        if returns_df.empty or len(returns_df) < 2:
            return {
                "sharpeRatio": 0,
                "maxDrawdown": 0,
                "volatility": 0,
                "industryDistribution": {},
                "correlationMatrix": {
                    c: {c2: 1.0 if c == c2 else 0 for c2 in stock_codes} for c in stock_codes
                },
            }

        # Portfolio returns (equal weight for simplicity)
        weights = np.array([1.0 / len(stock_codes)] * len(stock_codes))
        portfolio_returns = returns_df.dot(weights)

        # Sharpe ratio
        annual_return = portfolio_returns.mean() * 252
        annual_vol = portfolio_returns.std() * np.sqrt(252)
        sharpe = (annual_return - 0.02) / annual_vol if annual_vol > 0 else 0

        # Max drawdown
        cumulative = (1 + portfolio_returns).cumprod()
        peak = cumulative.expanding().max()
        drawdown = (cumulative - peak) / peak
        max_dd = drawdown.min() * 100

        # Volatility
        volatility = annual_vol * 100

        # Correlation matrix
        corr = returns_df.corr()
        correlation_matrix = {
            c: {c2: round(corr.loc[c, c2], 2) for c2 in stock_codes} for c in stock_codes
        }

        # Industry distribution (placeholder - would need industry data)
        industry_dist = {"其他": 100}

        return {
            "sharpeRatio": round(sharpe, 2),
            "maxDrawdown": round(max_dd, 2),
            "volatility": round(volatility, 2),
            "industryDistribution": industry_dist,
            "correlationMatrix": correlation_matrix,
        }


portfolio_analysis_service = PortfolioAnalysisService()

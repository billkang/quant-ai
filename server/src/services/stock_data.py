import random
from datetime import datetime, timedelta

import akshare as ak
import pandas as pd
import yfinance as yf

MOCK_STOCKS = {
    '600519': {'name': '贵州茅台', 'base_price': 1650.0},
    '000858': {'name': '五粮液', 'base_price': 145.0},
    '601318': {'name': '中国平安', 'base_price': 45.0},
    '600036': {'name': '招商银行', 'base_price': 35.0},
    '000001': {'name': '平安银行', 'base_price': 12.0},
    '00700': {'name': '腾讯控股', 'base_price': 350.0},
    '09988': {'name': '阿里巴巴', 'base_price': 75.0},
    '02318': {'name': '中国平安(港股)', 'base_price': 42.0},
}


class StockDataService:
    def get_a_stock_quote(self, symbol: str) -> dict | None:
        try:
            df = ak.stock_zh_a_spot_em()
            stock = df[df['代码'] == symbol]
            if stock.empty:
                return None
            row = stock.iloc[0]
            return {
                'code': symbol,
                'name': row['名称'],
                'price': float(row['最新价']) if pd.notna(row['最新价']) else 0,
                'change': float(row['涨跌幅']) if pd.notna(row['涨跌幅']) else 0,
                'changePercent': float(row['涨跌幅']) if pd.notna(row['涨跌幅']) else 0,
                'volume': float(row['成交量']) if pd.notna(row['成交量']) else 0,
                'amount': float(row['成交额']) if pd.notna(row['成交额']) else 0,
                'high': float(row['最高']) if pd.notna(row['最高']) else 0,
                'low': float(row['最低']) if pd.notna(row['最低']) else 0,
                'open': float(row['今开']) if pd.notna(row['今开']) else 0,
            }
        except Exception as e:
            print(f"Error fetching A stock quote: {e}")
            return self._get_mock_quote(symbol, 'A')

    def get_hk_stock_quote(self, symbol: str) -> dict | None:
        try:
            ticker = yf.Ticker(f"{symbol}.HK")
            info = ticker.info
            return {
                'code': symbol,
                'name': info.get('longName', info.get('shortName', '')),
                'price': info.get('currentPrice', 0),
                'change': info.get('regularMarketChange', 0),
                'changePercent': info.get('regularMarketChangePercent', 0),
                'volume': info.get('volume', 0),
                'high': info.get('fiftyTwoWeekHigh', 0),
                'low': info.get('fiftyTwoWeekLow', 0),
                'open': info.get('regularMarketOpen', 0),
            }
        except Exception as e:
            print(f"Error fetching HK stock quote: {e}")
            return self._get_mock_quote(symbol, 'HK')

    def _get_mock_quote(self, symbol: str, market: str) -> dict:
        mock_info = MOCK_STOCKS.get(symbol)
        if mock_info:
            change_pct = random.uniform(-3, 3)
            price = mock_info['base_price'] * (1 + change_pct / 100)
            return {
                'code': symbol,
                'name': mock_info['name'],
                'price': round(price, 2),
                'change': round(price - mock_info['base_price'], 2),
                'changePercent': round(change_pct, 2),
                'volume': random.randint(1000000, 100000000),
                'high': round(price * 1.02, 2),
                'low': round(price * 0.98, 2),
                'open': round(mock_info['base_price'], 2),
            }
        return {'code': symbol, 'name': f'股票{symbol}', 'price': 0, 'change': 0, 'changePercent': 0}

    def get_a_stock_kline(self, symbol: str, period: str = 'daily') -> list:
        try:
            if period == 'daily':
                df = ak.stock_zh_a_hist(symbol=symbol, period='daily', adjust='qfq')
            elif period == 'weekly':
                df = ak.stock_zh_a_hist(symbol=symbol, period='weekly', adjust='qfq')
            else:
                df = ak.stock_zh_a_hist(symbol=symbol, period='monthly', adjust='qfq')
            return df.tail(100).to_dict('records')
        except Exception as e:
            print(f"Error fetching A stock kline: {e}")
            return self._get_mock_kline(symbol)

    def get_hk_stock_kline(self, symbol: str, period: str = '1y') -> list:
        try:
            ticker = yf.Ticker(f"{symbol}.HK")
            df = ticker.history(period=period)
            return df.to_dict('records')
        except Exception as e:
            print(f"Error fetching HK stock kline: {e}")
            return self._get_mock_kline(symbol)

    def _get_mock_kline(self, symbol: str) -> list:
        mock_info = MOCK_STOCKS.get(symbol, {'base_price': 100})
        base = mock_info['base_price']
        klines = []
        date = datetime.now()
        for _ in range(50):
            date = date - timedelta(days=1)
            if date.weekday() >= 5:
                continue
            change = random.uniform(-2, 2)
            open_p = base * (1 + change / 100)
            close = open_p * (1 + random.uniform(-1, 1) / 100)
            high = max(open_p, close) * 1.01
            low = min(open_p, close) * 0.99
            klines.append({
                '日期': date.strftime('%Y-%m-%d'),
                '开盘': round(open_p, 2),
                '收盘': round(close, 2),
                '最高': round(high, 2),
                '最低': round(low, 2),
                '成交量': random.randint(1000000, 100000000),
                '成交额': random.randint(10000000, 1000000000),
                '振幅': round(random.uniform(0.5, 3), 2),
                '涨跌幅': round(change, 2),
                '涨跌额': round(close - open_p, 2),
                '换手率': round(random.uniform(0.5, 5), 2),
            })
        return klines


stock_service = StockDataService()

import asyncio
import random
from datetime import datetime, timedelta

import akshare as ak
import pandas as pd
import yfinance as yf
from functools import lru_cache

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
    _spot_cache = None
    _cache_time = 0
    CACHE_TTL = 60

    def get_a_stock_quote(self, symbol: str) -> dict | None:
        try:
            now = datetime.now().timestamp()
            if self._spot_cache is None or now - self._cache_time > self.CACHE_TTL:
                import requests
                resp = requests.get(
                    "https://push2.eastmoney.com/api/qt/clist/get",
                    params={"pn": 1, "pz": 5000, "po": 1, "np": 1, "ut": "bd1d9ddb04089700cf9c27f6f7426281", "fltt": 2, "invt": 2, "fid": "f3", "fs": "m:0+t:6,m:0+t:80", "fields": "f1,f2,f3,f4,f5,f6,f7,f12,f13,f14"},
                    timeout=5
                )
                data = resp.json()
                self._spot_cache = {s['f12']: s for s in data.get('data', {}).get('diff', [])}
                self._cache_time = now
            stock = self._spot_cache.get(symbol)
            if not stock:
                return self._get_mock_quote(symbol, 'A')
            return {
                'code': symbol,
                'name': stock.get('f14', ''),
                'price': stock.get('f2', 0) or 0,
                'change': stock.get('f4', 0) or 0,
                'changePercent': stock.get('f3', 0) or 0,
                'volume': stock.get('f5', 0) or 0,
                'amount': stock.get('f6', 0) or 0,
                'high': stock.get('f15', 0) or 0,
                'low': stock.get('f16', 0) or 0,
                'open': stock.get('f17', 0) or 0,
            }
        except Exception as e:
            print(f"Error fetching A stock quote: {e}")
            return self._get_mock_quote(symbol, 'A')

    def get_hk_stock_quote(self, symbol: str) -> dict | None:
        try:
            import requests as req
            resp = req.get(
                f"https://query1.finance.yahoo.com/v8/finance/chart/{symbol}.HK",
                timeout=5
            )
            data = resp.json()
            result = data.get('chart', {}).get('result', [])
            if not result:
                return self._get_mock_quote(symbol, 'HK')
            meta = result[0].get('meta', {})
            quote = result[0].get('indicators', {}).get('quote', [{}])[0]
            return {
                'code': symbol,
                'name': meta.get('shortName', meta.get('symbol', '')),
                'price': meta.get('previousClose', 0),
                'change': 0,
                'changePercent': 0,
                'volume': meta.get('volume', 0),
                'high': meta.get('chartPreviousClose', 0),
                'low': meta.get('chartPreviousClose', 0),
                'open': meta.get('chartPreviousClose', 0),
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
            import requests as req
            period_map = {'daily': '101', 'weekly': '102', 'monthly': '103'}
            p = period_map.get(period, '101')
            resp = req.get(
                "https://push2his.eastmoney.com/api/qt/stock/kline/get",
                params={
                    "secid": f"1.{symbol}",
                    "fields1": "f1,f2,f3,f4,f5,f6",
                    "fields2": "f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61",
                    "klt": p,
                    "fqt": 1,
                    "end": "20500101",
                    "lmt": 100,
                },
                timeout=5
            )
            data = resp.json()
            klines = []
            for d in data.get('data', {}).get('klines', []):
                parts = d.split(',')
                klines.append({
                    '日期': parts[0],
                    '开盘': float(parts[1]),
                    '收盘': float(parts[2]),
                    '最高': float(parts[3]),
                    '最低': float(parts[4]),
                    '成交量': int(parts[5]),
                    '成交额': int(parts[6]) if len(parts) > 6 else 0,
                })
            return klines
        except Exception as e:
            print(f"Error fetching A stock kline: {e}")
            return self._get_mock_kline(symbol)

    def get_hk_stock_kline(self, symbol: str, period: str = '1y') -> list:
        try:
            import requests as req
            period_map = {'1d': '1d', '1mo': '1mo', '3mo': '3mo', '6mo': '6mo', '1y': '1y', '5y': '5y'}
            p = period_map.get(period, '1y')
            resp = req.get(
                f"https://query1.finance.yahoo.com/v8/finance/chart/{symbol}.HK",
                params={"range": p, "interval": "1d"},
                timeout=5
            )
            data = resp.json()
            result = data.get('chart', {}).get('result', [])
            if not result:
                return self._get_mock_kline(symbol)
            quote = result[0].get('indicators', {}).get('quote', [{}])[0]
            timestamps = result[0].get('timestamp', [])
            klines = []
            for i, ts in enumerate(timestamps):
                import datetime
                klines.append({
                    '日期': datetime.datetime.fromtimestamp(ts).strftime('%Y-%m-%d'),
                    '开盘': quote['open'][i] if quote.get('open') else 0,
                    '收盘': quote['close'][i] if quote.get('close') else 0,
                    '最高': quote['high'][i] if quote.get('high') else 0,
                    '最低': quote['low'][i] if quote.get('low') else 0,
                    '成交量': quote['volume'][i] if quote.get('volume') else 0,
                })
            return klines
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

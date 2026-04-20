import requests
from datetime import datetime

from src.core.config import settings


def _get_proxy():
    if settings.HTTPS_PROXY:
        http_proxy = settings.HTTPS_PROXY.replace("127.0.0.1", "host.docker.internal")
        return {"http": http_proxy, "https": http_proxy}
    return None


PROXY = _get_proxy()


class StockDataService:
    _spot_cache = None
    _cache_time = 0
    CACHE_TTL = 60

    def get_a_stock_quote(self, symbol: str) -> dict | None:
        try:
            now = datetime.now().timestamp()
            if self._spot_cache is None or now - self._cache_time > self.CACHE_TTL:
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
                return None
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
            return None

    def get_hk_stock_quote(self, symbol: str) -> dict | None:
        try:
            code = symbol.replace('.HK', '').replace('.US', '')
            headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
            yahoo_symbol = f"{code}.HK" if '.HK' in symbol.upper() else f"{code}"
            resp = requests.get(
                f"https://query1.finance.yahoo.com/v8/finance/chart/{yahoo_symbol}",
                headers=headers,
                proxies=PROXY,
                timeout=10
            )
            if resp.status_code == 429:
                print(f"Yahoo rate limited for {symbol}")
                return None
            data = resp.json()
            result = data.get('chart', {}).get('result', [])
            if not result:
                return None
            meta = result[0].get('meta', {})
            return {
                'code': symbol,
                'name': meta.get('shortName', meta.get('symbol', '')),
                'price': meta.get('previousClose', 0),
                'change': meta.get('regularMarketChange', 0) or 0,
                'changePercent': meta.get('regularMarketChangePercent', 0) or 0,
                'volume': meta.get('volume', 0) or 0,
                'high': meta.get('chartPreviousClose', 0) or 0,
                'low': meta.get('chartPreviousClose', 0) or 0,
                'open': meta.get('chartPreviousClose', 0) or 0,
            }
        except Exception as e:
            print(f"Error fetching {symbol} quote: {e}")
            return None

    def get_a_stock_kline(self, symbol: str, period: str = 'daily') -> list:
        try:
            period_map = {'daily': '101', 'weekly': '102', 'monthly': '103'}
            p = period_map.get(period, '101')
            resp = requests.get(
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
            return []

    def get_hk_stock_kline(self, symbol: str, period: str = '1y') -> list:
        try:
            code = symbol.replace('.HK', '').replace('.US', '')
            period_map = {'1d': '1d', '1mo': '1mo', '3mo': '3mo', '6mo': '6mo', '1y': '1y'}
            p = period_map.get(period, '1y')
            headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
            yahoo_symbol = f"{code}.HK" if '.HK' in symbol.upper() else f"{code}.US" if '.US' in symbol.upper() else code
            resp = requests.get(
                f"https://query1.finance.yahoo.com/v8/finance/chart/{yahoo_symbol}",
                params={"range": p, "interval": "1d"},
                headers=headers,
                proxies=PROXY,
                timeout=10
            )
            if resp.status_code == 429:
                return []
            data = resp.json()
            result = data.get('chart', {}).get('result', [])
            if not result:
                return []
            quote = result[0].get('indicators', {}).get('quote', [{}])[0]
            timestamps = result[0].get('timestamp', [])
            klines = []
            for i, ts in enumerate(timestamps):
                from datetime import datetime
                klines.append({
                    '日期': datetime.fromtimestamp(ts).strftime('%Y-%m-%d'),
                    '开盘': quote['open'][i] if quote.get('open') else 0,
                    '收盘': quote['close'][i] if quote.get('close') else 0,
                    '最高': quote['high'][i] if quote.get('high') else 0,
                    '最低': quote['low'][i] if quote.get('low') else 0,
                    '成交量': quote['volume'][i] if quote.get('volume') else 0,
                })
            return klines
        except Exception as e:
            print(f"Error fetching {symbol} kline: {e}")
            return []


stock_service = StockDataService()

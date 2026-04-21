import requests


class FundamentalService:
    def fetch_fundamental(self, stock_code: str) -> dict | None:
        try:
            # Use akshare-like eastmoney API for stock valuation indicators
            resp = requests.get(
                "https://push2.eastmoney.com/api/qt/stock/get",
                params={
                    "secid": f"1.{stock_code}",
                    "fields": "f57,f58,f162,f167,f170,f171,f173,f177,f183,f184,f185,f186,f187,f188",
                },
                timeout=5,
            )
            data = resp.json()
            stock_data = data.get("data", {})
            if not stock_data:
                return None

            return {
                "report_date": "2025-12-31",  # Placeholder, real data needs financial report API
                "pe_ttm": stock_data.get("f162"),
                "pb": stock_data.get("f167"),
                "ps": stock_data.get("f173"),
                "roe": stock_data.get("f170"),
                "roa": stock_data.get("f171"),
                "gross_margin": stock_data.get("f183"),
                "net_margin": stock_data.get("f184"),
                "revenue_growth": stock_data.get("f185"),
                "profit_growth": stock_data.get("f186"),
                "debt_ratio": stock_data.get("f187"),
                "free_cash_flow": stock_data.get("f188"),
            }
        except Exception as e:
            print(f"Error fetching fundamental data for {stock_code}: {e}")
            return None


fundamental_service = FundamentalService()

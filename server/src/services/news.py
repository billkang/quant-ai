
import akshare as ak


class NewsService:
    def get_stock_news(self, symbol: str) -> list[dict]:
        try:
            df = ak.stock_news_em(symbol=symbol)
            if df is None or df.empty:
                return []
            return df.head(20).to_dict('records')
        except Exception as e:
            print(f"Error fetching stock news: {e}")
            return []

    def get_stock_notices(self, symbol: str) -> list[dict]:
        try:
            df = ak.stock_zh_a_alerts(symbol=symbol)
            if df is None or df.empty:
                return []
            return df.head(20).to_dict('records')
        except Exception as e:
            print(f"Error fetching stock notices: {e}")
            return []

    def get_macro_news(self) -> list[dict]:
        try:
            df = ak.macro_china()
            if df is None or df.empty:
                return []
            return df.head(10).to_dict('records')
        except Exception as e:
            print(f"Error fetching macro news: {e}")
            return []


news_service = NewsService()

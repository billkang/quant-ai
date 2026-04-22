from datetime import datetime, timedelta
from typing import cast

import akshare as ak
from sqlalchemy.orm import Session

from src.models import crud, models
from src.models.database import SessionLocal


class NewsService:
    def get_stock_news_from_db(self, symbol: str, limit: int = 50) -> list[dict]:
        db = SessionLocal()
        try:
            articles = crud.get_news_articles(db, symbol=symbol, limit=limit)

            if not articles:
                sources = db.query(models.NewsSource).all()
                source = None
                for s in sources:
                    if s.config and s.config.get("symbol") == symbol:
                        source = s
                        break

                if not source:
                    source = models.NewsSource(
                        name=symbol,
                        source_type="stock_news",
                        config={"symbol": symbol},
                        interval_minutes=60,
                    )
                    db.add(source)
                    db.commit()
                    db.refresh(source)

                self.fetch_and_save_news(db, cast(int, source.id))
                articles = crud.get_news_articles(db, symbol=symbol, limit=limit)

            return [
                {
                    "id": str(a.id),
                    "title": a.title,
                    "summary": a.summary,
                    "source": a.source,
                    "time": a.publish_time.strftime("%Y-%m-%d %H:%M:%S") if a.publish_time else "",
                    "url": a.url,
                }
                for a in articles
            ]
        finally:
            db.close()

    def fetch_and_save_news(self, db: Session, source_id: int) -> dict:
        source = db.query(models.NewsSource).filter(models.NewsSource.id == source_id).first()
        if not source:
            return {"status": "error", "message": "数据源不存在"}

        if source.last_fetched_at:
            elapsed = datetime.utcnow() - source.last_fetched_at
            if elapsed < timedelta(minutes=cast(int, source.interval_minutes)):
                return {
                    "status": "ok",
                    "skipped": 1,
                    "new": 0,
                    "count": 0,
                    "message": f"距离上次抓取仅 {elapsed.total_seconds() / 60:.0f} 分钟，未到间隔 {source.interval_minutes} 分钟",
                }

        symbol = source.config.get("symbol", "") if source.config else ""
        news_data = []

        try:
            if source.source_type == "stock_news":
                news_data = self._fetch_stock_news(symbol)
            elif source.source_type == "stock_notices":
                news_data = self._fetch_stock_notices(symbol)
            elif source.source_type == "macro_news":
                news_data = self._fetch_macro_news()
        except Exception as e:
            return {"status": "error", "message": f"抓取失败: {str(e)}"}

        new_count = 0
        for item in news_data:
            url = item.get("新闻链接", "")
            if not url:
                continue
            if crud.article_url_exists(db, url):
                continue

            try:
                publish_time = None
                if item.get("发布时间"):
                    try:
                        publish_time = datetime.strptime(str(item["发布时间"]), "%Y-%m-%d %H:%M:%S")
                    except Exception:
                        try:
                            publish_time = datetime.strptime(
                                str(item["发布时间"])[:19], "%Y-%m-%d %H:%M:%S"
                            )
                        except Exception:
                            pass

                summary = str(item.get("新闻内容", ""))[:200] if item.get("新闻内容") else ""
                if len(str(item.get("新闻内容", ""))) > 200:
                    summary += "..."

                crud.save_news_article(
                    db,
                    source_id=source_id,
                    title=item.get("新闻标题", ""),
                    summary=summary,
                    source=item.get("文章来源", ""),
                    publish_time=publish_time,
                    url=url,
                    content=item.get("新闻内容", ""),
                )
                new_count += 1
            except Exception as e:
                print(f"Error saving article: {e}")
                continue

        crud.update_news_source_fetch_time(db, source_id)

        return {
            "status": "ok",
            "skipped": 0,
            "new": new_count,
            "count": len(news_data),
        }

    def get_stock_news(self, symbol: str) -> list[dict]:
        """Fetch raw stock news from external API (for AI analysis)."""
        return self._fetch_stock_news(symbol)

    def _fetch_stock_news(self, symbol: str) -> list[dict]:
        try:
            df = ak.stock_news_em(symbol=symbol)
            if df is None or df.empty:
                return []
            return df.head(20).to_dict("records")
        except Exception as e:
            print(f"Error fetching stock news: {e}")
            return []

    def _fetch_stock_notices(self, symbol: str) -> list[dict]:
        try:
            df = ak.stock_zh_a_alerts(symbol=symbol)
            if df is None or df.empty:
                return []
            return df.head(20).to_dict("records")
        except Exception as e:
            print(f"Error fetching stock notices: {e}")
            return []

    def _fetch_macro_news(self) -> list[dict]:
        try:
            df = ak.macro_china()
            if df is None or df.empty:
                return []
            return df.head(10).to_dict("records")
        except Exception as e:
            print(f"Error fetching macro news: {e}")
            return []


news_service = NewsService()

from datetime import datetime, timedelta
from unittest.mock import MagicMock, patch

import pytest

from src.models import models
from src.services.news import NewsService


class TestNewsService:
    @pytest.fixture
    def service(self):
        return NewsService()

    @pytest.fixture
    def sample_source(self, db_session):
        source = models.NewsSource(
            name="测试源",
            source_type="stock_news",
            config={"symbol": "000001"},
            interval_minutes=30,
        )
        db_session.add(source)
        db_session.commit()
        db_session.refresh(source)
        return source

    def test_first_fetch_saves_articles(self, db_session, service, sample_source):
        mock_news = [
            {
                "新闻标题": "标题1",
                "新闻内容": "内容1",
                "发布时间": "2026-04-21 10:00:00",
                "文章来源": "东方财富",
                "新闻链接": "http://test.com/1",
            },
            {
                "新闻标题": "标题2",
                "新闻内容": "内容2",
                "发布时间": "2026-04-21 11:00:00",
                "文章来源": "新浪",
                "新闻链接": "http://test.com/2",
            },
        ]

        with patch(
            "akshare.stock_news_em",
            return_value=MagicMock(
                **{"empty": False, "head.return_value.to_dict.return_value": mock_news}
            ),
        ):
            result = service.fetch_and_save_news(db_session, sample_source.id)

        assert result["status"] == "ok"
        assert result["new"] == 2
        assert result["skipped"] == 0

        articles = db_session.query(models.NewsArticle).all()
        assert len(articles) == 2

    def test_fetch_within_interval_is_skipped(self, db_session, service, sample_source):
        sample_source.last_fetched_at = datetime.utcnow() - timedelta(minutes=10)
        db_session.commit()

        result = service.fetch_and_save_news(db_session, sample_source.id)

        assert result["skipped"] == 1
        assert result["new"] == 0
        assert "未到间隔" in result["message"]

    def test_duplicate_url_is_ignored(self, db_session, service, sample_source):
        existing = models.NewsArticle(
            source_id=sample_source.id,
            title="旧标题",
            url="http://test.com/1",
            publish_time=datetime.utcnow(),
        )
        db_session.add(existing)
        db_session.commit()

        mock_news = [
            {
                "新闻标题": "新标题",
                "新闻内容": "新内容",
                "发布时间": "2026-04-21 10:00:00",
                "文章来源": "东方财富",
                "新闻链接": "http://test.com/1",
            },
            {
                "新闻标题": "标题2",
                "新闻内容": "内容2",
                "发布时间": "2026-04-21 11:00:00",
                "文章来源": "新浪",
                "新闻链接": "http://test.com/2",
            },
        ]

        with patch(
            "akshare.stock_news_em",
            return_value=MagicMock(
                **{"empty": False, "head.return_value.to_dict.return_value": mock_news}
            ),
        ):
            result = service.fetch_and_save_news(db_session, sample_source.id)

        assert result["new"] == 1
        assert db_session.query(models.NewsArticle).count() == 2

    def test_akshare_exception_returns_empty(self, db_session, service, sample_source):
        with patch("akshare.stock_news_em", side_effect=RuntimeError("网络超时")):
            result = service.fetch_and_save_news(db_session, sample_source.id)

        assert result["status"] == "ok"
        assert result["new"] == 0
        assert result["count"] == 0

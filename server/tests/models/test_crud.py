from src.models import crud


class TestCrudOperations:
    def test_remove_nonexistent_watchlist(self, db_session):
        result = crud.remove_from_watchlist(db_session, "999999")
        assert result is False

    def test_add_and_remove_watchlist(self, db_session):
        item = crud.add_to_watchlist(db_session, "600519", "贵州茅台")
        assert item.stock_code == "600519"
        assert item.stock_name == "贵州茅台"

        result = crud.remove_from_watchlist(db_session, "600519")
        assert result is True

        items = crud.get_watchlist(db_session)
        assert len(items) == 0

    def test_article_url_exists(self, db_session):
        from datetime import datetime

        from src.models import models

        article = models.NewsArticle(
            source_id=1,
            title="测试",
            url="http://test.com/1",
            publish_time=datetime.utcnow(),
        )
        db_session.add(article)
        db_session.commit()

        assert crud.article_url_exists(db_session, "http://test.com/1") is True
        assert crud.article_url_exists(db_session, "http://test.com/999") is False

    def test_get_news_articles_empty(self, db_session):
        articles = crud.get_news_articles(db_session, symbol="000001")
        assert articles == []

from src.models import crud
from src.models.models import User


class TestAuthE2E:
    def test_register_success(self, e2e_client, db_session):
        payload = {
            "username": "testuser",
            "email": "test@example.com",
            "password": "testpass123",
        }
        response = e2e_client.post("/api/auth/register", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["code"] == 0
        assert "access_token" in data["data"]

        user = db_session.query(User).filter(User.username == "testuser").first()
        assert user is not None
        assert user.email == "test@example.com"

    def test_register_duplicate_username(self, e2e_client):
        payload = {
            "username": "dupuser",
            "email": "dup@example.com",
            "password": "pass123",
        }
        r1 = e2e_client.post("/api/auth/register", json=payload)
        assert r1.status_code == 200

        r2 = e2e_client.post("/api/auth/register", json=payload)
        assert r2.status_code == 400

    def test_login_success(self, e2e_client):
        e2e_client.post(
            "/api/auth/register",
            json={"username": "loginuser", "email": "login@example.com", "password": "pass123"},
        )

        response = e2e_client.post(
            "/api/auth/login",
            json={"username": "loginuser", "password": "pass123"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["code"] == 0
        assert "access_token" in data["data"]

    def test_login_wrong_password(self, e2e_client):
        e2e_client.post(
            "/api/auth/register",
            json={"username": "wrongpass", "email": "wp@example.com", "password": "pass123"},
        )

        response = e2e_client.post(
            "/api/auth/login",
            json={"username": "wrongpass", "password": "wrong"},
        )
        assert response.status_code == 401

    def test_get_me(self, e2e_client):
        reg = e2e_client.post(
            "/api/auth/register",
            json={"username": "meuser", "email": "me@example.com", "password": "pass123"},
        )
        token = reg.json()["data"]["access_token"]

        response = e2e_client.get(
            "/api/auth/me",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 200
        data = response.json()["data"]
        assert data["username"] == "meuser"
        assert data["email"] == "me@example.com"

    def test_watchlist_isolation(self, e2e_client, db_session):
        # Register user A
        reg_a = e2e_client.post(
            "/api/auth/register",
            json={"username": "usera", "email": "a@example.com", "password": "pass123"},
        )
        assert reg_a.json()["data"]["access_token"]

        # Register user B
        reg_b = e2e_client.post(
            "/api/auth/register",
            json={"username": "userb", "email": "b@example.com", "password": "pass123"},
        )
        assert reg_b.json()["data"]["access_token"]

        # User A adds stock (legacy endpoint without user filter yet, but CRUD supports it)
        crud.add_to_watchlist(db_session, "000001", "平安银行", user_id=1)
        db_session.commit()

        # Verify user_id was set
        watchlist = crud.get_watchlist(db_session, user_id=1)
        assert len(watchlist) == 1
        assert watchlist[0].stock_code == "000001"

        # User B should see empty watchlist
        watchlist_b = crud.get_watchlist(db_session, user_id=2)
        assert len(watchlist_b) == 0

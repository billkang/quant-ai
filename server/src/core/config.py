from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str
    REDIS_URL: str = "redis://localhost:6379/0"
    AI_API_KEY: str = ""
    AI_MODEL: str = "deepseek-chat"
    HTTP_PROXY: str = ""
    HTTPS_PROXY: str = ""
    ENV: str = "development"
    FRONTEND_URL: str = ""


settings = Settings()

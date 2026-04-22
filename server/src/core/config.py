from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    DATABASE_URL: str = "sqlite:///./quant_ai.db"
    REDIS_URL: str = "redis://localhost:6379/0"
    AI_API_KEY: str = ""
    AI_MODEL: str = "deepseek-chat"
    HTTP_PROXY: str = ""
    HTTPS_PROXY: str = ""
    ENV: str = "development"
    FRONTEND_URL: str = ""
    DOCS_USERNAME: str = ""
    DOCS_PASSWORD: str = ""
    SECRET_KEY: str = "change-me-in-production"


settings = Settings()

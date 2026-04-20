from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    REDIS_URL: str = "redis://localhost:6379/0"
    AI_API_KEY: str = ""
    AI_MODEL: str = "deepseek-chat"


settings = Settings()

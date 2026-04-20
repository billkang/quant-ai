from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://quantai:quantai123@localhost:5432/quant_ai"
    REDIS_URL: str = "redis://localhost:6379/0"
    AI_API_KEY: str = ""
    AI_MODEL: str = "deepseek-chat"


settings = Settings()

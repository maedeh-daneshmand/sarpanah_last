from urllib.parse import quote_plus
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import computed_field


class Settings(BaseSettings):
    PROJECT_NAME: str = "SarPanah"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "sarpanah-super-secret-jwt-key-2026-production-ready-accommodation"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day

    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "sarpanah"
    POSTGRES_SSLMODE: str = "require"

    TEST_POSTGRES_DB: str = "sarpanah_test"

    # CORS - comma separated list of allowed origins
    FRONTEND_URL: str = "http://localhost:3000"

    @computed_field
    @property
    def CORS_ORIGINS(self) -> List[str]:
        origins = [
            "http://localhost:3000",
            "http://localhost:3001",
        ]
        if self.FRONTEND_URL not in origins:
            origins.append(self.FRONTEND_URL)
        # Support wildcard subdomains like vercel preview URLs
        return origins

    @computed_field
    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        escaped_password = quote_plus(self.POSTGRES_PASSWORD)
        ssl_suffix = f"?sslmode={self.POSTGRES_SSLMODE}" if self.POSTGRES_SSLMODE else ""
        return (
            f"postgresql+psycopg://{self.POSTGRES_USER}:{escaped_password}"
            f"@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}{ssl_suffix}"
        )

    @computed_field
    @property
    def TEST_SQLALCHEMY_DATABASE_URI(self) -> str:
        escaped_password = quote_plus(self.POSTGRES_PASSWORD)
        return (
            f"postgresql+psycopg://{self.POSTGRES_USER}:{escaped_password}"
            f"@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.TEST_POSTGRES_DB}"
        )

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()

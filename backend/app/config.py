import os
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    APP_MODE: str = "demo"  # "live" or "demo"
    FYERS_CLIENT_ID: str = ""
    FYERS_SECRET_KEY: str = ""
    FYERS_REDIRECT_URI: str = "https://trade.fyers.in/api-login/redirect-uri/index.html"
    FYERS_ACCESS_TOKEN: Optional[str] = None

    HOST: str = "0.0.0.0"
    PORT: int = 8000
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,https://trado-easy.vercel.app,*"

    STALE_DATA_TIMEOUT_SECONDS: int = 20
    RVOL_THRESHOLD: float = 2.0
    AUTO_REFRESH_INTERVAL_SECONDS: int = 60

    TOKEN_CACHE_FILE: str = "fyers_token.json"

    @property
    def cors_origin_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    @property
    def is_live_configured(self) -> bool:
        return bool(self.FYERS_ACCESS_TOKEN or (self.FYERS_CLIENT_ID and self.FYERS_SECRET_KEY))


settings = Settings()

import base64
import hashlib
import json
import os
import time
from typing import Optional, Dict, Any
import requests
from app.config import settings
from app.utils.logger import logger

try:
    from fyers_apiv3 import fyersModel
except ImportError:
    fyersModel = None  # Handled gracefully if not installed or during testing


class FyersAuthManager:
    """
    Manages FYERS API V3 OAuth 2.0 authentication flow, token caching,
    and FyersModel client instances.
    """

    def __init__(self):
        self._access_token: Optional[str] = settings.FYERS_ACCESS_TOKEN
        self._refresh_token: Optional[str] = None
        self._token_file = settings.TOKEN_CACHE_FILE
        self._load_cached_token()

    def is_token_expired(self, token: Optional[str] = None) -> bool:
        """Returns True if the JWT token has expired or is invalid."""
        t = token or self._access_token
        if not t:
            return True
        try:
            parts = t.split(".")
            if len(parts) >= 2:
                padding = "=" * (4 - (len(parts[1]) % 4))
                payload = json.loads(base64.urlsafe_b64decode(parts[1] + padding))
                exp = payload.get("exp")
                if exp:
                    return time.time() >= exp
        except Exception as e:
            logger.warning(f"Error checking token expiration: {e}")
        return False

    def _load_cached_token(self) -> None:
        """Attempts to load a previously saved valid access token from cache."""
        if self._access_token:
            if not self.is_token_expired(self._access_token):
                logger.info("Using valid FYERS access token provided in settings/environment.")
                return
            else:
                logger.warning("FYERS access token in settings/environment has expired.")
                self._access_token = None

        if os.path.exists(self._token_file):
            try:
                with open(self._token_file, "r") as f:
                    data = json.load(f)
                    token = data.get("access_token")
                    refresh_token = data.get("refresh_token")
                    self._refresh_token = refresh_token
                    if token:
                        if not self.is_token_expired(token):
                            self._access_token = token
                            logger.info("Loaded valid cached FYERS access token from disk.")
                        else:
                            logger.warning("Cached FYERS access token on disk has expired (SEBI 6:00 AM daily reset).")
                            self._access_token = None
            except Exception as e:
                logger.warning(f"Failed to read cached token file: {e}")

    def _save_cached_token(self, token: str, refresh_token: Optional[str] = None) -> None:
        """Caches access token to local file (gitignored)."""
        self._access_token = token
        if refresh_token:
            self._refresh_token = refresh_token
        try:
            payload = {"access_token": token}
            if self._refresh_token:
                payload["refresh_token"] = self._refresh_token
            with open(self._token_file, "w") as f:
                json.dump(payload, f)
            logger.info("Successfully cached new FYERS access token to disk.")
        except Exception as e:
            logger.warning(f"Failed to save cached token file: {e}")

    def is_configured(self) -> bool:
        """Returns True if minimum required credentials for FYERS are present."""
        return bool(self._access_token or (settings.FYERS_CLIENT_ID and settings.FYERS_SECRET_KEY))

    def is_authenticated(self) -> bool:
        """Returns True only if a valid, unexpired access token is currently available."""
        if not self._access_token:
            return False
        return not self.is_token_expired(self._access_token)

    def get_access_token(self) -> Optional[str]:
        return self._access_token

    def get_login_url(self, state: str = "tradoeasy") -> Dict[str, Any]:
        """
        Generates the official FYERS OAuth 2.0 authorization URL for user login.
        """
        if not fyersModel:
            raise RuntimeError("fyers_apiv3 SDK is not installed.")
        if not settings.FYERS_CLIENT_ID or not settings.FYERS_SECRET_KEY:
            raise ValueError("FYERS_CLIENT_ID and FYERS_SECRET_KEY must be configured in .env")

        session = fyersModel.SessionModel(
            client_id=settings.FYERS_CLIENT_ID,
            secret_key=settings.FYERS_SECRET_KEY,
            redirect_uri=settings.FYERS_REDIRECT_URI,
            response_type="code",
            grant_type="authorization_code",
            state=state,
        )
        auth_url = session.generate_authcode()
        return {
            "auth_url": auth_url,
            "redirect_uri": settings.FYERS_REDIRECT_URI,
            "client_id": settings.FYERS_CLIENT_ID
        }

    def exchange_auth_code(self, auth_code: str) -> Dict[str, Any]:
        """
        Exchanges the authorization code returned by FYERS for a valid access_token.
        """
        if not fyersModel:
            raise RuntimeError("fyers_apiv3 SDK is not installed.")
        if not settings.FYERS_CLIENT_ID or not settings.FYERS_SECRET_KEY:
            raise ValueError("FYERS_CLIENT_ID and FYERS_SECRET_KEY must be configured in .env")

        session = fyersModel.SessionModel(
            client_id=settings.FYERS_CLIENT_ID,
            secret_key=settings.FYERS_SECRET_KEY,
            redirect_uri=settings.FYERS_REDIRECT_URI,
            response_type="code",
            grant_type="authorization_code",
        )
        session.set_token(auth_code)
        response = session.generate_token()

        if isinstance(response, dict) and response.get("s") == "ok":
            token = response.get("access_token")
            refresh_token = response.get("refresh_token")
            if token:
                self._save_cached_token(token, refresh_token)
                return {
                    "success": True,
                    "message": "FYERS authentication successful. Access token generated.",
                    "status": "ok"
                }

        error_msg = response.get("message", "Unknown FYERS authentication error") if isinstance(response, dict) else str(response)
        logger.error(f"FYERS auth error: {error_msg}")
        return {
            "success": False,
            "message": error_msg,
            "status": "error"
        }

    def update_credentials(self, client_id: str, secret_key: str, redirect_uri: Optional[str] = None) -> Dict[str, Any]:
        """Updates runtime FYERS credentials."""
        if client_id:
            settings.FYERS_CLIENT_ID = client_id.strip()
        if secret_key:
            settings.FYERS_SECRET_KEY = secret_key.strip()
        if redirect_uri:
            settings.FYERS_REDIRECT_URI = redirect_uri.strip()
        return {
            "success": True,
            "message": "Credentials updated successfully",
            "client_id": settings.FYERS_CLIENT_ID
        }

    def set_direct_token(self, token: str) -> Dict[str, Any]:
        """Allows directly setting an active access token."""
        token_clean = token.strip()
        if not token_clean or len(token_clean) < 10:
            return {"success": False, "message": "Invalid token format"}
        self._save_cached_token(token_clean)
        return {"success": True, "message": "Token updated successfully"}

    def get_fyers_client(self) -> Optional[Any]:
        """
        Returns an initialized FyersModel instance if an access token is available.
        """
        if not fyersModel or not self._access_token:
            return None
        return fyersModel.FyersModel(
            token=self._access_token,
            is_async=False,
            client_id=settings.FYERS_CLIENT_ID,
            log_path=""
        )

    def validate_connection(self) -> Dict[str, Any]:
        """Validates current token with FYERS by invoking profile endpoint."""
        if not self._access_token:
            return {"valid": False, "message": "No active access token"}
        if self.is_token_expired(self._access_token):
            return {"valid": False, "message": "FYERS access token expired at 06:00 AM IST today. Please generate a new token."}
        client = self.get_fyers_client()
        if not client:
            return {"valid": False, "message": "No active access token"}
        try:
            profile = client.get_profile()
            if isinstance(profile, dict) and profile.get("s") == "ok":
                return {
                    "valid": True,
                    "name": profile.get("data", {}).get("name", "User"),
                    "fy_id": profile.get("data", {}).get("fy_id", "")
                }
            return {"valid": False, "message": profile.get("message", "Profile lookup failed")}
        except Exception as e:
            logger.error(f"FYERS token validation error: {e}")
            return {"valid": False, "message": str(e)}


fyers_auth_manager = FyersAuthManager()

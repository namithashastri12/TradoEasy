import json
import os
from typing import Optional, Dict, Any
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
        self._token_file = settings.TOKEN_CACHE_FILE
        self._load_cached_token()

    def _load_cached_token(self) -> None:
        """Attempts to load a previously saved valid access token from cache."""
        if self._access_token:
            logger.info("Using FYERS access token provided in settings/environment.")
            return

        if os.path.exists(self._token_file):
            try:
                with open(self._token_file, "r") as f:
                    data = json.load(f)
                    token = data.get("access_token")
                    if token:
                        self._access_token = token
                        logger.info("Loaded cached FYERS access token from disk.")
            except Exception as e:
                logger.warning(f"Failed to read cached token file: {e}")

    def _save_cached_token(self, token: str) -> None:
        """Caches access token to local file (gitignored)."""
        self._access_token = token
        try:
            with open(self._token_file, "w") as f:
                json.dump({"access_token": token}, f)
            logger.info("Successfully cached new FYERS access token to disk.")
        except Exception as e:
            logger.warning(f"Failed to save cached token file: {e}")

    def is_configured(self) -> bool:
        """Returns True if minimum required credentials for FYERS are present."""
        return bool(self._access_token or (settings.FYERS_CLIENT_ID and settings.FYERS_SECRET_KEY))

    def is_authenticated(self) -> bool:
        """Returns True if a valid access token is currently available."""
        return bool(self._access_token)

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
            if token:
                self._save_cached_token(token)
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

import logging
import re
import sys

# Regex patterns to sanitize sensitive tokens/secrets
SENSITIVE_PATTERNS = [
    (re.compile(r'(access_token["\':\s=]+)([A-Za-z0-9-_.]+)', re.IGNORECASE), r'\1***REDACTED***'),
    (re.compile(r'(secret_key["\':\s=]+)([A-Za-z0-9-_.]+)', re.IGNORECASE), r'\1***REDACTED***'),
    (re.compile(r'(auth_code["\':\s=]+)([A-Za-z0-9-_.]+)', re.IGNORECASE), r'\1***REDACTED***'),
    (re.compile(r'(appIdHash["\':\s=]+)([A-Za-z0-9-_.]+)', re.IGNORECASE), r'\1***REDACTED***'),
    (re.compile(r'(Bearer\s+)([A-Za-z0-9-_.]+)', re.IGNORECASE), r'\1***REDACTED***'),
]


class SafeFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        msg = super().format(record)
        for pattern, replacement in SENSITIVE_PATTERNS:
            msg = pattern.sub(replacement, msg)
        return msg


def setup_logger(name: str = "tradoeasy") -> logging.Logger:
    logger = logging.getLogger(name)
    if not logger.handlers:
        logger.setLevel(logging.INFO)
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(
            SafeFormatter("[%(asctime)s] [%(levelname)s] [%(name)s]: %(message)s", datefmt="%Y-%m-%d %H:%M:%S")
        )
        logger.addHandler(handler)
        logger.propagate = False
    return logger


logger = setup_logger()

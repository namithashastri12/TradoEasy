import time
import uuid
from typing import Dict, List, Optional
from app.models.market import NormalizedTick, AlertRule, AlertNotification
from app.utils.logger import logger


class AlertsEngine:
    """
    Evaluates real-time market ticks against user-configured alert rules.
    Includes cooldown and deduplication logic to prevent notification spam.
    Purely informational: does NOT execute trades or orders.
    """

    def __init__(self, default_cooldown_seconds: int = 300):
        self.default_cooldown = default_cooldown_seconds
        self._rules: Dict[str, AlertRule] = {}
        self._last_triggered: Dict[str, float] = {}  # rule_id -> timestamp

    def add_rule(self, rule: AlertRule) -> AlertRule:
        self._rules[rule.id] = rule
        logger.info(f"Added alert rule: {rule.symbol} {rule.type} {rule.threshold}")
        return rule

    def remove_rule(self, rule_id: str) -> bool:
        if rule_id in self._rules:
            del self._rules[rule_id]
            if rule_id in self._last_triggered:
                del self._last_triggered[rule_id]
            logger.info(f"Removed alert rule: {rule_id}")
            return True
        return False

    def get_rules(self) -> List[AlertRule]:
        return list(self._rules.values())

    def clear_rules(self) -> None:
        self._rules.clear()
        self._last_triggered.clear()

    def evaluate_tick(self, tick: NormalizedTick) -> List[AlertNotification]:
        """
        Evaluates an incoming normalized tick against all active rules for that symbol.
        Returns a list of triggered alert notifications.
        """
        notifications: List[AlertNotification] = []
        now = time.time()

        for rule in self._rules.values():
            if rule.symbol != tick.symbol:
                continue

            # Cooldown check
            last_time = self._last_triggered.get(rule.id, 0.0)
            cooldown = rule.cooldown_seconds if rule.cooldown_seconds > 0 else self.default_cooldown
            if now - last_time < cooldown:
                continue

            triggered = False
            triggered_value = 0.0
            msg = ""

            if rule.type == "PRICE_ABOVE" and tick.ltp >= rule.threshold:
                triggered = True
                triggered_value = tick.ltp
                msg = f"{tick.ticker} crossed above ₹{rule.threshold:.2f} (LTP: ₹{tick.ltp:.2f})"
            elif rule.type == "PRICE_BELOW" and tick.ltp <= rule.threshold:
                triggered = True
                triggered_value = tick.ltp
                msg = f"{tick.ticker} dropped below ₹{rule.threshold:.2f} (LTP: ₹{tick.ltp:.2f})"
            elif rule.type == "RVOL_ABOVE" and tick.relative_volume >= rule.threshold:
                triggered = True
                triggered_value = tick.relative_volume
                msg = f"{tick.ticker} relative volume reached {tick.relative_volume:.2f}x (Threshold: {rule.threshold:.2f}x)"
            elif rule.type == "CHANGE_PCT_ABOVE" and tick.change_percent >= rule.threshold:
                triggered = True
                triggered_value = tick.change_percent
                msg = f"{tick.ticker} surged {tick.change_percent:+.2f}% (Threshold: +{rule.threshold:.2f}%)"
            elif rule.type == "CHANGE_PCT_BELOW" and tick.change_percent <= rule.threshold:
                triggered = True
                triggered_value = tick.change_percent
                msg = f"{tick.ticker} declined {tick.change_percent:+.2f}% (Threshold: {rule.threshold:.2f}%)"

            if triggered:
                self._last_triggered[rule.id] = now
                notification = AlertNotification(
                    id=str(uuid.uuid4()),
                    rule_id=rule.id,
                    symbol=tick.symbol,
                    ticker=tick.ticker,
                    title=f"Alert: {tick.ticker}",
                    message=msg,
                    triggered_value=triggered_value,
                    threshold=rule.threshold,
                    timestamp=int(now)
                )
                notifications.append(notification)
                logger.info(f"Alert triggered: {notification.message}")

        return notifications

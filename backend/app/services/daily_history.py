import os
import sqlite3
import time
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from app.utils.logger import logger

DB_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "data")
DB_FILE = os.path.join(DB_DIR, "daily_history.db")


class DailyHistoryManager:
    """
    Manages daily market data persistence with a rolling 15-day retention policy.
    Saves each trading session's completed volume, price, change, and RVOL,
    and automatically purges records older than 15 trading sessions.
    """

    def __init__(self, db_path: str = DB_FILE, retention_sessions: int = 15):
        self.db_path = db_path
        self.retention_sessions = retention_sessions
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        self._init_db()

    def _get_connection(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self) -> None:
        """Initializes the SQLite schema."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS daily_stock_history (
                    date TEXT NOT NULL,
                    symbol TEXT NOT NULL,
                    ticker TEXT NOT NULL,
                    name TEXT,
                    sector TEXT,
                    open_price REAL,
                    high_price REAL,
                    low_price REAL,
                    close_price REAL,
                    prev_close REAL,
                    change REAL,
                    change_percent REAL,
                    today_volume INTEGER,
                    avg_volume_45d INTEGER,
                    relative_volume REAL,
                    timestamp INTEGER,
                    PRIMARY KEY (date, symbol)
                )
            """)
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_history_date ON daily_stock_history(date)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_history_symbol ON daily_stock_history(symbol)")
            conn.commit()
        logger.info(f"DailyHistoryManager: initialized SQLite database at {self.db_path}")

    def record_daily_snapshot(self, ticks: List[Any], date_str: Optional[str] = None) -> int:
        """
        Saves or updates today's market metrics for all stocks.
        Automatically enforces the 15-session rolling retention cleanup.
        """
        if not ticks:
            return 0

        if not date_str:
            date_str = datetime.now().strftime("%Y-%m-%d")

        records_saved = 0
        with self._get_connection() as conn:
            cursor = conn.cursor()
            for t in ticks:
                # Handle either NormalizedTick model or dict
                if hasattr(t, "symbol"):
                    sym = t.symbol
                    ticker = t.ticker
                    name = t.company_name
                    sector = t.sector
                    open_p = t.open_price
                    high_p = t.high_price
                    low_p = t.low_price
                    close_p = t.ltp
                    prev_c = t.prev_close
                    change = t.change
                    chg_pct = t.change_percent
                    vol = t.today_volume
                    avg_vol = t.avg_volume
                    rvol = t.relative_volume
                    ts = t.timestamp
                else:
                    sym = t.get("symbol")
                    ticker = t.get("ticker", sym.split(":")[-1].replace("-EQ", ""))
                    name = t.get("company_name", "")
                    sector = t.get("sector", "")
                    open_p = t.get("open_price", 0.0)
                    high_p = t.get("high_price", 0.0)
                    low_p = t.get("low_price", 0.0)
                    close_p = t.get("ltp", 0.0)
                    prev_c = t.get("prev_close", 0.0)
                    change = t.get("change", 0.0)
                    chg_pct = t.get("change_percent", 0.0)
                    vol = t.get("today_volume", 0)
                    avg_vol = t.get("avg_volume", 0)
                    rvol = t.get("relative_volume", 0.0)
                    ts = t.get("timestamp", int(time.time()))

                cursor.execute("""
                    INSERT OR REPLACE INTO daily_stock_history (
                        date, symbol, ticker, name, sector,
                        open_price, high_price, low_price, close_price, prev_close,
                        change, change_percent, today_volume, avg_volume_45d, relative_volume, timestamp
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    date_str, sym, ticker, name, sector,
                    open_p, high_p, low_p, close_p, prev_c,
                    change, chg_pct, vol, avg_vol, rvol, ts
                ))
                records_saved += 1

            conn.commit()

        # Clean up records outside the 15-day rolling window
        self.cleanup_old_records()
        logger.info(f"DailyHistoryManager: saved {records_saved} stocks for date {date_str}")
        return records_saved

    def cleanup_old_records(self) -> int:
        """
        Enforces the 15-day rolling retention rule.
        Keeps the latest 15 distinct trading dates and purges all older records.
        """
        with self._get_connection() as conn:
            cursor = conn.cursor()
            # Fetch all distinct dates sorted descending
            cursor.execute("SELECT DISTINCT date FROM daily_stock_history ORDER BY date DESC")
            all_dates = [row[0] for row in cursor.fetchall()]

            if len(all_dates) <= self.retention_sessions:
                return 0

            # Dates to keep: top 15
            dates_to_keep = set(all_dates[:self.retention_sessions])
            dates_to_delete = all_dates[self.retention_sessions:]

            placeholders = ",".join("?" for _ in dates_to_delete)
            cursor.execute(f"DELETE FROM daily_stock_history WHERE date IN ({placeholders})", dates_to_delete)
            deleted_count = cursor.rowcount
            conn.commit()

        logger.info(f"DailyHistoryManager: purged {deleted_count} records across {len(dates_to_delete)} expired dates (keeping {self.retention_sessions} latest sessions)")
        return deleted_count

    def get_available_dates(self) -> List[str]:
        """Returns all distinct dates currently preserved in the 15-day window."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT DISTINCT date FROM daily_stock_history ORDER BY date DESC")
            return [row[0] for row in cursor.fetchall()]

    def get_day_snapshot(self, date_str: str) -> List[Dict[str, Any]]:
        """Returns the full 208-stock records for a specific saved date."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT * FROM daily_stock_history
                WHERE date = ?
                ORDER BY relative_volume DESC
            """, (date_str,))
            rows = cursor.fetchall()
            return [dict(r) for r in rows]

    def get_symbol_history(self, symbol: str, limit: int = 15) -> List[Dict[str, Any]]:
        """Returns daily history for a given symbol over the rolling window."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT * FROM daily_stock_history
                WHERE symbol = ? OR ticker = ?
                ORDER BY date DESC
                LIMIT ?
            """, (symbol, symbol, limit))
            rows = cursor.fetchall()
            return [dict(r) for r in rows]

    def get_summary(self) -> Dict[str, Any]:
        """Returns a diagnostic summary of the daily history database."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*), COUNT(DISTINCT date) FROM daily_stock_history")
            total_records, distinct_dates = cursor.fetchone()
            cursor.execute("SELECT MIN(date), MAX(date) FROM daily_stock_history")
            min_date, max_date = cursor.fetchone()

        return {
            "total_records": total_records or 0,
            "total_dates_saved": distinct_dates or 0,
            "retention_limit_sessions": self.retention_sessions,
            "oldest_date": min_date,
            "newest_date": max_date,
            "available_dates": self.get_available_dates()
        }

    def seed_from_fyers(self, fyers_client, instruments_data: List[Dict[str, Any]]) -> None:
        """
        Seeds the database with the last 14 completed trading days from FYERS API
        if the database is currently empty or has few dates.
        """
        available = self.get_available_dates()
        if len(available) >= 10:
            logger.info("DailyHistoryManager: database already has sufficient daily history.")
            return

        logger.info(f"DailyHistoryManager: seeding 15-day history from FYERS for {len(instruments_data)} stocks...")
        today = datetime.now().date()
        from_date = (today - timedelta(days=25)).strftime("%Y-%m-%d")
        to_date = today.strftime("%Y-%m-%d")

        records_added = 0
        with self._get_connection() as conn:
            cursor = conn.cursor()
            for item in instruments_data:
                sym = item["symbol"]
                ticker = item["ticker"]
                name = item["name"]
                sector = item["sector"]
                avg_vol = item["default_avg_volume"]

                try:
                    res = fyers_client.history(data={
                        "symbol": sym,
                        "resolution": "D",
                        "date_format": "1",
                        "range_from": from_date,
                        "range_to": to_date,
                        "cont_flag": "1"
                    })
                    candles = res.get("candles", []) if isinstance(res, dict) else []
                    for c in candles:
                        ts = int(c[0])
                        d_str = datetime.fromtimestamp(ts).strftime("%Y-%m-%d")
                        open_p = float(c[1])
                        high_p = float(c[2])
                        low_p = float(c[3])
                        close_p = float(c[4])
                        vol = int(c[5])
                        prev_c = open_p
                        change = round(close_p - prev_c, 2)
                        chg_pct = round((change / prev_c) * 100, 2) if prev_c > 0 else 0.0
                        rvol = round(vol / avg_vol, 2) if avg_vol > 0 else 1.0

                        cursor.execute("""
                            INSERT OR IGNORE INTO daily_stock_history (
                                date, symbol, ticker, name, sector,
                                open_price, high_price, low_price, close_price, prev_close,
                                change, change_percent, today_volume, avg_volume_45d, relative_volume, timestamp
                            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        """, (
                            d_str, sym, ticker, name, sector,
                            open_p, high_p, low_p, close_p, prev_c,
                            change, chg_pct, vol, avg_vol, rvol, ts
                        ))
                        records_added += 1
                except Exception as e:
                    logger.debug(f"History seed error for {sym}: {e}")

            conn.commit()

        self.cleanup_old_records()
        logger.info(f"DailyHistoryManager: seeding complete! Added {records_added} historical records across {len(self.get_available_dates())} sessions.")


# Global singleton instance
daily_history_manager = DailyHistoryManager()

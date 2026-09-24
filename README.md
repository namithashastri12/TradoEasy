# tradoeasy · REAL-TIME MARKET INTELLIGENCE

A production-quality full-stack real-time market monitoring and stock-scanning dashboard designed for active Indian market traders during live market sessions.

`tradoeasy` is engineered to monitor real-time market movement, cumulative volume, relative volume (RVOL), price changes, sectoral indices, and personal Support/Resistance levels using **official FYERS API V3**.

---

## Architecture & Data Flow

```
FYERS Market Data WebSocket (FyersDataSocket in SymbolUpdate mode)
   │
   ▼
Backend Market-Data Service (FastAPI + Python async)
   │
   ├── In-memory market state engine & catalog
   ├── 20-day historical average volume calculation (FYERS history API)
   ├── Derived metric calculations (RVOL = currentVolume / averageVolume)
   ├── Volume spike detection (RVOL ≥ 2.0x threshold)
   ├── Indian market hours evaluation (IST: PRE-MARKET, OPEN, CLOSED)
   └── Real-time alert threshold checking & cooldown deduplication
   │
   ▼
FastAPI WebSocket Connection Manager (/ws/market)
   │
   ▼
React Dashboard (Vite + TypeScript + Tailwind CSS)
   │
   ├── Sticky scanner table with flash movement animations
   ├── Live summary metric cards (Monitored, Above Avg Vol, High RVOL, Gainers, Losers)
   ├── Multi-parameter combined filtering (Universe, RVOL, Volume, Price Change, Sector, Search)
   ├── Support & Resistance personal observations persisted in localStorage
   ├── 1-minute auto-refresh cycle preserving active filters without reset
   └── Dual-mode indicator: LIVE · FYERS vs. DEMO MODE · NOT LIVE
```

> [!IMPORTANT]
> **Zero Browser Secrets**: The frontend browser client contains **no** FYERS client secrets, secret keys, or private authorization tokens. All API authentication and WebSocket communication with FYERS happens exclusively server-side.

---

## Features

1. **Real FYERS Market Data (API V3)**:
   - Built on the current official `fyers-apiv3` Python SDK and WebSocket protocol (`SymbolUpdate` mode).
   - Validates instruments using standard FYERS format (e.g. `NSE:INFY-EQ`, `NSE:SBIN-EQ`, `NSE:RELIANCE-EQ`).

2. **Real-Time Volume & Price Scanner**:
   - **Sl.**: Sequential row index.
   - **Stock**: Bold ticker symbol and company name.
   - **Avg Volume**: 20-day historical Simple Moving Average volume.
   - **Today's Volume**: Cumulative traded session volume.
   - **Rel. Vol. (RVOL)**: Real-time ratio of today's volume to average volume (`currentVolume / averageVolume`). Unusually high RVOL (≥ 2.0x) is visually highlighted with an amber glowing badge.
   - **Last Price**: Indian currency formatting (`₹1,245.30`).
   - **Price Change**: Absolute and percentage change (`+₹45.20 (+2.45%)` in green, `-₹20.10 (-1.12%)` in red).
   - **Sector**: Real sector classification.
   - **Support & Resistance**: Personal trader inputs saved locally in `localStorage` keyed by normalized symbol. Survives reloads, reconnects, live ticks, and filter adjustments.

3. **Multi-Parameter Combined Filtering**:
   - Filter simultaneously by:
     - **Market Universe**: NIFTY 50, NIFTY NEXT 50, NIFTY 100, NIFTY 200, NIFTY 500 (Default), NIFTY Bank, NIFTY IT, NIFTY Auto, NIFTY Pharma, NIFTY FMCG, NIFTY Energy, NIFTY Metal, NIFTY Financial Services.
     - **RVOL**: All, ≥ 1.0x, ≥ 1.5x, ≥ 2.0x, ≥ 3.0x.
     - **Volume**: All, Above Average, Below Average, High Volume (>1.5x).
     - **Price Change**: All, Positive (+), Negative (-), ≥ +1%, ≥ +2%, ≤ -1%, ≤ -2%.
     - **Sector**: All, IT, Banking, Financial Services, Energy, Healthcare, Pharma, FMCG, Automobile, Metals, Telecom, Industrials, Consumer.
     - **Stock Search**: Instant ticker, symbol, or company name search.
   - Every active filter applies simultaneously without page refresh.

4. **1-Minute Auto-Refresh with Filter Persistence**:
   - The dashboard automatically synchronizes full market snapshot state every 60 seconds (1 minute).
   - All active filter selections and personal Support/Resistance observations **remain applied** without resetting.

5. **Clear Saved Notes**:
   - Dedicated "Clear Notes" button with a confirmation modal.
   - Deletes personal Support/Resistance observations from local storage only, without clearing filters, market data, or configurations.

6. **Real-Time Informational Alerts**:
   - Configure alerts for Price Above/Below, RVOL Spike, or Percentage Surge/Decline.
   - Cooldown and deduplication logic prevents repetitive alert spamming.
   - Non-intrusive toast notifications at the bottom-right.
   - **Notice**: Purely informational; does not execute trades or place orders.

7. **Market Hours & Stale Data Detection**:
   - Real Indian equity market schedule in IST (UTC+5:30): PRE-MARKET (09:00 - 09:15), MARKET OPEN (09:15 - 15:30), MARKET CLOSED (outside hours and weekends).
   - Detects when updates pause for > 20s and marks data as `DATA STALE · Last update Xs ago`.

8. **Dual Application Modes**:
   - **LIVE MODE**: Streams real-time ticks from FYERS Data WebSocket. Displays `● LIVE · FYERS`.
   - **DEMO MODE**: Deterministic simulated market data with micro-movements and volume progression for off-hours and development without credentials. Displays `● DEMO MODE · NOT LIVE` and top banner.

---

## Technology Stack

- **Frontend**:
  - React 19
  - TypeScript
  - Vite 6
  - Tailwind CSS 3
  - Lucide React icons
- **Backend**:
  - Python 3.12
  - FastAPI
  - Uvicorn
  - WebSockets
  - `fyers-apiv3` (Official SDK)
  - Pydantic v2 & Pydantic Settings
  - Pytest & Pytest-asyncio

---

## FYERS API V3 Setup & Authentication

1. Log into your [FYERS API Dashboard](https://myapi.fyers.in/dashboard/).
2. Create an App:
   - **App Name**: `TradoEasy`
   - **Redirect URI**: `http://127.0.0.1:8000/api/auth/callback` (or your domain)
   - Copy your **App ID / Client ID** (typically format: `[USER_ID]-[APP_TYPE]`, e.g. `XC12345-100`) and **Secret Key**.
3. In `backend/.env`, set:
   ```env
   APP_MODE=live
   FYERS_CLIENT_ID=XC12345-100
   FYERS_SECRET_KEY=your_secret_key_here
   FYERS_REDIRECT_URI=http://127.0.0.1:8000/api/auth/callback
   ```
4. **OAuth Login Flow**:
   - Start the backend and invoke `POST /api/auth/url` to receive the authorization URL.
   - Open the URL in your browser, log into FYERS, and authorize the app.
   - FYERS redirects to your Redirect URI with `?auth_code=...`.
   - Submit the auth code to `POST /api/auth/token` with `{"auth_code": "..."}`.
   - The token is securely cached in `fyers_token.json` (gitignored).
5. **Direct Daily Access Token Option**:
   - If you already generate a daily token (e.g., via Python script or FYERS web session), you can provide it directly:
     ```env
     FYERS_ACCESS_TOKEN=your_daily_access_token
     ```
     Or submit to `POST /api/auth/direct-token`.

---

## Local Development Setup

### 1. Backend Setup

```bash
# Navigate to backend
cd backend

# Create Python virtual environment (optional but recommended)
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env

# Run unit tests
pytest -v

# Start FastAPI server
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

The backend starts at `http://127.0.0.1:8000`.
- API Health: `http://127.0.0.1:8000/health`
- API Documentation: `http://127.0.0.1:8000/docs`
- Market Snapshot: `http://127.0.0.1:8000/api/snapshot`
- Market WebSocket: `ws://127.0.0.1:8000/ws/market`

### 2. Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install npm dependencies
npm install

# Run typecheck and production build test
npm run build

# Start Vite development server
npm run dev
```

Open `http://localhost:5173` in your browser.

### 3. One-Click Windows Launch

Run the provided batch script in the root directory:
```cmd
start_dev.bat
```

---

## Deployment Architecture

### Frontend (Vercel)
The React SPA is configured for continuous deployment on [Vercel](https://vercel.com):
- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`
- Rewrites configured in `frontend/vercel.json` for single-page routing.

Set the following environment variable in Vercel if connecting to a remote backend:
- `VITE_BACKEND_URL`: URL of your deployed backend service (e.g. `https://api.yourdomain.com`).

### Backend (Persistent VM or Container)
> [!IMPORTANT]
> **Persistent Connection Requirement**: Serverless functions (like AWS Lambda or Vercel Serverless) have short execution timeouts and cannot maintain the persistent WebSocket connection required by FYERS `FyersDataSocket`.

Deploy the FastAPI backend to a persistent environment such as:
- **Render.com** (Web Service)
- **Railway.app**
- **DigitalOcean App Platform / Droplet**
- **AWS EC2 / ECS / Google Cloud Run (with WebSockets enabled)**

Set all server-side environment variables (`FYERS_CLIENT_ID`, `FYERS_SECRET_KEY`, `FYERS_REDIRECT_URI`, `APP_MODE=live`, `CORS_ORIGINS`) securely in your hosting platform dashboard.

---

## Expired F&O Modular Architecture

Per FYERS API V3 specifications, endpoints for expired F&O contract data are modularly abstracted in `app/services/historical_data.py`:
- `fyers.expiry_dates` -> `GET /api/fno/expiry-dates`
- `fyers.history_underlying_symbols` -> `GET /api/fno/contracts`
- `fyers.fno_historical_data` -> `GET /api/fno/historical-data`

This ensures the live scanner remains lightweight and fast, while leaving the door open for future historical analysis or backtesting modules.

---

## Disclaimer

`tradoeasy` is a market-monitoring and intelligence dashboard. It calculates objective market statistics such as relative volume, price changes, and technical levels. It does **not** provide personalized financial advice, buy/sell recommendations, or automatic trade execution.

# Cryptex — Professional Crypto Trading Platform

A full-stack paper trading platform with Django REST API backend and React frontend.

## Features
- **Real-time market data** for 15 major cryptocurrencies
- **Full trading engine** — Market, Limit, and Stop orders
- **Portfolio tracking** — P&L, holdings, allocation chart
- **Order book visualization** with live bid/ask prices
- **Transaction & order history**
- **Wallet management** — deposit virtual funds
- **JWT authentication** — secure login/register
- **Django ORM** — SQLite database (easy swap to PostgreSQL)

## Tech Stack
- **Backend**: Django 4 + Django REST Framework + SimpleJWT
- **Frontend**: React 18 + Vite + Recharts
- **Database**: SQLite (models in `backend/trading/models.py`)
- **Auth**: JWT tokens (access 24h, refresh 7d)

## Getting Started

### Option 1 — Startup script
```bash
./start.sh
```

### Option 2 — Manual
```bash
# Terminal 1 — Django
cd backend
python manage.py runserver 8000

# Terminal 2 — React
cd frontend
npm run dev
```

Then open http://localhost:5173

**Demo account**: `demo` / `demo1234` (starts with $100,000 USD)

## API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register/ | Register new user |
| POST | /api/auth/login/ | Get JWT tokens |
| GET | /api/market/ | All market data |
| GET | /api/market/{symbol}/ | Coin detail + chart data |
| GET | /api/portfolio/ | User portfolio |
| POST | /api/orders/ | Place order (buy/sell) |
| GET | /api/orders/history/ | Order history |
| GET | /api/transactions/ | Transaction history |
| GET/POST/DELETE | /api/watchlist/ | Manage watchlist |
| GET | /api/account/ | Account info |
| POST | /api/deposit/ | Add funds |

## Django Models
- `UserProfile` — USD balance tied to Django User
- `Holding` — crypto positions with avg buy price
- `Order` — order records (market/limit/stop, filled details)
- `Transaction` — full audit trail
- `WatchlistItem` — user watchlists

## Production Notes
- Swap SQLite for PostgreSQL in `settings.py`
- Connect a real crypto price API (CoinGecko, Binance)
- Set `DEBUG=False` and proper `SECRET_KEY`
- Add Redis for WebSocket live price streaming

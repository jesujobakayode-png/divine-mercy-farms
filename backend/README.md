# Divine Mercy Farms API

Recovered backend for the poultry farm management system. It includes authentication, flocks, mortality, production, customers, sales, payments, expenses, customer credit balances, and the dashboard API.

## Run it

1. Install Node.js (current LTS) and MongoDB, or get a MongoDB Atlas connection string.
2. Copy `.env.example` to `.env`, then set `MONGODB_URI` and a long `JWT_SECRET`.
3. Run `npm install`.
4. Run `npm run dev`.
5. Open `http://localhost:5000/api/health`.

## API groups

- `/api/auth` — register, login, current user
- `/api/flocks`, `/api/mortalities`, `/api/production`
- `/api/customers`, `/api/sales`, `/api/payments`
- `/api/expenses` and `/api/expenses/summary`
- `/api/dashboard`

All routes except registration, login, and health require `Authorization: Bearer <token>`.

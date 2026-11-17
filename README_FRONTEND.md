# Vaxad School Platform — Frontend Baseline

## Start

```powershell
cd frontend
npm install
npm run dev
```

Open http://localhost:5173.

## Development login

Username: `admin`
Password: `@Vax1234.com`

## API

Backend: http://localhost:8080

Authentication: `POST /api/auth/login`
Dashboard: `GET /api/v1/dashboard/summary`

RTK Query automatically sends `Authorization: Bearer <token>` to `/api/v1/*` after login.

Optional Vite environment variables:

`VITE_AUTH_API_URL=http://localhost:8080/api`
`VITE_API_URL=http://localhost:8080/api/v1`

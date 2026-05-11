# MindCare AI Deployment Checklist

Use this checklist to deploy the full stack:

- Frontend: Vercel (`client`)
- Backend: Render or Railway (`server`)
- ML service: Render, Railway, or Cloud Run (`ml-service`)
- Database: MongoDB Atlas

## 1. Prepare Frontend (Vercel)

- In Vercel, import the repo and set **Root Directory** to `client`.
- Build command: `npm run build`
- Output directory: `dist`
- Set environment variable:
  - `VITE_API_URL=https://<your-backend-domain>/api`
- Deploy and note your frontend URL:
  - example `https://mindcare-ai.vercel.app`

`client/vercel.json` is included for React Router SPA fallback.

## 2. Prepare Backend (Render or Railway)

- Root directory: `server`
- Start command: `npm start`
- Set environment variables:
  - `PORT=5000`
  - `MONGO_URI=<your-atlas-uri>`
  - `JWT_SECRET=<strong-secret>`
  - `JWT_EXPIRE=365d`
  - `CRON_SECRET=<strong-private-cron-secret>`
  - `SMTP_HOST=smtp.gmail.com`
  - `SMTP_PORT=587`
  - `SMTP_SECURE=false`
  - `SMTP_USER=<sender-gmail-address>`
  - `SMTP_PASS=<gmail-app-password>`
  - `EMAIL_FROM="MindCare AI <sender-gmail-address>"`
  - `REMINDER_LOOKBACK_MINUTES=5`
  - `ML_SERVICE_URL=https://<your-ml-service-domain>`
  - `NODE_ENV=production`
  - `CLIENT_URL=https://<your-vercel-production-domain>`
  - `ALLOWED_ORIGINS=https://<optional-custom-frontend-domain>`
  - `ALLOW_VERCEL_PREVIEW=true`
  - `VERCEL_PROJECT_NAME=<your-vercel-project-slug>`

Notes:
- Vercel Hobby only permits daily cron runs. For automatic timetable reminders, use Vercel Pro, Render/Railway always-on hosting, or the included GitHub Actions workflow in `.github/workflows/timetable-reminders.yml`. The workflow calls `/api/timetable/run-reminders` every 5 minutes with `Authorization: Bearer <CRON_SECRET>`, so set `REMINDER_LOOKBACK_MINUTES=5` on the backend.
- `CLIENT_URL` handles your main deployed frontend URL.
- `ALLOW_VERCEL_PREVIEW=true` + `VERCEL_PROJECT_NAME` allows preview deploy URLs like `https://<project>-<preview>.vercel.app`.
- If you do not want preview URLs, keep `ALLOW_VERCEL_PREVIEW=false`.

## 3. Prepare ML Service

- Root directory: `ml-service`
- Start command: `python app.py` (or `gunicorn app:app` for production)
- Set environment variables:
  - `PORT=5001`
  - `MODEL_DIR=./model`
  - `MODEL_PATH=./model/best_model.pkl`

Make sure model files exist in `/model` before deployment.

## 4. Database and Network

- In MongoDB Atlas, allow backend host IP/network access.
- Confirm backend can connect to Atlas.
- Keep secrets in platform env vars only (never hardcode in repo).

## 5. Post-Deploy Smoke Tests

- Frontend loads:
  - `https://<frontend-domain>`
- Backend health:
  - `https://<backend-domain>/health`
- ML health:
  - `https://<ml-domain>/health`
- Register/login works from frontend.
- Any AI insights call from frontend returns data without CORS errors.

## 6. Go-Live Criteria

Deploy is acceptable when all are true:

- Frontend build succeeds on Vercel.
- Backend boots and connects to MongoDB.
- ML service `/predict` and `/predict-advanced` respond.
- No CORS failures from production and preview frontend URLs.

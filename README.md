# AI Interview Preparation Platform

An advanced full-stack web application for practicing technical interviews with AI feedback.

## Features

- User Authentication (JWT)
- Role-based Interviews (9 roles)
- AI Question Generator (Groq / OpenAI)
- Mock Interview Engine (MCQ, Text) backed by a seeded 108-question bank (9 roles × 3 difficulties)
- AI Answer Evaluation (Groq with OpenAI fallback)
- ML Insights: readiness prediction, weak-topic clustering, adaptive difficulty
- AI/ML generated personalised study plan
- Performance Analytics
- Resume Analyzer
- Coding Round
- HR Interview Practice
- Admin Panel

## Tech Stack

**Frontend:** React 18, Tailwind CSS, Recharts, Lucide Icons
**Backend:** Node.js, Express, MongoDB
**AI:** Groq (primary) with OpenAI fallback
**ML:** in-process models (TF-IDF + cosine similarity, k-means, logistic regression) — no Python service needed, and used automatically as a fallback when no LLM key is configured

## Installation

### Backend
```bash
cd server
npm install
```

Configure `server/.env` (copy `server/.env.example`):
```bash
cp .env.example .env
```

### Frontend
```bash
cd client
npm install
```

Create `client/.env` (copy `client/.env.example`):
```bash
cp .env.example .env
```

## Running

**Start MongoDB**

**Seed the question bank and admin user** (idempotent, safe to re-run):
```bash
cd server
npm run seed:questions
npm run seed:admin
```

**Start Backend:**
```bash
cd server
npm start
```

**Start Frontend:**
```bash
cd client
npm start
```

Access at `http://localhost:3000`

**Run backend tests:**
```bash
cd server
npm test
```

## ML API

All routes require a bearer token.

| Method | Route | Description |
| --- | --- | --- |
| POST | `/api/ml/score-answer` | TF-IDF + keyword scoring of an answer against a reference |
| POST | `/api/ml/resume-match` | Resume vs. role skill-gap analysis |
| GET | `/api/ml/readiness` | Logistic-regression readiness prediction trained on your history |
| GET | `/api/ml/recommendations` | k-means weak/strong topic clusters and next difficulty |
| GET | `/api/ml/study-plan?days=7` | AI study plan seeded by ML-derived weak topics |

The UI for these lives at `/insights`.

## Deployment

### Docker Compose (full stack incl. MongoDB)

```bash
cp server/.env.example server/.env   # optional: provide GROQ_API_KEY / OPENAI_API_KEY
JWT_SECRET=$(openssl rand -hex 32) docker compose up --build
```

The client is served by nginx on http://localhost:8080 and proxies `/api` to the API container.
The API container seeds the question bank on start (idempotent), so interviews work immediately.

### Render

`render.yaml` provisions the API (`/api/health` health check) and the static client as a blueprint.
Set `MONGODB_URI`, `CLIENT_URL`, `REACT_APP_API_URL` and, optionally, `GROQ_API_KEY` / `OPENAI_API_KEY` in the dashboard.
After the first deploy, run `npm run seed:questions` once from the service shell to load the question bank.

### Single-process deployment

If `client/build` exists, the API serves it (with SPA fallback), so `npm run build` in `client/` and
starting the server is enough for a one-service deploy.

### Notes

- `CLIENT_URL` accepts a comma-separated list of allowed CORS origins.
- CI (`.github/workflows/ci.yml`) runs the backend jest suite and a production client build on every PR.

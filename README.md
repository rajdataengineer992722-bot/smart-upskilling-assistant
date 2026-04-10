# Smart Upskilling Assistant

An AI-powered learning companion for employees with personalized roadmaps, skill gap analysis, weekly learning plans, chat-based coaching, practical tasks, and gamification.

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, React Query, Axios, Recharts, local ShadCN-style UI components
- Backend: FastAPI, Motor, JWT auth, Groq API integration
- Database: MongoDB
- DevOps: Docker Compose, GitHub Actions CI

## Folder Structure

```text
.
|-- backend
|   |-- app
|   |   |-- api
|   |   |-- core
|   |   |-- db
|   |   |-- schemas
|   |   `-- services
|   |-- Dockerfile
|   `-- requirements.txt
|-- frontend
|   |-- public
|   |-- src
|   |   |-- api
|   |   |-- components
|   |   |-- hooks
|   |   |-- lib
|   |   |-- pages
|   |   `-- types
|   |-- package.json
|   `-- tailwind.config.js
|-- .env.example
|-- docker-compose.yml
`-- README.md
```

## Features

- JWT-based authentication
- Personalized skill gap analysis
- AI-generated learning recommendations
- Weekly learning plan generation
- Context-aware chat assistant
- Gamification with badges and leaderboard
- Responsive analytics dashboard

## Backend API

- `POST /api/signup`
- `POST /api/login`
- `GET /api/profile`
- `POST /api/update-profile`
- `POST /api/recommend-learning`
- `POST /api/generate-weekly-plan`
- `POST /api/skill-gap-analysis`
- `POST /api/chat`
- `GET /api/badges`
- `GET /api/leaderboard`

## Environment Setup

Copy `.env.example` to `.env` and replace the placeholder values.

```bash
cp .env.example .env
```

Variables:

- `GROQ_API_KEY`
- `GROQ_MODEL`
- `GROQ_BASE_URL`
- `MONGODB_URI`
- `DATABASE_NAME`
- `SECRET_KEY`
- `VITE_API_URL`

## Run Locally

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### MongoDB

```bash
docker compose up mongodb -d
```

Backend docs: `http://localhost:8000/docs`

Frontend app: `http://localhost:5173`

## Docker

Run the full stack:

```bash
docker compose up --build
```

## AI Integration

The backend uses Groq when `GROQ_API_KEY` is configured. If no API key is present, it falls back to deterministic demo logic so the product still works for local development and evaluation.

Generated outputs include:

- Skill gaps
- Personalized learning roadmaps
- Weekly plans
- Real-world practice tasks
- Conversational coaching replies

## Production Notes

- Replace the demo `SECRET_KEY`
- Restrict CORS for production domains
- Use MongoDB authentication and backups
- Put the API behind HTTPS
- Store environment variables in a secrets manager

## AWS Deployment Steps

1. Deploy MongoDB using MongoDB Atlas.
2. Build and ship the FastAPI backend to ECS, App Runner, or Elastic Beanstalk.
3. Deploy the frontend to S3 + CloudFront or Vercel.
4. Store secrets in AWS Secrets Manager or SSM Parameter Store.
5. Add HTTPS with ACM and a load balancer or CDN.

## CI/CD

GitHub Actions currently:

- Installs backend dependencies and compiles Python sources
- Installs frontend dependencies and builds the production bundle

You can extend this with test jobs and deployment workflows for your target environment.

## Free Deployment: Vercel + Render + MongoDB Atlas

This repository is prepared for:

- Frontend on Vercel
- Backend on Render
- Database on MongoDB Atlas M0

### 1. MongoDB Atlas

Create a free Atlas cluster and copy the application connection string.

Atlas docs say you can copy the connection string from the cluster's `Connect` flow and must replace the username, password, and database name in that string.
Source: https://www.mongodb.com/docs/atlas/connect-to-cluster/

Use a value like:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/smart_upskilling?retryWrites=true&w=majority
```

Also add your deployment IP access or temporarily allow `0.0.0.0/0` during setup in Atlas, then restrict it later.

### 2. Render Backend

The repo includes [render.yaml](/e:/upskill/render.yaml), so you can deploy from GitHub as a Blueprint or create a Web Service manually.

Recommended Render settings:

- Root directory: `backend`
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Health check path: `/`

Environment variables on Render:

- `GROQ_API_KEY`
- `GROQ_MODEL=llama-3.3-70b-versatile`
- `GROQ_BASE_URL=https://api.groq.com/openai/v1`
- `MONGODB_URI=<your Atlas URI>`
- `DATABASE_NAME=smart_upskilling`
- `SECRET_KEY=<strong random string>`
- `CORS_ORIGINS=https://<your-vercel-app>.vercel.app`

Render docs say the start command is the command Render runs when the service is ready, and free web services are supported with configurable env vars and health checks.
Source: https://render.com/docs/web-services

### 3. Vercel Frontend

The frontend includes [vercel.json](/e:/upskill/frontend/vercel.json) so React Router routes rewrite to `index.html`.

Import the repo into Vercel and set:

- Root directory: `frontend`
- Framework preset: `Vite`
- Environment variable: `VITE_API_URL=https://<your-render-service>.onrender.com/api`

Vercel supports importing a Git repository or deploying from the CLI.
Sources:
- https://vercel.com/docs/deployments
- https://vercel.com/docs/cli/deploy

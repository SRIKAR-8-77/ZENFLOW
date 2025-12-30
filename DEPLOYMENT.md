# ZenFlow Deployment Guide 🚀🧘‍♂️

This guide outlines the steps to deploy the ZenFlow Digital Sanctuary.

## 1. Backend Deployment (FastAPI)

The backend is built with FastAPI and uses a local SQLite database and pre-trained ML models.

### Environment Setup
1. Copy `.env.example` to `.env`.
2. Generate a secure `SECRET_KEY`: `openssl rand -hex 32`.
3. Add your `GEMINI_API_KEY`.

### Installation
```bash
cd yoga_assistant
pip install -r requirements.txt
```

### Production Run
Use `gunicorn` with `uvicorn` workers for stability:
```bash
gunicorn -w 4 -k uvicorn.workers.UvicornWorker backend:app --bind 0.0.0.0:8001
```

---

## 2. Frontend Deployment (Vite)

The frontend is a React application optimized for production builds.

### Environment Setup
Create a `.env` file in `zenflow_frontend/`:
```env
VITE_BACKEND_URL=https://your-backend-api.com
```

### Installation & Build
```bash
cd zenflow_frontend
npm install
npm run build
```

### Hosting
- The `dist/` folder can be served by any static file host (Vercel, Netlify, Nginx).

---

## 3. Post-Deployment Checklist
- [ ] Ensure `GEMINI_API_KEY` is active.
- [ ] Check that `YOGA_NOTEBOOK/` model files are included in the deployment package.
- [ ] Verify CORS settings in `backend.py` (restrict to your frontend domain in production).
- [ ] Confirm `yoga_app.db` has write permissions in the production environment.

**Your Sanctuary is now ready to enlighten the world!** 🏛️✨🏙️

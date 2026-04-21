# ATS Resume Checker — atsresumecheck.vercel.app

Free ATS resume analyzer. Upload PDF or DOCX, get an instant ATS score with actionable improvements. Zero data storage.

---

## Project Structure

```
ats-resume-checker/
├── frontend/          ← React + Vite (deploy to Vercel)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── UploadZone.jsx
│   │   │   ├── ResultsDashboard.jsx
│   │   │   ├── ScoreRing.jsx
│   │   │   ├── CategoryCard.jsx
│   │   │   └── Footer.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── vercel.json
│   └── .env
│
├── backend/           ← FastAPI (deploy to Koyeb)
│   ├── main.py        ← API routes + file handling
│   ├── parser.py      ← PDF/DOCX text extraction
│   ├── scorer.py      ← ATS scoring engine (5 categories)
│   ├── requirements.txt
│   ├── Procfile
│   └── koyeb.yaml
│
└── README.md
```

---

## Tech Stack

| Layer     | Technology       | Why                              |
|-----------|-----------------|----------------------------------|
| Frontend  | React + Vite     | Fastest build, small bundle      |
| Backend   | FastAPI (Python) | Async, 3-10x faster than Flask   |
| PDF parse | PyMuPDF (fitz)   | Fastest Python PDF library       |
| DOCX parse| python-docx      | Official, reliable               |
| Hosting F | Vercel           | Free forever, global CDN         |
| Hosting B | Koyeb            | Free tier, no cold starts        |

---

## Local Development

### 1. Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

API will be at: http://localhost:8000
Swagger docs: http://localhost:8000/docs

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

App will be at: http://localhost:5173

---

## Deployment Guide

### Step 1 — Deploy Backend to Koyeb (Free)

1. Create a free account at https://koyeb.com
2. Click **"Create App"** → **"GitHub"**
3. Connect your GitHub and select this repo
4. Set the **root directory** to `backend`
5. Set **build command**: `pip install -r requirements.txt`
6. Set **run command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
7. Choose the **Free** instance type (nano)
8. Click **Deploy**

Wait for the green "Running" status.
Copy your Koyeb URL — it looks like: `https://your-app-name.koyeb.app`

> ✅ Koyeb free tier does NOT have cold starts (unlike Render).

---

### Step 2 — Deploy Frontend to Vercel (Free)

1. Create a free account at https://vercel.com
2. Click **"Add New Project"** → import your GitHub repo
3. Set **root directory** to `frontend`
4. Framework preset: **Vite**
5. Add environment variable:
   - Key: `VITE_API_URL`
   - Value: `https://your-app-name.koyeb.app` ← your Koyeb URL from Step 1
6. Click **Deploy**

---

### Step 3 — Get Your Custom Domain (atsresumecheck.vercel.app)

1. In Vercel dashboard → your project → **Settings** → **Domains**
2. Your default domain is already `your-project-name.vercel.app`
3. To rename: in project settings → scroll to **Project Name** → rename to `atsresumecheck`
4. Your live URL becomes: **https://atsresumecheck.vercel.app** ✅

---

### Step 4 — Update CORS in Backend

After deploying, open `backend/main.py` and confirm your Vercel URL is in the CORS list:

```python
allow_origins=[
    "https://atsresumecheck.vercel.app",
    "http://localhost:5173",
]
```

Push the change → Koyeb auto-redeploys.

---

## ATS Scoring Parameters

| Category               | Weight | What's Checked                              |
|------------------------|--------|---------------------------------------------|
| Keywords & Skills      | 35%    | 200+ tech keywords + action verbs           |
| ATS Formatting         | 20%    | Bullets, no emojis, ideal page length       |
| Resume Sections        | 20%    | Experience, Education, Skills, Summary, etc.|
| Contact Information    | 15%    | Email, Phone, LinkedIn, GitHub              |
| Quantified Achievements| 10%    | Numbers, percentages, metrics               |

---

## Privacy & Security

- Files are written to a temporary OS path only
- Deleted immediately after text extraction (in a `finally` block — even if errors occur)
- No database, no logging of resume content
- CORS restricted to your Vercel domain only

---

## SEO Features (Built-in)

- Semantic HTML with proper heading hierarchy
- Full Open Graph + Twitter Card meta tags
- Canonical URL set to `https://atsresumecheck.vercel.app/`
- High-value keywords in title: "ATS Resume Check", "Free ATS Score Checker"
- FAQ section (Google rich snippet eligible)
- Fast load time (Vite bundle < 150KB gzipped)

---

## Common Issues

| Problem | Fix |
|---------|-----|
| CORS error in browser | Add your Vercel URL to `allow_origins` in `main.py` |
| "Could not extract text" | Resume is likely a scanned image — needs OCR (not included in free tier) |
| Koyeb app not starting | Check logs in Koyeb dashboard → ensure `PORT` env var is used |
| File too large error | Compress PDF or reduce to under 5MB |
| Vite env var not working | Ensure variable starts with `VITE_` prefix |

# ATS Resume Check — atsresumecheck.vercel.app

Free, instant ATS resume analyzer.
**One Vercel project. Zero paid services. No backend hosting needed.**

---

## Architecture

```
atsresumecheck.vercel.app
│
├── /                  → React + Vite frontend (static)
└── /api/analyze       → Python serverless function (Vercel)
                          ├── Receives PDF / DOCX via multipart form
                          ├── Extracts text (PyMuPDF / python-docx)
                          ├── Scores across 5 ATS parameters
                          ├── Returns JSON result
                          └── Deletes temp file immediately (finally block)
```

No separate backend. No Koyeb. No Render. Everything runs free on Vercel.

---

## Project Structure

```
ats-resume-checker/
├── vercel.json          ← Routes /api/* → Python, /* → React
├── requirements.txt     ← PyMuPDF + python-docx (Vercel installs these)
├── package.json         ← Vite + React
├── vite.config.js       ← Dev proxy: /api → localhost:8000
├── index.html           ← Full SEO meta tags + structured data
│
├── api/
│   └── analyze.py       ← Entire Python backend (serverless function)
│
└── src/
    ├── main.jsx
    ├── App.jsx           ← State management + /api/analyze call
    ├── index.css         ← Design tokens + animations
    └── components/
        ├── Header.jsx
        ├── UploadZone.jsx    ← Drag/drop, file validation, delete button
        ├── Results.jsx       ← Full ATS report dashboard
        ├── ScoreRing.jsx     ← Animated SVG score circle
        ├── CategoryCard.jsx  ← Per-category breakdown card
        └── Footer.jsx        ← FAQ accordion + bottom bar
```

---

## Deploy to Vercel — 3 Steps

### Step 1 — Push to GitHub

1. Create a new GitHub repository (public or private)
2. Upload all files preserving the exact folder structure above
3. Commit & push to `main`

### Step 2 — Deploy on Vercel (free)

1. Go to **https://vercel.com** → sign up with GitHub (free)
2. Click **"Add New Project"** → import your repository
3. **Do not change any build settings** — `vercel.json` handles everything automatically
4. Click **Deploy**

Vercel will automatically:
- Detect the Vite React frontend from `package.json`
- Detect `api/analyze.py` as a Python serverless function
- Install `PyMuPDF` and `python-docx` from `requirements.txt`
- Route `/api/*` requests to the Python function

### Step 3 — Get your domain: atsresumecheck.vercel.app

1. In Vercel dashboard → your project → **Settings → General**
2. Scroll to **Project Name** → rename it to `atsresumecheck`
3. Your live URL: **https://atsresumecheck.vercel.app** ✅

---

## Local Development

```bash
# Install frontend deps
npm install

# Run frontend dev server (http://localhost:5173)
npm run dev
```

The `vite.config.js` proxy forwards `/api/*` calls to `http://localhost:8000` during dev.

To test the Python function locally, you can install deps and run it directly:
```bash
pip install PyMuPDF python-docx
# Then use Vercel CLI:
npm i -g vercel
vercel dev
```

---

## ATS Scoring Parameters

| Parameter               | Weight | What's Checked                                     |
|-------------------------|--------|----------------------------------------------------|
| Keywords & Skills       | 35%    | 200+ tech keywords + 40 action verbs               |
| ATS Formatting          | 20%    | Bullet points, no emojis, ideal 1–2 page length    |
| Resume Sections         | 20%    | Experience, Education, Skills, Summary headers     |
| Contact Information     | 15%    | Email, phone, LinkedIn, GitHub                     |
| Quantified Achievements | 10%    | Numbers, percentages, measurable results           |

Final score = weighted average of all 5 categories (0–100%).

---

## Privacy & Security

- File is written to a **temporary OS path** (in-memory where OS supports it)
- Deleted **immediately** in a `finally` block — even if an error occurs mid-processing
- **No database** — results are computed and returned, never persisted
- **No logging** of resume content
- Vercel serverless functions are **stateless** by design — no data survives between requests

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Build fails on Vercel | Ensure `vercel.json` is at the **root** of the repo, not inside a subfolder |
| API returns 404 | Confirm `api/analyze.py` is at root level (not inside `src/`) |
| "Could not extract text" | The PDF is likely a scanned image — OCR is not supported in this version |
| PyMuPDF install error | Vercel uses Python 3.9 — PyMuPDF 1.24.3 is compatible |
| CORS error in browser | Should not happen on Vercel (same-origin). If testing locally, start `vercel dev` |

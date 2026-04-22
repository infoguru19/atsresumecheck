"""
api/analyze.py
==============
Vercel Python Serverless Function — POST /api/analyze

How Vercel detects this:
  Any .py file inside /api/ is auto-deployed as a serverless endpoint.
  The class must be named `handler` and extend BaseHTTPRequestHandler.

Flow:
  1. Receive multipart/form-data with a PDF or DOCX file
  2. Write to a temp file (OS-managed, in-memory where possible)
  3. Extract text using PyMuPDF (PDF) or python-docx (DOCX)
  4. Score against 5 ATS parameters
  5. Return JSON result
  6. Delete temp file in `finally` block — guaranteed, even on errors
"""

import os
import re
import json
import tempfile
import io
import cgi
from http.server import BaseHTTPRequestHandler


# ══════════════════════════════════════════════════════════════════════════════
#  ATS SCORING ENGINE
# ══════════════════════════════════════════════════════════════════════════════

# ── Keyword Banks ─────────────────────────────────────────────────────────────

TECH_KEYWORDS = {
    # Languages
    "python", "java", "javascript", "typescript", "c++", "c#", "ruby", "php",
    "go", "rust", "kotlin", "swift", "scala", "r", "matlab", "perl",
    # Frontend
    "react", "angular", "vue", "next.js", "nuxt", "svelte", "html", "css",
    "sass", "less", "tailwind", "bootstrap", "webpack", "vite",
    # Backend
    "node.js", "nodejs", "express", "fastapi", "django", "flask", "spring",
    "laravel", "rails", "asp.net", ".net", "graphql", "rest", "grpc",
    # Databases
    "sql", "mysql", "postgresql", "mongodb", "redis", "elasticsearch",
    "cassandra", "dynamodb", "sqlite", "oracle", "firestore", "supabase",
    # Cloud & DevOps
    "aws", "azure", "gcp", "docker", "kubernetes", "terraform", "ansible",
    "jenkins", "github actions", "gitlab ci", "ci/cd", "linux", "bash",
    "shell", "nginx", "apache", "serverless",
    # Data & ML
    "machine learning", "deep learning", "nlp", "tensorflow", "pytorch",
    "pandas", "numpy", "scikit-learn", "data analysis", "data science",
    "spark", "hadoop", "airflow", "dbt", "tableau", "power bi", "looker",
    # Tools
    "git", "github", "gitlab", "jira", "confluence", "figma", "photoshop",
    "excel", "word", "powerpoint",
    # Methodologies
    "agile", "scrum", "kanban", "microservices", "api", "tdd", "bdd",
    # Soft skills (ATS-scanned)
    "project management", "leadership", "communication", "collaboration",
    "problem solving", "analytical", "teamwork",
}

ACTION_VERBS = {
    "managed", "led", "developed", "designed", "implemented", "built",
    "created", "improved", "increased", "reduced", "optimized", "delivered",
    "collaborated", "coordinated", "analyzed", "presented", "trained",
    "mentored", "launched", "spearheaded", "architected", "deployed",
    "maintained", "automated", "streamlined", "researched", "negotiated",
    "established", "oversaw", "directed", "generated", "achieved",
    "transformed", "engineered", "scaled", "migrated", "integrated",
}

# ── Regex Patterns ─────────────────────────────────────────────────────────────

SECTION_PATTERNS = {
    "experience":     re.compile(r"\b(work experience|professional experience|employment|experience|work history)\b", re.I),
    "education":      re.compile(r"\b(education|academic|qualification|degree|university|college|school)\b", re.I),
    "skills":         re.compile(r"\b(skills|technical skills|core competencies|competencies|expertise|proficiencies)\b", re.I),
    "summary":        re.compile(r"\b(summary|objective|profile|about me|professional summary|career objective)\b", re.I),
    "projects":       re.compile(r"\b(projects|personal projects|key projects|portfolio|open.?source)\b", re.I),
    "certifications": re.compile(r"\b(certifications|certificates|licenses|accreditations)\b", re.I),
    "achievements":   re.compile(r"\b(achievements|awards|honors|accomplishments|recognition)\b", re.I),
}

EMAIL_RE    = re.compile(r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}")
PHONE_RE    = re.compile(r"(\+?\d[\d\s\-().]{7,}\d)")
LINKEDIN_RE = re.compile(r"linkedin\.com/in/[\w\-]+", re.I)
GITHUB_RE   = re.compile(r"github\.com/[\w\-]+", re.I)
BULLET_RE   = re.compile(r"^[\s]*[•\-\*\u2022\u2023\u25E6\u2043\u2219]", re.M)
QUANT_RE    = re.compile(
    r"\b\d+[\%\+xX]?\s*(percent|%|\+|times|users|customers|team|members|projects|years|months|revenue|\$|million|billion|thousand|k\b)",
    re.I
)
EMOJI_RE    = re.compile(
    "[\U0001F600-\U0001F64F\U0001F300-\U0001F5FF\U0001F680-\U0001F6FF\U00002702-\U000027B0]+",
    re.UNICODE
)


# ── Scoring Functions ──────────────────────────────────────────────────────────

def _score_contact(text):
    has_email    = bool(EMAIL_RE.search(text))
    has_phone    = bool(PHONE_RE.search(text))
    has_linkedin = bool(LINKEDIN_RE.search(text))
    has_github   = bool(GITHUB_RE.search(text))

    score = (40 if has_email else 0) + (40 if has_phone else 0) \
          + (10 if has_linkedin else 0) + (10 if has_github else 0)

    issues, suggestions = [], []
    if not has_email:
        issues.append("No email address detected")
        suggestions.append("Add a professional email address (e.g. name@gmail.com)")
    if not has_phone:
        issues.append("No phone number detected")
        suggestions.append("Add a phone number including country code")
    if not has_linkedin:
        suggestions.append("Add your LinkedIn profile URL — recruiters expect it")
    if not has_github:
        suggestions.append("Add a GitHub profile URL if you're in a technical role")

    return {
        "label": "Contact Information", "score": score, "weight": 15,
        "details": {
            "has_email": has_email, "has_phone": has_phone,
            "has_linkedin": has_linkedin, "has_github": has_github,
        },
        "issues": issues, "suggestions": suggestions,
    }


def _score_sections(text):
    found = {s: bool(p.search(text)) for s, p in SECTION_PATTERNS.items()}
    weights = {"experience": 30, "education": 20, "skills": 25, "summary": 15,
               "projects": 5, "certifications": 3, "achievements": 2}
    score = min(sum(w for s, w in weights.items() if found.get(s)), 100)

    issues, suggestions = [], []
    for s in ("experience", "education", "skills"):
        if not found[s]:
            issues.append(f"Missing '{s.title()}' section — ATS may skip your resume")
            suggestions.append(f"Add a clearly labeled '{s.title()}' section heading")
    if not found["summary"]:
        suggestions.append("Add a 2-3 line professional summary at the top of your resume")
    if not found["projects"]:
        suggestions.append("A 'Projects' section can strengthen your application significantly")

    return {
        "label": "Resume Sections", "score": score, "weight": 20,
        "found": found, "issues": issues, "suggestions": suggestions,
    }


def _score_keywords(text):
    tl = text.lower()
    found_tech   = [kw for kw in TECH_KEYWORDS if kw in tl]
    found_action = [kw for kw in ACTION_VERBS  if kw in tl]

    tech_score   = min(len(found_tech) * 4, 70)
    action_score = min(len(found_action) * 3, 30)
    score = min(tech_score + action_score, 100)

    issues, suggestions = [], []
    if len(found_tech) < 5:
        issues.append(f"Only {len(found_tech)} technical keyword(s) found — ATS needs more")
        suggestions.append("Add a dedicated Skills section listing tools, languages, and frameworks by name")
    if len(found_action) < 5:
        issues.append("Too few action verbs — bullet points should start with strong verbs")
        suggestions.append("Begin each bullet with action verbs: Developed, Led, Optimized, Reduced, Automated…")
    if len(found_tech) < 10:
        missing = list(TECH_KEYWORDS - set(found_tech))[:6]
        suggestions.append(f"Consider adding relevant skills like: {', '.join(missing)}")

    return {
        "label": "Keywords & Skills", "score": score, "weight": 35,
        "tech_keywords_found": found_tech,
        "found_action_verbs":  list(found_action),
        "tech_count":   len(found_tech),
        "action_count": len(found_action),
        "issues": issues, "suggestions": suggestions,
    }


def _score_formatting(text):
    lines       = [l for l in text.split("\n") if l.strip()]
    bullets     = BULLET_RE.findall(text)
    has_bullets = len(bullets) >= 3
    has_emojis  = bool(EMOJI_RE.search(text))
    est_pages   = max(1, len(lines) // 50)
    good_length = 1 <= est_pages <= 2

    score = (40 if has_bullets else 0) + (30 if not has_emojis else 0) + (30 if good_length else 0)

    issues, suggestions = [], []
    if not has_bullets:
        issues.append("No bullet points detected — ATS scanners prefer structured lists")
        suggestions.append("Replace paragraph blocks with bullet-point achievement statements")
    if has_emojis:
        issues.append("Emoji characters detected — they corrupt ATS parsing")
        suggestions.append("Remove all emojis from your resume completely")
    if est_pages > 2:
        issues.append(f"Resume appears to be ~{est_pages} pages — ideal is 1–2 pages")
        suggestions.append("Trim to 1–2 pages by removing older or less relevant experience")
    elif est_pages < 1:
        issues.append("Resume seems very short — expand with more detail")

    return {
        "label": "ATS Formatting", "score": score, "weight": 20,
        "has_bullets": has_bullets, "has_emojis": has_emojis,
        "estimated_pages": est_pages, "bullet_count": len(bullets),
        "issues": issues, "suggestions": suggestions,
    }


def _score_quantification(text):
    matches = QUANT_RE.findall(text)
    count   = len(matches)
    score   = min(count * 20, 100)

    issues, suggestions = [], []
    if count == 0:
        issues.append("No quantified achievements found — numbers are critical for ATS and recruiters")
        suggestions.append("Add metrics to every role: 'Increased sales by 35%', 'Managed team of 12', 'Reduced load time by 40%'")
    elif count < 3:
        suggestions.append(f"You have {count} metric(s) — aim for 3–5 quantified achievements per role")

    return {
        "label": "Quantified Achievements", "score": score, "weight": 10,
        "count": count, "issues": issues, "suggestions": suggestions,
    }


def score_resume(text):
    """
    Master scoring function.
    Returns full result dict with final_score (0-100), grade, and category breakdown.

    Weights:
        Keywords & Skills       35%
        ATS Formatting          20%
        Resume Sections         20%
        Contact Information     15%
        Quantified Achievements 10%
    """
    contact  = _score_contact(text)
    sections = _score_sections(text)
    keywords = _score_keywords(text)
    fmt      = _score_formatting(text)
    quant    = _score_quantification(text)

    final = round(
        contact["score"]  * 0.15 +
        sections["score"] * 0.20 +
        keywords["score"] * 0.35 +
        fmt["score"]      * 0.20 +
        quant["score"]    * 0.10
    )

    if   final >= 85: grade, color = "Excellent", "#a3e635"
    elif final >= 70: grade, color = "Good",      "#f5a623"
    elif final >= 50: grade, color = "Fair",      "#fb923c"
    else:             grade, color = "Poor",      "#fb7185"

    all_issues = (
        contact["issues"] + sections["issues"] +
        keywords["issues"] + fmt["issues"] + quant["issues"]
    )
    all_suggestions = (
        sections["suggestions"] + keywords["suggestions"] +
        fmt["suggestions"] + contact["suggestions"] + quant["suggestions"]
    )[:10]

    return {
        "final_score": final,
        "grade":       grade,
        "grade_color": color,
        "categories": {
            "contact_info":     contact,
            "sections":         sections,
            "keywords":         keywords,
            "formatting":       fmt,
            "quantification":   quant,
        },
        "all_issues":      all_issues,
        "all_suggestions": all_suggestions,
    }


# ══════════════════════════════════════════════════════════════════════════════
#  TEXT EXTRACTION
# ══════════════════════════════════════════════════════════════════════════════

def extract_text(path, ext):
    """Extract plain text from PDF or DOCX. O(n) where n = pages/paragraphs."""
    if ext == ".pdf":
        import fitz  # PyMuPDF
        parts = []
        with fitz.open(path) as doc:
            for page in doc:
                parts.append(page.get_text("text"))
        return "\n".join(parts)
    else:
        from docx import Document
        doc   = Document(path)
        parts = [p.text.strip() for p in doc.paragraphs if p.text.strip()]
        for table in doc.tables:
            for row in table.rows:
                for cell in row.cells:
                    if cell.text.strip():
                        parts.append(cell.text.strip())
        return "\n".join(parts)


# ══════════════════════════════════════════════════════════════════════════════
#  VERCEL HANDLER
# ══════════════════════════════════════════════════════════════════════════════

class handler(BaseHTTPRequestHandler):
    """Vercel Python serverless handler. Must be named `handler`."""

    def log_message(self, *args):
        pass  # suppress access log noise

    # ── CORS preflight ──────────────────────────────────────────────────────

    def do_OPTIONS(self):
        self.send_response(200)
        self._cors_headers()
        self.end_headers()

    # ── Main endpoint ────────────────────────────────────────────────────────

    def do_POST(self):
        content_type = self.headers.get("Content-Type", "")

        if "multipart/form-data" not in content_type:
            return self._respond(400, {"error": "Expected multipart/form-data request."})

        length = int(self.headers.get("Content-Length", 0))
        if length > 5 * 1024 * 1024:
            return self._respond(400, {"error": "File size exceeds 5 MB limit."})

        body = self.rfile.read(length)

        # Parse multipart manually (no aiohttp needed)
        fs = cgi.FieldStorage(
            fp=io.BytesIO(body),
            environ={
                "REQUEST_METHOD":  "POST",
                "CONTENT_TYPE":    content_type,
                "CONTENT_LENGTH":  str(length),
            },
            keep_blank_values=True,
        )

        if "file" not in fs:
            return self._respond(400, {"error": "No 'file' field found in request."})

        item      = fs["file"]
        filename  = item.filename or ""
        raw_bytes = item.file.read()

        # Determine extension
        fn_lower = filename.lower()
        if fn_lower.endswith(".pdf"):
            ext = ".pdf"
        elif fn_lower.endswith(".docx"):
            ext = ".docx"
        elif fn_lower.endswith(".doc"):
            ext = ".doc"
        else:
            return self._respond(400, {"error": "Only PDF and DOCX files are supported."})

        tmp_path = None
        try:
            # Write to temp — deleted in finally block below
            with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
                tmp.write(raw_bytes)
                tmp_path = tmp.name

            text = extract_text(tmp_path, ext)

            if not text or len(text.strip()) < 50:
                return self._respond(422, {
                    "error": "Could not extract readable text from this file. "
                             "If it is a scanned PDF (image-only), plain text extraction is not possible."
                })

            result = score_resume(text)
            return self._respond(200, result)

        except Exception as exc:
            return self._respond(500, {"error": f"Processing error: {str(exc)}"})

        finally:
            # GUARANTEED delete — file never persists on disk
            if tmp_path and os.path.exists(tmp_path):
                os.remove(tmp_path)

    # ── Helpers ───────────────────────────────────────────────────────────────

    def _cors_headers(self):
        # Allow all origins (same-domain on Vercel; needed for local dev)
        self.send_header("Access-Control-Allow-Origin",  "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def _respond(self, status, data):
        body = json.dumps(data).encode("utf-8")
        self.send_response(status)
        self._cors_headers()
        self.send_header("Content-Type",   "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

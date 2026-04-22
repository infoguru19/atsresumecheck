"""
api/analyze.py  —  Vercel Python Serverless Function
POST /api/analyze

Vercel auto-discovers this file and exposes it at /api/analyze.
The handler receives a multipart/form-data request with a 'file' field.
"""

from http.server import BaseHTTPRequestHandler
import json, os, re, tempfile, io, cgi
from pypdf import PdfReader


# ══════════════════════════════════════════════════════════════
#  KEYWORD BANKS
# ══════════════════════════════════════════════════════════════

TECH_KEYWORDS = {
    "python","java","javascript","typescript","c++","c#","ruby","php",
    "go","rust","kotlin","swift","scala","r","perl",
    "react","angular","vue","next.js","svelte","html","css","sass",
    "tailwind","bootstrap","webpack","vite",
    "node.js","nodejs","express","fastapi","django","flask","spring",
    "laravel","graphql","rest","grpc",".net",
    "sql","mysql","postgresql","mongodb","redis","elasticsearch",
    "cassandra","dynamodb","sqlite","oracle","firestore",
    "aws","azure","gcp","docker","kubernetes","terraform","ansible",
    "jenkins","ci/cd","linux","bash","shell","nginx","serverless",
    "machine learning","deep learning","nlp","tensorflow","pytorch",
    "pandas","numpy","scikit-learn","data analysis","data science",
    "spark","hadoop","airflow","tableau","power bi","looker",
    "git","github","gitlab","jira","figma","excel",
    "agile","scrum","microservices","api","tdd",
    "project management","leadership","communication",
    "collaboration","problem solving","analytical","teamwork",
}

ACTION_VERBS = {
    "managed","led","developed","designed","implemented","built",
    "created","improved","increased","reduced","optimized","delivered",
    "collaborated","coordinated","analyzed","presented","trained",
    "mentored","launched","spearheaded","architected","deployed",
    "maintained","automated","streamlined","researched","negotiated",
    "established","oversaw","directed","generated","achieved",
    "transformed","engineered","scaled","migrated","integrated",
}

SECTION_RE = {
    "experience":     re.compile(r"\b(work experience|professional experience|employment|experience|work history)\b", re.I),
    "education":      re.compile(r"\b(education|academic|qualification|degree|university|college)\b", re.I),
    "skills":         re.compile(r"\b(skills|technical skills|core competencies|competencies|expertise)\b", re.I),
    "summary":        re.compile(r"\b(summary|objective|profile|about me|professional summary)\b", re.I),
    "projects":       re.compile(r"\b(projects|personal projects|key projects|portfolio)\b", re.I),
    "certifications": re.compile(r"\b(certifications|certificates|licenses)\b", re.I),
    "achievements":   re.compile(r"\b(achievements|awards|honors|accomplishments)\b", re.I),
}

EMAIL_RE   = re.compile(r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}")
PHONE_RE   = re.compile(r"(\+?\d[\d\s\-().]{7,}\d)")
LINKEDIN_RE= re.compile(r"linkedin\.com/in/[\w\-]+", re.I)
GITHUB_RE  = re.compile(r"github\.com/[\w\-]+", re.I)
BULLET_RE  = re.compile(r"^[\s]*[•\-\*\u2022\u2023\u25E6\u2043\u2219]", re.M)
QUANT_RE   = re.compile(r"\b\d+[\%\+]?\s*(percent|%|\+|times|users|customers|team|members|projects|years|months|revenue|\$|million|thousand|k\b)", re.I)
EMOJI_RE   = re.compile("[\U0001F600-\U0001F64F\U0001F300-\U0001F5FF\U0001F680-\U0001F6FF]+", re.UNICODE)


# ══════════════════════════════════════════════════════════════
#  SCORING
# ══════════════════════════════════════════════════════════════

def score_contact(text):
    has_email    = bool(EMAIL_RE.search(text))
    has_phone    = bool(PHONE_RE.search(text))
    has_linkedin = bool(LINKEDIN_RE.search(text))
    has_github   = bool(GITHUB_RE.search(text))
    score = (40 if has_email else 0)+(40 if has_phone else 0)+(10 if has_linkedin else 0)+(10 if has_github else 0)
    issues, suggestions = [], []
    if not has_email:    issues.append("No email address detected"); suggestions.append("Add a professional email address")
    if not has_phone:    issues.append("No phone number detected"); suggestions.append("Add a phone number with country code")
    if not has_linkedin: suggestions.append("Add your LinkedIn profile URL — recruiters expect it")
    if not has_github:   suggestions.append("Add a GitHub link if you are in a technical role")
    return {"label":"Contact Information","score":score,"weight":15,
            "details":{"has_email":has_email,"has_phone":has_phone,"has_linkedin":has_linkedin,"has_github":has_github},
            "issues":issues,"suggestions":suggestions}

def score_sections(text):
    found = {s: bool(p.search(text)) for s,p in SECTION_RE.items()}
    w = {"experience":30,"education":20,"skills":25,"summary":15,"projects":5,"certifications":3,"achievements":2}
    score = min(sum(v for s,v in w.items() if found.get(s)), 100)
    issues, suggestions = [], []
    for s in ("experience","education","skills"):
        if not found[s]:
            issues.append(f"Missing '{s.title()}' section — ATS may skip your resume")
            suggestions.append(f"Add a clearly labeled '{s.title()}' heading")
    if not found["summary"]: suggestions.append("Add a 2-3 line professional summary at the top")
    if not found["projects"]: suggestions.append("A Projects section strengthens your profile significantly")
    return {"label":"Resume Sections","score":score,"weight":20,"found":found,"issues":issues,"suggestions":suggestions}

def score_keywords(text):
    tl = text.lower()
    found_tech   = [kw for kw in TECH_KEYWORDS if kw in tl]
    found_action = [kw for kw in ACTION_VERBS  if kw in tl]
    score = min(len(found_tech)*4 + len(found_action)*3, 100)
    issues, suggestions = [], []
    if len(found_tech) < 5:
        issues.append(f"Only {len(found_tech)} technical keyword(s) found — ATS needs more")
        suggestions.append("Add a Skills section listing every tool, language, and framework you know")
    if len(found_action) < 5:
        issues.append("Too few action verbs in bullet points")
        suggestions.append("Start each bullet with: Developed, Led, Optimized, Reduced, Automated...")
    if len(found_tech) < 10:
        missing = list(TECH_KEYWORDS - set(found_tech))[:5]
        suggestions.append(f"Consider adding relevant skills like: {', '.join(missing)}")
    return {"label":"Keywords & Skills","score":score,"weight":35,
            "tech_keywords_found":found_tech,"found_action_verbs":list(found_action),
            "tech_count":len(found_tech),"action_count":len(found_action),
            "issues":issues,"suggestions":suggestions}

def score_formatting(text):
    lines      = [l for l in text.split("\n") if l.strip()]
    bullets    = BULLET_RE.findall(text)
    has_bullets= len(bullets) >= 3
    has_emojis = bool(EMOJI_RE.search(text))
    est_pages  = max(1, len(lines)//50)
    good_len   = 1 <= est_pages <= 2
    score = (40 if has_bullets else 0)+(30 if not has_emojis else 0)+(30 if good_len else 0)
    issues, suggestions = [], []
    if not has_bullets: issues.append("No bullet points detected — ATS prefers structured lists"); suggestions.append("Replace paragraph blocks with bullet-point achievements")
    if has_emojis:      issues.append("Emojis detected — they corrupt ATS parsing"); suggestions.append("Remove all emojis from your resume")
    if est_pages > 2:   issues.append(f"Resume is ~{est_pages} pages — ideal is 1-2 pages"); suggestions.append("Trim to 1-2 pages by removing older or less relevant experience")
    return {"label":"ATS Formatting","score":score,"weight":20,
            "has_bullets":has_bullets,"has_emojis":has_emojis,"estimated_pages":est_pages,
            "issues":issues,"suggestions":suggestions}

def score_quant(text):
    count = len(QUANT_RE.findall(text))
    score = min(count*20, 100)
    issues, suggestions = [], []
    if count == 0: issues.append("No quantified achievements — numbers are critical"); suggestions.append("Add metrics: 'Increased sales by 35%', 'Managed team of 12', 'Reduced load time by 40%'")
    elif count < 3: suggestions.append(f"You have {count} metric(s) — aim for 3-5 per role")
    return {"label":"Quantified Achievements","score":score,"weight":10,"count":count,"issues":issues,"suggestions":suggestions}

def run_scoring(text):
    c = score_contact(text)
    s = score_sections(text)
    k = score_keywords(text)
    f = score_formatting(text)
    q = score_quant(text)
    final = round(c["score"]*0.15 + s["score"]*0.20 + k["score"]*0.35 + f["score"]*0.20 + q["score"]*0.10)
    if   final >= 85: grade, color = "Excellent", "#a3e635"
    elif final >= 70: grade, color = "Good",      "#f5a623"
    elif final >= 50: grade, color = "Fair",      "#fb923c"
    else:             grade, color = "Poor",      "#fb7185"
    all_issues = c["issues"]+s["issues"]+k["issues"]+f["issues"]+q["issues"]
    all_sugg   = (s["suggestions"]+k["suggestions"]+f["suggestions"]+c["suggestions"]+q["suggestions"])[:10]
    return {
        "final_score": final, "grade": grade, "grade_color": color,
        "categories": {
            "contact_info":   c, "sections": s, "keywords": k,
            "formatting":     f, "quantification": q,
        },
        "all_issues": all_issues, "all_suggestions": all_sugg,
    }


# ══════════════════════════════════════════════════════════════
#  TEXT EXTRACTION
# ══════════════════════════════════════════════════════════════

def extract_text(path, ext):
    if ext == ".pdf":
        import fitz
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


# ══════════════════════════════════════════════════════════════
#  VERCEL HANDLER
# ══════════════════════════════════════════════════════════════

class handler(BaseHTTPRequestHandler):

    def log_message(self, *a): pass  # silence access logs

    def do_OPTIONS(self):
        self.send_response(200)
        self._cors()
        self.end_headers()

    def do_POST(self):
        ct     = self.headers.get("Content-Type", "")
        length = int(self.headers.get("Content-Length", 0) or 0)

        if "multipart/form-data" not in ct:
            return self._json(400, {"error": "Expected multipart/form-data."})

        if length > 5 * 1024 * 1024:
            return self._json(400, {"error": "File exceeds 5 MB limit."})

        body = self.rfile.read(length)

        try:
            fs = cgi.FieldStorage(
                fp=io.BytesIO(body),
                environ={"REQUEST_METHOD":"POST","CONTENT_TYPE":ct,"CONTENT_LENGTH":str(length)},
                keep_blank_values=True,
            )
        except Exception as e:
            return self._json(400, {"error": f"Could not parse request: {e}"})

        if "file" not in fs:
            return self._json(400, {"error": "No 'file' field in request."})

        item      = fs["file"]
        filename  = (item.filename or "").lower()
        raw_bytes = item.file.read()

        if filename.endswith(".pdf"):     ext = ".pdf"
        elif filename.endswith(".docx"):  ext = ".docx"
        elif filename.endswith(".doc"):   ext = ".doc"
        else:
            return self._json(400, {"error": "Only PDF and DOCX files are supported."})

        tmp_path = None
        try:
            with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
                tmp.write(raw_bytes)
                tmp_path = tmp.name

            text = extract_text(tmp_path, ext)

            if not text or len(text.strip()) < 50:
                return self._json(422, {"error": "Could not extract readable text. Make sure the file is not a scanned image-only PDF."})

            return self._json(200, run_scoring(text))

        except Exception as e:
            return self._json(500, {"error": f"Processing error: {str(e)}"})
        finally:
            if tmp_path and os.path.exists(tmp_path):
                os.remove(tmp_path)

    def _cors(self):
        self.send_header("Access-Control-Allow-Origin",  "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def _json(self, status, data):
        body = json.dumps(data).encode("utf-8")
        self.send_response(status)
        self._cors()
        self.send_header("Content-Type",   "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

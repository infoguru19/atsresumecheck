import re
from typing import Dict, Any, List

# ── ATS keyword bank (top 200 in-demand skills) ─────────────────────────────
TECH_KEYWORDS = {
    "python", "java", "javascript", "typescript", "react", "angular", "vue",
    "node.js", "nodejs", "express", "fastapi", "django", "flask", "spring",
    "sql", "mysql", "postgresql", "mongodb", "redis", "elasticsearch",
    "aws", "azure", "gcp", "docker", "kubernetes", "terraform", "ansible",
    "git", "github", "gitlab", "ci/cd", "jenkins", "github actions",
    "machine learning", "deep learning", "nlp", "tensorflow", "pytorch",
    "pandas", "numpy", "scikit-learn", "data analysis", "data science",
    "rest", "graphql", "microservices", "api", "agile", "scrum", "jira",
    "linux", "bash", "shell", "html", "css", "sass", "tailwind",
    "excel", "tableau", "power bi", "looker", "spark", "hadoop",
    "c++", "c#", ".net", "ruby", "php", "go", "rust", "kotlin", "swift",
    "selenium", "junit", "pytest", "jest", "cypress", "figma", "photoshop",
    "project management", "communication", "leadership", "problem solving",
    "teamwork", "collaboration", "analytical", "critical thinking",
}

GENERAL_KEYWORDS = {
    "managed", "led", "developed", "designed", "implemented", "built",
    "created", "improved", "increased", "reduced", "optimized", "delivered",
    "collaborated", "coordinated", "analyzed", "presented", "trained",
    "mentored", "launched", "spearheaded", "architected", "deployed",
    "maintained", "automated", "streamlined", "researched", "negotiated",
}

# ── Section header patterns ──────────────────────────────────────────────────
SECTION_PATTERNS = {
    "experience": re.compile(
        r"\b(work experience|professional experience|employment|experience|work history)\b",
        re.IGNORECASE,
    ),
    "education": re.compile(
        r"\b(education|academic|qualification|degree|university|college)\b",
        re.IGNORECASE,
    ),
    "skills": re.compile(
        r"\b(skills|technical skills|core competencies|competencies|expertise|proficiencies)\b",
        re.IGNORECASE,
    ),
    "summary": re.compile(
        r"\b(summary|objective|profile|about me|professional summary|career objective)\b",
        re.IGNORECASE,
    ),
    "projects": re.compile(
        r"\b(projects|personal projects|key projects|portfolio)\b",
        re.IGNORECASE,
    ),
    "certifications": re.compile(
        r"\b(certifications|certificates|licenses|accreditations)\b",
        re.IGNORECASE,
    ),
    "achievements": re.compile(
        r"\b(achievements|awards|honors|accomplishments|recognition)\b",
        re.IGNORECASE,
    ),
}

# Contact info patterns
EMAIL_RE = re.compile(r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}")
PHONE_RE = re.compile(r"(\+?\d[\d\s\-().]{7,}\d)")
LINKEDIN_RE = re.compile(r"linkedin\.com/in/[\w\-]+", re.IGNORECASE)
GITHUB_RE = re.compile(r"github\.com/[\w\-]+", re.IGNORECASE)

# Bullet pattern
BULLET_RE = re.compile(r"^[\s]*[•\-\*\u2022\u2023\u25E6\u2043\u2219]", re.MULTILINE)

# Quantification: numbers with context
QUANT_RE = re.compile(r"\b\d+[\%\+xX]?\s*(percent|%|\+|times|users|customers|team|members|projects|years|months|revenue|\$|million|thousand|k\b)", re.IGNORECASE)

# Bad chars / emojis
EMOJI_RE = re.compile(
    "["
    "\U0001F600-\U0001F64F"
    "\U0001F300-\U0001F5FF"
    "\U0001F680-\U0001F6FF"
    "\U0001F1E0-\U0001F1FF"
    "\U00002702-\U000027B0"
    "]+",
    re.UNICODE,
)

SPECIAL_CHARS_RE = re.compile(r"[^\x00-\x7F]")  # non-ASCII (beyond emojis)


# ── Scoring functions ─────────────────────────────────────────────────────────

def _check_contact_info(text: str) -> Dict[str, Any]:
    has_email = bool(EMAIL_RE.search(text))
    has_phone = bool(PHONE_RE.search(text))
    has_linkedin = bool(LINKEDIN_RE.search(text))
    has_github = bool(GITHUB_RE.search(text))

    score = 0
    issues = []
    suggestions = []

    if has_email:
        score += 40
    else:
        issues.append("No email address detected")
        suggestions.append("Add a professional email address (e.g., name@gmail.com)")

    if has_phone:
        score += 40
    else:
        issues.append("No phone number detected")
        suggestions.append("Include a phone number with country code")

    if has_linkedin:
        score += 10
    else:
        suggestions.append("Add your LinkedIn profile URL to increase recruiter trust")

    if has_github:
        score += 10
    else:
        suggestions.append("Add a GitHub profile link if you're in tech")

    return {
        "score": score,
        "details": {
            "has_email": has_email,
            "has_phone": has_phone,
            "has_linkedin": has_linkedin,
            "has_github": has_github,
        },
        "issues": issues,
        "suggestions": suggestions,
    }


def _check_sections(text: str) -> Dict[str, Any]:
    found = {}
    for section, pattern in SECTION_PATTERNS.items():
        found[section] = bool(pattern.search(text))

    score = 0
    issues = []
    suggestions = []

    weights = {
        "experience": 30,
        "education": 20,
        "skills": 25,
        "summary": 15,
        "projects": 5,
        "certifications": 3,
        "achievements": 2,
    }

    for section, w in weights.items():
        if found.get(section):
            score += w
        else:
            if section in ("experience", "education", "skills"):
                issues.append(f"Missing '{section.title()}' section — ATS may skip your resume")
                suggestions.append(f"Add a clearly labeled '{section.title()}' section heading")
            else:
                suggestions.append(f"Consider adding a '{section.title()}' section to strengthen your profile")

    return {
        "score": min(score, 100),
        "found_sections": found,
        "issues": issues,
        "suggestions": suggestions,
    }


def _check_keywords(text: str) -> Dict[str, Any]:
    text_lower = text.lower()
    found_tech = [kw for kw in TECH_KEYWORDS if kw in text_lower]
    found_action = [kw for kw in GENERAL_KEYWORDS if kw in text_lower]

    tech_score = min(len(found_tech) * 4, 70)  # cap at 70
    action_score = min(len(found_action) * 3, 30)  # cap at 30
    score = tech_score + action_score

    issues = []
    suggestions = []

    if len(found_tech) < 5:
        issues.append(f"Only {len(found_tech)} technical keywords found — ATS scanners need more")
        suggestions.append("Add a dedicated 'Skills' section listing tools, languages, and frameworks")

    if len(found_action) < 5:
        issues.append("Few action verbs detected — bullet points should start with strong verbs")
        suggestions.append("Start each bullet with action verbs: Developed, Led, Optimized, Reduced, Increased...")

    missing_common = list(TECH_KEYWORDS - set(found_tech))[:5]
    if missing_common:
        suggestions.append(f"Consider adding relevant keywords like: {', '.join(missing_common[:5])}")

    return {
        "score": min(score, 100),
        "found_tech_keywords": found_tech,
        "found_action_verbs": list(found_action),
        "tech_keyword_count": len(found_tech),
        "action_verb_count": len(found_action),
        "issues": issues,
        "suggestions": suggestions,
    }


def _check_formatting(text: str) -> Dict[str, Any]:
    lines = text.split("\n")
    total_lines = len([l for l in lines if l.strip()])

    bullet_matches = BULLET_RE.findall(text)
    has_bullets = len(bullet_matches) >= 3

    emoji_count = len(EMOJI_RE.findall(text))
    has_emojis = emoji_count > 0

    # Estimate page count (rough: ~50 lines per page)
    est_pages = max(1, total_lines // 50)
    ideal_length = 1 <= est_pages <= 2

    score = 0
    issues = []
    suggestions = []

    if has_bullets:
        score += 40
    else:
        issues.append("No bullet points detected — ATS parsers prefer structured bullet lists")
        suggestions.append("Replace paragraph descriptions with bullet point achievements")

    if not has_emojis:
        score += 30
    else:
        issues.append(f"{emoji_count} emoji(s) found — emojis break ATS parsing")
        suggestions.append("Remove all emojis from your resume — they cause ATS to misread content")

    if ideal_length:
        score += 30
    elif est_pages > 2:
        issues.append(f"Resume appears too long (~{est_pages} pages) — ATS prefers 1-2 pages")
        suggestions.append("Trim your resume to 1–2 pages. Remove older/irrelevant experiences.")
    else:
        issues.append("Resume seems too short — add more relevant experience and skills")
        suggestions.append("Expand with projects, certifications, or a skills section")

    return {
        "score": score,
        "has_bullets": has_bullets,
        "has_emojis": has_emojis,
        "estimated_pages": est_pages,
        "bullet_count": len(bullet_matches),
        "issues": issues,
        "suggestions": suggestions,
    }


def _check_quantification(text: str) -> Dict[str, Any]:
    matches = QUANT_RE.findall(text)
    count = len(matches)

    score = min(count * 20, 100)
    issues = []
    suggestions = []

    if count == 0:
        issues.append("No quantified achievements found — numbers make resumes stand out")
        suggestions.append("Add metrics to your achievements: 'Increased sales by 30%', 'Managed team of 8'")
    elif count < 3:
        suggestions.append("Add more numbers/metrics — aim for at least 3–5 quantified achievements")

    return {
        "score": score,
        "quantified_count": count,
        "issues": issues,
        "suggestions": suggestions,
    }


# ── Main scoring function ────────────────────────────────────────────────────

def score_resume(text: str) -> Dict[str, Any]:
    """
    Score resume across 5 ATS-critical dimensions.
    Returns weighted total score + per-category breakdown + suggestions.

    Weights:
      contact_info    15%
      sections        20%
      keywords        35%
      formatting      20%
      quantification  10%
    """
    contact   = _check_contact_info(text)
    sections  = _check_sections(text)
    keywords  = _check_keywords(text)
    formatting = _check_formatting(text)
    quant     = _check_quantification(text)

    # Weighted final score
    final_score = round(
        contact["score"]    * 0.15 +
        sections["score"]   * 0.20 +
        keywords["score"]   * 0.35 +
        formatting["score"] * 0.20 +
        quant["score"]      * 0.10
    )

    # Aggregate all issues and suggestions, sorted by priority
    all_issues = (
        contact["issues"] +
        sections["issues"] +
        keywords["issues"] +
        formatting["issues"] +
        quant["issues"]
    )

    all_suggestions = (
        sections["suggestions"] +
        keywords["suggestions"] +
        formatting["suggestions"] +
        contact["suggestions"] +
        quant["suggestions"]
    )

    # Grade label
    if final_score >= 85:
        grade = "Excellent"
        grade_color = "#22c55e"
    elif final_score >= 70:
        grade = "Good"
        grade_color = "#84cc16"
    elif final_score >= 50:
        grade = "Fair"
        grade_color = "#f59e0b"
    else:
        grade = "Poor"
        grade_color = "#ef4444"

    return {
        "final_score": final_score,
        "grade": grade,
        "grade_color": grade_color,
        "categories": {
            "contact_info": {
                "label": "Contact Information",
                "score": contact["score"],
                "weight": 15,
                "details": contact["details"],
                "issues": contact["issues"],
                "suggestions": contact["suggestions"],
            },
            "sections": {
                "label": "Resume Sections",
                "score": sections["score"],
                "weight": 20,
                "found": sections["found_sections"],
                "issues": sections["issues"],
                "suggestions": sections["suggestions"],
            },
            "keywords": {
                "label": "Keywords & Skills",
                "score": keywords["score"],
                "weight": 35,
                "tech_keywords_found": keywords["found_tech_keywords"],
                "action_verbs_found": keywords["found_action_verbs"],
                "tech_count": keywords["tech_keyword_count"],
                "action_count": keywords["action_verb_count"],
                "issues": keywords["issues"],
                "suggestions": keywords["suggestions"],
            },
            "formatting": {
                "label": "ATS Formatting",
                "score": formatting["score"],
                "weight": 20,
                "has_bullets": formatting["has_bullets"],
                "has_emojis": formatting["has_emojis"],
                "estimated_pages": formatting["estimated_pages"],
                "issues": formatting["issues"],
                "suggestions": formatting["suggestions"],
            },
            "quantification": {
                "label": "Quantified Achievements",
                "score": quant["score"],
                "weight": 10,
                "count": quant["quantified_count"],
                "issues": quant["issues"],
                "suggestions": quant["suggestions"],
            },
        },
        "all_issues": all_issues,
        "all_suggestions": all_suggestions[:10],  # top 10 suggestions
    }

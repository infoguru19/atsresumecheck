"""
api/build_resume.py  —  Vercel Python Serverless Function
POST /api/build-resume

Receives JSON form data, generates a 100% ATS-optimised DOCX resume,
and returns it as a binary download.

Uses python-docx only — pure Python, no C extensions.
"""

from http.server import BaseHTTPRequestHandler
import json
import io
from docx import Document
from docx.shared import Pt, RGBColor, Inches, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
from docx.oxml import OxmlElement


# ── Colour palette (ATS-safe: black/grey only, no fancy colours) ─────────────
C_BLACK  = RGBColor(0x1a, 0x23, 0x32)   # navy-black
C_GREY   = RGBColor(0x4a, 0x55, 0x68)   # body grey
C_LIGHT  = RGBColor(0x71, 0x80, 0x96)   # muted
C_RULE   = RGBColor(0xcc, 0xcc, 0xcc)   # divider


def _set_font(run, name="Calibri", size=11, bold=False, italic=False, colour=None):
    run.font.name     = name
    run.font.size     = Pt(size)
    run.font.bold     = bold
    run.font.italic   = italic
    if colour:
        run.font.color.rgb = colour


def _para_spacing(para, before=0, after=0, line=None):
    pf = para.paragraph_format
    pf.space_before = Pt(before)
    pf.space_after  = Pt(after)
    if line:
        pf.line_spacing = Pt(line)


def _add_rule(doc):
    """Horizontal rule via paragraph bottom border."""
    p   = doc.add_paragraph()
    _para_spacing(p, before=0, after=2)
    pPr = p._p.get_or_add_pPr()
    pBdr = OxmlElement('w:pBdr')
    bottom = OxmlElement('w:bottom')
    bottom.set(qn('w:val'),   'single')
    bottom.set(qn('w:sz'),    '4')
    bottom.set(qn('w:space'), '1')
    bottom.set(qn('w:color'), 'AAAAAA')
    pBdr.append(bottom)
    pPr.append(pBdr)
    return p


def _section_heading(doc, title):
    """ATS-safe section heading with rule."""
    p = doc.add_paragraph()
    _para_spacing(p, before=10, after=1)
    run = p.add_run(title.upper())
    _set_font(run, size=10, bold=True, colour=C_BLACK)
    run.font.all_caps = True
    _add_rule(doc)


def _bullet(doc, text):
    """Proper bullet paragraph (ATS-parseable)."""
    p = doc.add_paragraph(style='List Bullet')
    _para_spacing(p, before=1, after=1)
    run = p.add_run(text)
    _set_font(run, size=10.5, colour=C_GREY)
    return p


def build_docx(data: dict) -> bytes:
    """
    Build a 100% ATS-optimised DOCX from form data dict.
    ATS rules followed:
      - Single-column layout
      - Standard section headings (EXPERIENCE, EDUCATION, SKILLS…)
      - Bullet points via Word list style (not unicode)
      - No tables, no text boxes, no images, no columns
      - Calibri font (ATS-safe)
      - Contact info in plain text at top
      - Keywords in Skills and every bullet point
    """
    doc = Document()

    # ── Page setup (US Letter, 0.75" margins) ────────────────────────────────
    section = doc.sections[0]
    section.page_width  = Inches(8.5)
    section.page_height = Inches(11)
    section.top_margin    = Inches(0.75)
    section.bottom_margin = Inches(0.75)
    section.left_margin   = Inches(0.75)
    section.right_margin  = Inches(0.75)

    # ── Default paragraph style ──────────────────────────────────────────────
    doc.styles['Normal'].font.name = 'Calibri'
    doc.styles['Normal'].font.size = Pt(11)

    # Fix List Bullet indent
    try:
        lb = doc.styles['List Bullet']
        lb.font.name = 'Calibri'
        lb.font.size = Pt(10.5)
    except Exception:
        pass

    # ════════════════════════════════════════════════════════════════
    #  1. HEADER — Name + Contact
    # ════════════════════════════════════════════════════════════════
    name = data.get('fullName', '').strip() or 'Your Name'
    p_name = doc.add_paragraph()
    p_name.alignment = WD_ALIGN_PARAGRAPH.CENTER
    _para_spacing(p_name, before=0, after=2)
    r = p_name.add_run(name)
    _set_font(r, size=22, bold=True, colour=C_BLACK)

    # Job title / headline
    if data.get('jobTitle'):
        p_title = doc.add_paragraph()
        p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
        _para_spacing(p_title, before=0, after=4)
        r = p_title.add_run(data['jobTitle'])
        _set_font(r, size=12, colour=C_GREY)

    # Contact line
    contacts = []
    if data.get('email'):    contacts.append(data['email'])
    if data.get('phone'):    contacts.append(data['phone'])
    if data.get('location'): contacts.append(data['location'])
    if data.get('linkedin'): contacts.append(data['linkedin'])
    if data.get('github'):   contacts.append(data['github'])

    if contacts:
        p_contact = doc.add_paragraph()
        p_contact.alignment = WD_ALIGN_PARAGRAPH.CENTER
        _para_spacing(p_contact, before=0, after=6)
        r = p_contact.add_run('  |  '.join(contacts))
        _set_font(r, size=10, colour=C_GREY)

    _add_rule(doc)

    # ════════════════════════════════════════════════════════════════
    #  2. PROFESSIONAL SUMMARY
    # ════════════════════════════════════════════════════════════════
    if data.get('summary'):
        _section_heading(doc, 'Professional Summary')
        p = doc.add_paragraph()
        _para_spacing(p, before=2, after=6)
        r = p.add_run(data['summary'])
        _set_font(r, size=10.5, colour=C_GREY)

    # ════════════════════════════════════════════════════════════════
    #  3. SKILLS  (keyword-rich — most important for ATS)
    # ════════════════════════════════════════════════════════════════
    skill_cats = data.get('skillCategories', [])
    if skill_cats:
        _section_heading(doc, 'Skills')
        for cat in skill_cats:
            if not cat.get('name') or not cat.get('skills'):
                continue
            p = doc.add_paragraph()
            _para_spacing(p, before=2, after=2)
            r_label = p.add_run(cat['name'] + ': ')
            _set_font(r_label, size=10.5, bold=True, colour=C_BLACK)
            r_vals = p.add_run(cat['skills'])
            _set_font(r_vals, size=10.5, colour=C_GREY)

    # ════════════════════════════════════════════════════════════════
    #  4. WORK EXPERIENCE
    # ════════════════════════════════════════════════════════════════
    experiences = data.get('experiences', [])
    if experiences:
        _section_heading(doc, 'Work Experience')
        for exp in experiences:
            if not exp.get('company') and not exp.get('title'):
                continue

            # Role + Company on same line with date right-aligned via tab
            p = doc.add_paragraph()
            _para_spacing(p, before=6, after=1)

            # Set right-aligned tab stop at page width
            from docx.oxml.ns import qn as _qn
            from docx.oxml import OxmlElement as _OE
            pPr = p._p.get_or_add_pPr()
            tabs = _OE('w:tabs')
            tab  = _OE('w:tab')
            tab.set(_qn('w:val'), 'right')
            tab.set(_qn('w:pos'), '8640')   # ~6 inches from left margin
            tabs.append(tab)
            pPr.append(tabs)

            r1 = p.add_run(exp.get('title', ''))
            _set_font(r1, size=11, bold=True, colour=C_BLACK)
            if exp.get('dateRange'):
                r2 = p.add_run('\t' + exp['dateRange'])
                _set_font(r2, size=10.5, colour=C_LIGHT)

            # Company + location
            p2 = doc.add_paragraph()
            _para_spacing(p2, before=0, after=2)
            co_text = exp.get('company', '')
            if exp.get('location'):
                co_text += '  —  ' + exp['location']
            r = p2.add_run(co_text)
            _set_font(r, size=10.5, italic=True, colour=C_GREY)

            # Bullets
            for bullet in exp.get('bullets', []):
                if bullet.strip():
                    _bullet(doc, bullet.strip())

    # ════════════════════════════════════════════════════════════════
    #  5. PROJECTS
    # ════════════════════════════════════════════════════════════════
    projects = data.get('projects', [])
    if projects:
        _section_heading(doc, 'Projects')
        for proj in projects:
            if not proj.get('name'):
                continue
            p = doc.add_paragraph()
            _para_spacing(p, before=5, after=1)
            r1 = p.add_run(proj['name'])
            _set_font(r1, size=11, bold=True, colour=C_BLACK)
            if proj.get('tech'):
                r2 = p.add_run('  |  ' + proj['tech'])
                _set_font(r2, size=10.5, italic=True, colour=C_LIGHT)
            if proj.get('url'):
                r3 = p.add_run('  ' + proj['url'])
                _set_font(r3, size=10, colour=C_LIGHT)

            for bullet in proj.get('bullets', []):
                if bullet.strip():
                    _bullet(doc, bullet.strip())

    # ════════════════════════════════════════════════════════════════
    #  6. EDUCATION
    # ════════════════════════════════════════════════════════════════
    education = data.get('education', [])
    if education:
        _section_heading(doc, 'Education')
        for edu in education:
            if not edu.get('school'):
                continue
            p = doc.add_paragraph()
            _para_spacing(p, before=5, after=1)

            # Add right tab for date
            from docx.oxml.ns import qn as _qn
            from docx.oxml import OxmlElement as _OE
            pPr = p._p.get_or_add_pPr()
            tabs = _OE('w:tabs')
            tab  = _OE('w:tab')
            tab.set(_qn('w:val'), 'right')
            tab.set(_qn('w:pos'), '8640')
            tabs.append(tab)
            pPr.append(tabs)

            r1 = p.add_run(edu.get('degree', ''))
            _set_font(r1, size=11, bold=True, colour=C_BLACK)
            if edu.get('year'):
                r2 = p.add_run('\t' + edu['year'])
                _set_font(r2, size=10.5, colour=C_LIGHT)

            p2 = doc.add_paragraph()
            _para_spacing(p2, before=0, after=2)
            school_text = edu['school']
            if edu.get('gpa'):
                school_text += '  —  GPA: ' + edu['gpa']
            r = p2.add_run(school_text)
            _set_font(r, size=10.5, italic=True, colour=C_GREY)

            for bullet in edu.get('bullets', []):
                if bullet.strip():
                    _bullet(doc, bullet.strip())

    # ════════════════════════════════════════════════════════════════
    #  7. CERTIFICATIONS
    # ════════════════════════════════════════════════════════════════
    certs = data.get('certifications', [])
    if certs:
        _section_heading(doc, 'Certifications')
        for cert in certs:
            if not cert.get('name'):
                continue
            p = doc.add_paragraph()
            _para_spacing(p, before=3, after=1)
            r1 = p.add_run(cert['name'])
            _set_font(r1, size=10.5, bold=True, colour=C_BLACK)
            parts = []
            if cert.get('issuer'): parts.append(cert['issuer'])
            if cert.get('year'):   parts.append(cert['year'])
            if parts:
                r2 = p.add_run('  —  ' + '  ·  '.join(parts))
                _set_font(r2, size=10.5, colour=C_GREY)

    # ════════════════════════════════════════════════════════════════
    #  Save to bytes
    # ════════════════════════════════════════════════════════════════
    buf = io.BytesIO()
    doc.save(buf)
    buf.seek(0)
    return buf.read()


# ══════════════════════════════════════════════════════════════════════════════
#  VERCEL HANDLER
# ══════════════════════════════════════════════════════════════════════════════

class handler(BaseHTTPRequestHandler):

    def log_message(self, *a): pass

    def do_OPTIONS(self):
        self.send_response(200)
        self._cors()
        self.end_headers()

    def do_POST(self):
        ct     = self.headers.get("Content-Type", "")
        length = int(self.headers.get("Content-Length", 0) or 0)

        if "application/json" not in ct:
            return self._error(400, "Expected application/json")
        if length > 1 * 1024 * 1024:
            return self._error(400, "Request too large")
        if length == 0:
            return self._error(400, "Empty request")

        body = self.rfile.read(length)
        try:
            data = json.loads(body)
        except Exception as e:
            return self._error(400, f"Invalid JSON: {e}")

        if not data.get('fullName'):
            return self._error(400, "fullName is required")

        try:
            docx_bytes = build_docx(data)
        except Exception as e:
            return self._error(500, f"DOCX generation failed: {str(e)}")

        # Return binary DOCX
        name = (data.get('fullName') or 'resume').replace(' ', '_')
        filename = f"{name}_ATS_Resume.docx"

        self.send_response(200)
        self._cors()
        self.send_header("Content-Type",        "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
        self.send_header("Content-Disposition", f'attachment; filename="{filename}"')
        self.send_header("Content-Length",      str(len(docx_bytes)))
        self.end_headers()
        self.wfile.write(docx_bytes)

    def _cors(self):
        self.send_header("Access-Control-Allow-Origin",  "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def _error(self, status, msg):
        body = json.dumps({"error": msg}).encode("utf-8")
        self.send_response(status)
        self._cors()
        self.send_header("Content-Type",   "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

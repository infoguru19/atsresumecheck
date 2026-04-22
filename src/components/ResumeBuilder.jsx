import { useState, useCallback } from 'react'

/* ── Shared style helpers ─────────────────────────────────────── */
const inp = {
  width: '100%', padding: '0.65rem 0.9rem',
  border: '1px solid #d0dae8', borderRadius: 8,
  fontSize: '0.88rem', color: '#1a2332',
  background: '#fff', outline: 'none',
  fontFamily: 'inherit', transition: 'border-color 0.2s',
}
const label = { display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#4a5568', marginBottom: '0.35rem' }
const row   = { display: 'grid', gap: '0.85rem' }

function Field({ label: lbl, value, onChange, placeholder, type = 'text', multiline, rows = 3, required }) {
  return (
    <div>
      <label style={label}>{lbl}{required && <span style={{ color: '#ef4444', marginLeft: 2 }}>*</span>}</label>
      {multiline
        ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
            rows={rows} style={{ ...inp, resize: 'vertical', lineHeight: 1.6 }}
            onFocus={e => e.target.style.borderColor = '#2fc89a'}
            onBlur={e => e.target.style.borderColor = '#d0dae8'} />
        : <input type={type} value={value} onChange={e => onChange(e.target.value)}
            placeholder={placeholder} style={inp}
            onFocus={e => e.target.style.borderColor = '#2fc89a'}
            onBlur={e => e.target.style.borderColor = '#d0dae8'} />
      }
    </div>
  )
}

function SectionCard({ title, children, onAdd, addLabel }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e8ecf4', borderRadius: 14, padding: '1.4rem', boxShadow: '0 2px 12px rgba(26,35,50,0.05)', marginBottom: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h3 style={{ fontFamily: 'Fraunces,serif', fontSize: '1rem', fontWeight: 700, color: '#1a2332' }}>{title}</h3>
        {onAdd && (
          <button onClick={onAdd} style={{
            background: '#e6f9f3', border: '1px solid #a7f3d0', borderRadius: 8,
            padding: '0.3rem 0.75rem', fontSize: '0.78rem', fontWeight: 600,
            color: '#047857', cursor: 'pointer',
          }}>+ {addLabel || 'Add'}</button>
        )}
      </div>
      {children}
    </div>
  )
}

function RemoveBtn({ onClick }) {
  return (
    <button onClick={onClick} style={{
      background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6,
      padding: '0.25rem 0.6rem', fontSize: '0.72rem', color: '#dc2626',
      cursor: 'pointer', flexShrink: 0,
    }}>✕ Remove</button>
  )
}

/* ── Step labels ─────────────────────────────────────────────── */
const STEPS = [
  { id: 0, label: 'Contact',      icon: '👤' },
  { id: 1, label: 'Skills',       icon: '🔑' },
  { id: 2, label: 'Experience',   icon: '💼' },
  { id: 3, label: 'Projects',     icon: '🚀' },
  { id: 4, label: 'Education',    icon: '🎓' },
  { id: 5, label: 'Certificates', icon: '📜' },
  { id: 6, label: 'Download',     icon: '⬇️' },
]

const INITIAL = {
  fullName:        '',
  jobTitle:        '',
  email:           '',
  phone:           '',
  location:        '',
  linkedin:        '',
  github:          '',
  summary:         '',
  skillCategories: [
    { id: 1, name: 'Programming Languages', skills: '' },
    { id: 2, name: 'Frameworks & Libraries', skills: '' },
    { id: 3, name: 'Cloud & DevOps',         skills: '' },
    { id: 4, name: 'Databases',              skills: '' },
  ],
  experiences: [{
    id: 1, title: '', company: '', location: '', dateRange: '',
    bullets: ['', '', ''],
  }],
  projects: [{
    id: 1, name: '', tech: '', url: '',
    bullets: ['', ''],
  }],
  education: [{
    id: 1, degree: '', school: '', year: '', gpa: '',
    bullets: [''],
  }],
  certifications: [
    { id: 1, name: '', issuer: '', year: '' },
  ],
}

export default function ResumeBuilder({ onBack }) {
  const [step,    setStep]    = useState(0)
  const [data,    setData]    = useState(INITIAL)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)
  const [done,    setDone]    = useState(false)

  /* ── Field updaters ───────────────────────────────────────── */
  const upd = useCallback((field) => (val) => setData(d => ({ ...d, [field]: val })), [])

  const updSkill = (id, field, val) =>
    setData(d => ({ ...d, skillCategories: d.skillCategories.map(s => s.id === id ? { ...s, [field]: val } : s) }))

  const addSkillCat = () =>
    setData(d => ({ ...d, skillCategories: [...d.skillCategories, { id: Date.now(), name: '', skills: '' }] }))

  const remSkillCat = (id) =>
    setData(d => ({ ...d, skillCategories: d.skillCategories.filter(s => s.id !== id) }))

  const updExp = (id, field, val) =>
    setData(d => ({ ...d, experiences: d.experiences.map(e => e.id === id ? { ...e, [field]: val } : e) }))

  const updExpBullet = (id, idx, val) =>
    setData(d => ({
      ...d,
      experiences: d.experiences.map(e => e.id === id
        ? { ...e, bullets: e.bullets.map((b, i) => i === idx ? val : b) }
        : e)
    }))

  const addExpBullet = (id) =>
    setData(d => ({ ...d, experiences: d.experiences.map(e => e.id === id ? { ...e, bullets: [...e.bullets, ''] } : e) }))

  const addExp = () =>
    setData(d => ({ ...d, experiences: [...d.experiences, { id: Date.now(), title: '', company: '', location: '', dateRange: '', bullets: ['', ''] }] }))

  const remExp = (id) =>
    setData(d => ({ ...d, experiences: d.experiences.filter(e => e.id !== id) }))

  const updProj = (id, field, val) =>
    setData(d => ({ ...d, projects: d.projects.map(p => p.id === id ? { ...p, [field]: val } : p) }))

  const updProjBullet = (id, idx, val) =>
    setData(d => ({
      ...d,
      projects: d.projects.map(p => p.id === id
        ? { ...p, bullets: p.bullets.map((b, i) => i === idx ? val : b) }
        : p)
    }))

  const addProjBullet = (id) =>
    setData(d => ({ ...d, projects: d.projects.map(p => p.id === id ? { ...p, bullets: [...p.bullets, ''] } : p) }))

  const addProj = () =>
    setData(d => ({ ...d, projects: [...d.projects, { id: Date.now(), name: '', tech: '', url: '', bullets: [''] }] }))

  const remProj = (id) =>
    setData(d => ({ ...d, projects: d.projects.filter(p => p.id !== id) }))

  const updEdu = (id, field, val) =>
    setData(d => ({ ...d, education: d.education.map(e => e.id === id ? { ...e, [field]: val } : e) }))

  const addEdu = () =>
    setData(d => ({ ...d, education: [...d.education, { id: Date.now(), degree: '', school: '', year: '', gpa: '', bullets: [] }] }))

  const remEdu = (id) =>
    setData(d => ({ ...d, education: d.education.filter(e => e.id !== id) }))

  const updCert = (id, field, val) =>
    setData(d => ({ ...d, certifications: d.certifications.map(c => c.id === id ? { ...c, [field]: val } : c) }))

  const addCert = () =>
    setData(d => ({ ...d, certifications: [...d.certifications, { id: Date.now(), name: '', issuer: '', year: '' }] }))

  const remCert = (id) =>
    setData(d => ({ ...d, certifications: d.certifications.filter(c => c.id !== id) }))

  /* ── Download ─────────────────────────────────────────────── */
  const handleDownload = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const res = await fetch('/api/build_resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || `Server error ${res.status}`)
      }
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `${data.fullName.replace(/\s+/g, '_') || 'Resume'}_ATS_Resume.docx`
      a.click()
      URL.revokeObjectURL(url)
      setDone(true)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [data])

  /* ── Step validation ──────────────────────────────────────── */
  const canNext = () => {
    if (step === 0) return data.fullName.trim() && data.email.trim()
    return true
  }

  /* ═══════════════════════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════════════════════ */

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>

      {/* ── Back button ── */}
      <button onClick={onBack} style={{
        background: 'none', border: 'none', color: '#8896a8',
        fontSize: '0.85rem', cursor: 'pointer', marginBottom: '1.5rem',
        display: 'flex', alignItems: 'center', gap: '0.35rem', padding: 0,
      }}>← Back to ATS Checker</button>

      {/* ── Page title ── */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontSize: '0.7rem', color: '#2fc89a', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.4rem' }}>
          Resume Builder
        </div>
        <h2 style={{ fontFamily: 'Fraunces,serif', fontSize: 'clamp(1.6rem,4vw,2.2rem)', fontWeight: 700, color: '#1a2332', marginBottom: '0.5rem' }}>
          Build a 100% ATS-Optimised Resume
        </h2>
        <p style={{ color: '#8896a8', fontSize: '0.9rem' }}>
          Fill in your details — we generate a perfectly formatted DOCX ready to pass any ATS.
        </p>
      </div>

      {/* ── Step progress bar ── */}
      <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {STEPS.map((s, i) => (
          <button key={s.id} onClick={() => i <= step || canNext() ? setStep(s.id) : null}
            style={{
              background: step === s.id ? '#2fc89a' : step > s.id ? '#e6f9f3' : '#f7f8fc',
              border: `1px solid ${step === s.id ? '#2fc89a' : step > s.id ? '#a7f3d0' : '#e8ecf4'}`,
              borderRadius: 99, padding: '0.3rem 0.8rem',
              fontSize: '0.75rem', fontWeight: 600,
              color: step === s.id ? '#fff' : step > s.id ? '#047857' : '#8896a8',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem',
              transition: 'all 0.2s',
            }}
          >
            <span>{s.icon}</span> {s.label}
            {step > s.id && <span style={{ fontSize: '0.65rem' }}>✓</span>}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════
          STEP 0 — CONTACT INFO
      ════════════════════════════════════════ */}
      {step === 0 && (
        <SectionCard title="Contact Information">
          <div style={{ ...row, gridTemplateColumns: '1fr 1fr', marginBottom: '0.85rem' }}>
            <Field label="Full Name" value={data.fullName} onChange={upd('fullName')} placeholder="Rahul Sharma" required />
            <Field label="Job Title / Headline" value={data.jobTitle} onChange={upd('jobTitle')} placeholder="Senior Software Engineer" />
          </div>
          <div style={{ ...row, gridTemplateColumns: '1fr 1fr', marginBottom: '0.85rem' }}>
            <Field label="Email Address" value={data.email} onChange={upd('email')} placeholder="rahul@gmail.com" type="email" required />
            <Field label="Phone Number" value={data.phone} onChange={upd('phone')} placeholder="+91-9876543210" />
          </div>
          <div style={{ ...row, gridTemplateColumns: '1fr 1fr', marginBottom: '0.85rem' }}>
            <Field label="Location" value={data.location} onChange={upd('location')} placeholder="Mumbai, India" />
            <Field label="LinkedIn URL" value={data.linkedin} onChange={upd('linkedin')} placeholder="linkedin.com/in/yourname" />
          </div>
          <div style={{ ...row, gridTemplateColumns: '1fr 1fr', marginBottom: '0.85rem' }}>
            <Field label="GitHub URL" value={data.github} onChange={upd('github')} placeholder="github.com/yourname" />
            <div />
          </div>
          <Field label="Professional Summary (2-4 sentences, keyword-rich)" value={data.summary} onChange={upd('summary')}
            placeholder="Experienced software engineer with 5+ years building scalable web applications using React, Node.js and AWS. Led teams of 8 engineers and delivered 30%+ performance improvements across 3 product lines." multiline rows={4} />
          <p style={{ fontSize: '0.72rem', color: '#8896a8', marginTop: '0.5rem' }}>💡 ATS Tip: Include your top 3-5 skills and years of experience in the summary.</p>
        </SectionCard>
      )}

      {/* ════════════════════════════════════════
          STEP 1 — SKILLS
      ════════════════════════════════════════ */}
      {step === 1 && (
        <SectionCard title="Skills & Technologies" onAdd={addSkillCat} addLabel="Add Category">
          <p style={{ fontSize: '0.78rem', color: '#8896a8', marginBottom: '1rem' }}>
            💡 ATS Tip: List exact tool/technology names. Write "PostgreSQL" not "databases". Each comma-separated skill is a keyword.
          </p>
          {data.skillCategories.map((cat, i) => (
            <div key={cat.id} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: '0.65rem', alignItems: 'end', marginBottom: '0.75rem' }}>
              <div>
                {i === 0 && <label style={label}>Category Name</label>}
                <input value={cat.name} onChange={e => updSkill(cat.id, 'name', e.target.value)}
                  placeholder="e.g. Languages" style={inp}
                  onFocus={e => e.target.style.borderColor = '#2fc89a'}
                  onBlur={e => e.target.style.borderColor = '#d0dae8'} />
              </div>
              <div>
                {i === 0 && <label style={label}>Skills (comma-separated)</label>}
                <input value={cat.skills} onChange={e => updSkill(cat.id, 'skills', e.target.value)}
                  placeholder="Python, JavaScript, TypeScript, SQL" style={inp}
                  onFocus={e => e.target.style.borderColor = '#2fc89a'}
                  onBlur={e => e.target.style.borderColor = '#d0dae8'} />
              </div>
              <RemoveBtn onClick={() => remSkillCat(cat.id)} />
            </div>
          ))}
        </SectionCard>
      )}

      {/* ════════════════════════════════════════
          STEP 2 — EXPERIENCE
      ════════════════════════════════════════ */}
      {step === 2 && (
        <>
          <p style={{ fontSize: '0.78rem', color: '#8896a8', marginBottom: '1rem', background: '#e6f9f3', border: '1px solid #a7f3d0', borderRadius: 8, padding: '0.6rem 0.85rem' }}>
            💡 ATS Tip: Start each bullet with an action verb (Led, Built, Reduced). Include numbers and % wherever possible.
          </p>
          {data.experiences.map((exp, ei) => (
            <SectionCard key={exp.id} title={`Experience ${ei + 1}`}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-0.5rem', marginBottom: '0.75rem' }}>
                {data.experiences.length > 1 && <RemoveBtn onClick={() => remExp(exp.id)} />}
              </div>
              <div style={{ ...row, gridTemplateColumns: '1fr 1fr', marginBottom: '0.75rem' }}>
                <Field label="Job Title" value={exp.title} onChange={v => updExp(exp.id, 'title', v)} placeholder="Senior Software Engineer" />
                <Field label="Company Name" value={exp.company} onChange={v => updExp(exp.id, 'company', v)} placeholder="TechCorp Pvt Ltd" />
              </div>
              <div style={{ ...row, gridTemplateColumns: '1fr 1fr', marginBottom: '1rem' }}>
                <Field label="Location" value={exp.location} onChange={v => updExp(exp.id, 'location', v)} placeholder="Mumbai, India" />
                <Field label="Date Range" value={exp.dateRange} onChange={v => updExp(exp.id, 'dateRange', v)} placeholder="Jan 2021 – Present" />
              </div>
              <label style={label}>Bullet Points (start with action verb, add metrics)</label>
              {exp.bullets.map((b, bi) => (
                <input key={bi} value={b} onChange={e => updExpBullet(exp.id, bi, e.target.value)}
                  placeholder={`e.g. ${['Developed REST API serving 2M+ daily requests reducing latency by 45%','Led team of 8 engineers to deliver product 2 weeks ahead of schedule','Automated CI/CD pipeline cutting deployment time from 2hrs to 12 minutes'][bi % 3]}`}
                  style={{ ...inp, marginBottom: '0.5rem' }}
                  onFocus={e => e.target.style.borderColor = '#2fc89a'}
                  onBlur={e => e.target.style.borderColor = '#d0dae8'} />
              ))}
              <button onClick={() => addExpBullet(exp.id)} style={{ background: 'none', border: 'none', color: '#2fc89a', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600, padding: 0 }}>
                + Add bullet point
              </button>
            </SectionCard>
          ))}
          <button onClick={addExp} style={{
            width: '100%', padding: '0.75rem', background: '#f7f8fc',
            border: '2px dashed #d0dae8', borderRadius: 12,
            color: '#8896a8', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
          }}>+ Add Another Experience</button>
        </>
      )}

      {/* ════════════════════════════════════════
          STEP 3 — PROJECTS
      ════════════════════════════════════════ */}
      {step === 3 && (
        <>
          <p style={{ fontSize: '0.78rem', color: '#8896a8', marginBottom: '1rem', background: '#e6f9f3', border: '1px solid #a7f3d0', borderRadius: 8, padding: '0.6rem 0.85rem' }}>
            💡 ATS Tip: List the exact tech stack used. Projects count as experience for ATS keyword matching.
          </p>
          {data.projects.map((proj, pi) => (
            <SectionCard key={proj.id} title={`Project ${pi + 1}`}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-0.5rem', marginBottom: '0.75rem' }}>
                {data.projects.length > 1 && <RemoveBtn onClick={() => remProj(proj.id)} />}
              </div>
              <div style={{ ...row, gridTemplateColumns: '1fr 1fr', marginBottom: '0.75rem' }}>
                <Field label="Project Name" value={proj.name} onChange={v => updProj(proj.id, 'name', v)} placeholder="ATS Resume Checker" />
                <Field label="Technologies Used" value={proj.tech} onChange={v => updProj(proj.id, 'tech', v)} placeholder="React, FastAPI, Python, AWS" />
              </div>
              <Field label="Project URL / GitHub Link" value={proj.url} onChange={v => updProj(proj.id, 'url', v)} placeholder="github.com/yourname/project" />
              <div style={{ marginTop: '0.75rem' }}>
                <label style={label}>Description Bullets</label>
                {proj.bullets.map((b, bi) => (
                  <input key={bi} value={b} onChange={e => updProjBullet(proj.id, bi, e.target.value)}
                    placeholder="e.g. Built REST API handling 10K requests/day with 99.9% uptime"
                    style={{ ...inp, marginBottom: '0.5rem' }}
                    onFocus={e => e.target.style.borderColor = '#2fc89a'}
                    onBlur={e => e.target.style.borderColor = '#d0dae8'} />
                ))}
                <button onClick={() => addProjBullet(proj.id)} style={{ background: 'none', border: 'none', color: '#2fc89a', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600, padding: 0 }}>
                  + Add bullet point
                </button>
              </div>
            </SectionCard>
          ))}
          <button onClick={addProj} style={{ width: '100%', padding: '0.75rem', background: '#f7f8fc', border: '2px dashed #d0dae8', borderRadius: 12, color: '#8896a8', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
            + Add Another Project
          </button>
        </>
      )}

      {/* ════════════════════════════════════════
          STEP 4 — EDUCATION
      ════════════════════════════════════════ */}
      {step === 4 && (
        <>
          {data.education.map((edu, ei) => (
            <SectionCard key={edu.id} title={`Education ${ei + 1}`}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-0.5rem', marginBottom: '0.75rem' }}>
                {data.education.length > 1 && <RemoveBtn onClick={() => remEdu(edu.id)} />}
              </div>
              <div style={{ ...row, gridTemplateColumns: '1fr 1fr', marginBottom: '0.75rem' }}>
                <Field label="Degree / Qualification" value={edu.degree} onChange={v => updEdu(edu.id, 'degree', v)} placeholder="B.Tech in Computer Science" />
                <Field label="School / University" value={edu.school} onChange={v => updEdu(edu.id, 'school', v)} placeholder="IIT Bombay" />
              </div>
              <div style={{ ...row, gridTemplateColumns: '1fr 1fr' }}>
                <Field label="Graduation Year" value={edu.year} onChange={v => updEdu(edu.id, 'year', v)} placeholder="2022" />
                <Field label="GPA / CGPA (optional)" value={edu.gpa} onChange={v => updEdu(edu.id, 'gpa', v)} placeholder="8.5/10" />
              </div>
            </SectionCard>
          ))}
          <button onClick={addEdu} style={{ width: '100%', padding: '0.75rem', background: '#f7f8fc', border: '2px dashed #d0dae8', borderRadius: 12, color: '#8896a8', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
            + Add Another Education
          </button>
        </>
      )}

      {/* ════════════════════════════════════════
          STEP 5 — CERTIFICATIONS
      ════════════════════════════════════════ */}
      {step === 5 && (
        <>
          <p style={{ fontSize: '0.78rem', color: '#8896a8', marginBottom: '1rem', background: '#e6f9f3', border: '1px solid #a7f3d0', borderRadius: 8, padding: '0.6rem 0.85rem' }}>
            💡 ATS Tip: Certification names are powerful keywords — "AWS Certified Solutions Architect" is scanned for "AWS", "certified", "solutions architect".
          </p>
          {data.certifications.map((cert, ci) => (
            <SectionCard key={cert.id} title={`Certification ${ci + 1}`}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-0.5rem', marginBottom: '0.75rem' }}>
                {data.certifications.length > 1 && <RemoveBtn onClick={() => remCert(cert.id)} />}
              </div>
              <div style={{ ...row, gridTemplateColumns: '2fr 1fr 0.75fr', marginBottom: '0.75rem' }}>
                <Field label="Certification Name" value={cert.name} onChange={v => updCert(cert.id, 'name', v)} placeholder="AWS Solutions Architect Associate" />
                <Field label="Issuing Organization" value={cert.issuer} onChange={v => updCert(cert.id, 'issuer', v)} placeholder="Amazon Web Services" />
                <Field label="Year" value={cert.year} onChange={v => updCert(cert.id, 'year', v)} placeholder="2023" />
              </div>
            </SectionCard>
          ))}
          <button onClick={addCert} style={{ width: '100%', padding: '0.75rem', background: '#f7f8fc', border: '2px dashed #d0dae8', borderRadius: 12, color: '#8896a8', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
            + Add Another Certification
          </button>
        </>
      )}

      {/* ════════════════════════════════════════
          STEP 6 — DOWNLOAD
      ════════════════════════════════════════ */}
      {step === 6 && (
        <div style={{ background: '#fff', border: '1px solid #e8ecf4', borderRadius: 20, padding: '2.5rem 2rem', textAlign: 'center', boxShadow: '0 4px 24px rgba(26,35,50,0.08)' }}>
          {!done ? (
            <>
              <div style={{ fontSize: 56, marginBottom: '1rem' }}>📄</div>
              <h3 style={{ fontFamily: 'Fraunces,serif', fontSize: '1.5rem', fontWeight: 700, color: '#1a2332', marginBottom: '0.75rem' }}>
                Ready to Download
              </h3>
              <p style={{ color: '#8896a8', fontSize: '0.9rem', marginBottom: '2rem', maxWidth: 440, margin: '0 auto 2rem' }}>
                Your ATS-optimised resume will be generated as a <strong>.docx</strong> file with proper
                formatting, section headings, bullet points, and all your keywords correctly placed.
              </p>

              {/* Summary preview */}
              <div style={{ background: '#f7f8fc', border: '1px solid #e8ecf4', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '2rem', textAlign: 'left', maxWidth: 440, margin: '0 auto 2rem' }}>
                {[
                  ['Name',            data.fullName || '—'],
                  ['Skills groups',   data.skillCategories.filter(s=>s.name).length + ' categories'],
                  ['Experiences',     data.experiences.filter(e=>e.company||e.title).length],
                  ['Projects',        data.projects.filter(p=>p.name).length],
                  ['Education',       data.education.filter(e=>e.school).length],
                  ['Certifications',  data.certifications.filter(c=>c.name).length],
                ].map(([k,v])=>(
                  <div key={k} style={{ display:'flex', justifyContent:'space-between', fontSize:'0.82rem', padding:'0.3rem 0', borderBottom:'1px solid #e8ecf4' }}>
                    <span style={{ color:'#8896a8' }}>{k}</span>
                    <span style={{ color:'#1a2332', fontWeight:600 }}>{v}</span>
                  </div>
                ))}
              </div>

              {error && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '0.75rem', color: '#dc2626', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  ⚠️ {error}
                </div>
              )}

              <button onClick={handleDownload} disabled={loading} style={{
                background: loading ? '#e8ecf4' : 'linear-gradient(135deg,#2fc89a,#22a882)',
                border: 'none', borderRadius: 12,
                padding: '0.9rem 2.5rem', color: loading ? '#8896a8' : '#fff',
                fontSize: '1rem', fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 4px 14px rgba(47,200,154,0.4)',
                display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
                transition: 'all 0.2s',
              }}>
                {loading ? (
                  <>
                    <span style={{ width:18,height:18,border:'2px solid #b0bec8',borderTopColor:'#8896a8',borderRadius:'50%',animation:'spin 0.7s linear infinite',display:'inline-block' }}/>
                    Generating DOCX…
                  </>
                ) : '⬇️  Download ATS Resume (.docx)'}
              </button>
              <p style={{ color: '#b0bec8', fontSize: '0.75rem', marginTop: '0.85rem' }}>
                Opens in Microsoft Word, Google Docs, or LibreOffice
              </p>
            </>
          ) : (
            <>
              <div style={{ fontSize: 64, marginBottom: '1rem' }}>🎉</div>
              <h3 style={{ fontFamily: 'Fraunces,serif', fontSize: '1.5rem', fontWeight: 700, color: '#1a2332', marginBottom: '0.75rem' }}>
                Resume Downloaded!
              </h3>
              <p style={{ color: '#8896a8', fontSize: '0.9rem', marginBottom: '2rem' }}>
                Your ATS-optimised resume has been saved. Upload it to the ATS checker to verify your score!
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button onClick={onBack} style={{
                  background: '#2fc89a', border: 'none', borderRadius: 12,
                  padding: '0.8rem 1.75rem', color: '#fff', fontSize: '0.9rem', fontWeight: 700,
                  cursor: 'pointer', boxShadow: '0 4px 14px rgba(47,200,154,0.35)',
                }}>📊 Check ATS Score Now</button>
                <button onClick={handleDownload} style={{
                  background: '#f7f8fc', border: '1px solid #e8ecf4', borderRadius: 12,
                  padding: '0.8rem 1.75rem', color: '#4a5568', fontSize: '0.9rem', fontWeight: 600,
                  cursor: 'pointer',
                }}>⬇️ Download Again</button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Navigation buttons ── */}
      {step < 6 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', gap: '0.75rem' }}>
          <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
            style={{
              background: '#f7f8fc', border: '1px solid #e8ecf4', borderRadius: 10,
              padding: '0.7rem 1.5rem', color: step === 0 ? '#b0bec8' : '#4a5568',
              fontSize: '0.875rem', fontWeight: 600, cursor: step === 0 ? 'not-allowed' : 'pointer',
            }}>← Previous</button>

          <button
            onClick={() => canNext() ? setStep(s => Math.min(6, s + 1)) : null}
            disabled={!canNext()}
            style={{
              background: canNext() ? '#2fc89a' : '#e8ecf4',
              border: 'none', borderRadius: 10,
              padding: '0.7rem 2rem', color: canNext() ? '#fff' : '#b0bec8',
              fontSize: '0.875rem', fontWeight: 700,
              cursor: canNext() ? 'pointer' : 'not-allowed',
              boxShadow: canNext() ? '0 4px 14px rgba(47,200,154,0.3)' : 'none',
            }}>
            {step === 5 ? '✨ Build My Resume →' : 'Next →'}
          </button>
        </div>
      )}
    </div>
  )
}

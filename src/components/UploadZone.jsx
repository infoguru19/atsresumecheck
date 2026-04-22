import { useState, useRef, useCallback } from 'react'

const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
]
const fmt = b => b < 1048576 ? (b/1024).toFixed(0) + ' KB' : (b/1048576).toFixed(1) + ' MB'

const HOW_STEPS = [
  { icon: '📤', n: '01', title: 'Upload',   desc: 'Drop your PDF or DOCX resume — up to 5 MB' },
  { icon: '⚙️', n: '02', title: 'Analyze',  desc: '5 ATS parameters checked in under 3 seconds' },
  { icon: '📊', n: '03', title: 'Score',    desc: 'Weighted % score with per-category breakdown' },
  { icon: '✏️', n: '04', title: 'Improve',  desc: 'Prioritized list of fixes to boost your score' },
]

export default function UploadZone({ file, loading, error, onSelect, onDelete, onAnalyze }) {
  const [dragging, setDragging] = useState(false)
  const [fileErr,  setFileErr]  = useState(null)
  const inputRef = useRef(null)

  const validate = useCallback((f) => {
    setFileErr(null)
    const okType = ALLOWED_TYPES.includes(f.type) || /\.(pdf|docx|doc)$/i.test(f.name)
    if (!okType)           { setFileErr('Only PDF or DOCX files are supported.'); return }
    if (f.size > 5<<20)    { setFileErr('File must be under 5 MB.'); return }
    onSelect(f)
  }, [onSelect])

  const onDrop = useCallback(e => {
    e.preventDefault(); setDragging(false)
    const f = e.dataTransfer.files[0]; if (f) validate(f)
  }, [validate])

  const displayError = fileErr || error

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>

      {/* ── Hero ─────────────────────────────────────── */}
      <div className="fade-up" style={{ textAlign: 'center', marginBottom: '2.75rem' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          background: 'var(--amber-dim)', border: '1px solid rgba(245,166,35,0.25)',
          borderRadius: 99, padding: '0.3rem 0.9rem',
          fontSize: '0.7rem', color: '#f5a623',
          letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600,
          marginBottom: '1.5rem',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f5a623', animation: 'pulse-glow 2s infinite' }}/>
          Free · Instant · No Sign-up
        </div>

        <h1 style={{
          fontSize: 'clamp(2.2rem, 5.5vw, 3.5rem)',
          fontWeight: 700, marginBottom: '1rem', color: '#e8e8f0',
          letterSpacing: '-0.02em',
        }}>
          Will Your Resume Pass<br />
          <em style={{ color: '#f5a623', fontStyle: 'italic' }}>the ATS Filter?</em>
        </h1>

        <p style={{ color: '#7070a0', fontSize: '1rem', maxWidth: 460, margin: '0 auto', lineHeight: 1.75 }}>
          Upload your resume and get an instant ATS compatibility score — with specific improvements
          to help you get past automated screeners.
        </p>
      </div>

      {/* ── Drop Zone ─────────────────────────────────── */}
      <div className="fade-up-1"
        style={{
          border: `2px dashed ${dragging ? '#f5a623' : file ? 'rgba(45,212,191,0.45)' : 'var(--line)'}`,
          borderRadius: 'var(--radius-lg)',
          background: dragging ? 'rgba(245,166,35,0.04)' : 'var(--ink2)',
          padding: '3rem 2rem',
          textAlign: 'center',
          cursor: file ? 'default' : 'pointer',
          transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)',
          transform: dragging ? 'scale(1.015)' : 'scale(1)',
          boxShadow: dragging ? '0 0 48px rgba(245,166,35,0.08)' : 'var(--shadow)',
        }}
        onDrop={onDrop}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onClick={() => !file && inputRef.current?.click()}
      >
        <input ref={inputRef} type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          style={{ display: 'none' }}
          onChange={e => e.target.files[0] && validate(e.target.files[0])}
        />

        {!file ? (
          <>
            {/* Upload idle */}
            <div style={{
              width: 72, height: 72, borderRadius: 20,
              background: 'var(--ink3)', border: '1px solid var(--line)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 32, margin: '0 auto 1.25rem',
            }}>📄</div>

            <p style={{ fontFamily: 'Fraunces, serif', fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.4rem', color: '#e8e8f0' }}>
              {dragging ? 'Release to upload' : 'Drop your resume here'}
            </p>
            <p style={{ color: '#7070a0', fontSize: '0.875rem', marginBottom: '1.75rem' }}>
              or click to browse &nbsp;·&nbsp; PDF or DOCX &nbsp;·&nbsp; max 5 MB
            </p>

            <button style={{
              background: 'linear-gradient(135deg, #f5a623, #f97316)',
              border: 'none', borderRadius: 12,
              padding: '0.8rem 2.25rem',
              color: '#0d0d0f', fontSize: '0.9rem', fontWeight: 700,
              letterSpacing: '0.01em',
              transition: 'opacity 0.2s, transform 0.15s',
            }}
              onMouseOver={e => e.currentTarget.style.opacity = '0.88'}
              onMouseOut={e => e.currentTarget.style.opacity = '1'}
            >Choose File</button>
          </>
        ) : (
          /* File selected */
          <div style={{ animation: 'fadeUp 0.35s ease both' }}>
            <div style={{
              width: 72, height: 72, borderRadius: 20,
              background: 'var(--teal-dim)', border: '1px solid rgba(45,212,191,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 32, margin: '0 auto 1rem',
            }}>
              {file.name.endsWith('.pdf') ? '📕' : '📘'}
            </div>

            <p style={{ fontFamily: 'Fraunces, serif', fontSize: '1.15rem', fontWeight: 600, marginBottom: '0.3rem' }}>
              {file.name}
            </p>
            <p style={{ color: '#7070a0', fontSize: '0.8rem', marginBottom: '1.75rem' }}>
              {fmt(file.size)} &nbsp;·&nbsp; Ready to analyze
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              {/* Analyze */}
              <button
                onClick={e => { e.stopPropagation(); onAnalyze() }}
                disabled={loading}
                style={{
                  background: loading ? '#2a2a3a' : 'linear-gradient(135deg, #f5a623, #f97316)',
                  border: 'none', borderRadius: 12,
                  padding: '0.8rem 2rem',
                  color: loading ? '#7070a0' : '#0d0d0f',
                  fontSize: '0.9rem', fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  transition: 'opacity 0.2s',
                }}
              >
                {loading ? (
                  <>
                    <span style={{
                      width: 15, height: 15,
                      border: '2px solid #4a4a70', borderTopColor: '#7070a0',
                      borderRadius: '50%', animation: 'spin 0.7s linear infinite',
                      display: 'inline-block',
                    }} />
                    Analyzing resume…
                  </>
                ) : '🔍  Analyze My Resume'}
              </button>

              {/* Delete */}
              <button
                onClick={e => { e.stopPropagation(); onDelete() }}
                disabled={loading}
                style={{
                  background: 'var(--rose-dim)', border: '1px solid rgba(251,113,133,0.25)',
                  borderRadius: 12, padding: '0.8rem 1.5rem',
                  color: '#fb7185', fontSize: '0.875rem', fontWeight: 600,
                  cursor: 'pointer', transition: 'background 0.2s',
                }}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(251,113,133,0.18)'}
                onMouseOut={e => e.currentTarget.style.background = 'var(--rose-dim)'}
              >🗑  Delete</button>
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {displayError && (
        <div className="fade-up" style={{
          marginTop: '1rem',
          background: 'var(--rose-dim)', border: '1px solid rgba(251,113,133,0.3)',
          borderRadius: 'var(--radius-sm)', padding: '0.85rem 1.1rem',
          color: '#fb7185', fontSize: '0.875rem',
          display: 'flex', alignItems: 'center', gap: '0.5rem',
        }}>⚠️ {displayError}</div>
      )}

      {/* Privacy badge */}
      <div className="fade-up-2" style={{
        marginTop: '1.25rem', textAlign: 'center',
        color: '#4a4a70', fontSize: '0.78rem',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
      }}>
        <span>🔒</span>
        Your resume is processed in memory and permanently deleted after analysis — never stored, logged, or shared.
      </div>

      {/* ── How It Works ─────────────────────────────── */}
      <div id="how-it-works" style={{ marginTop: '5rem' }}>
        <p className="fade-up-3" style={{
          textAlign: 'center', fontSize: '0.7rem', color: '#f5a623',
          letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600,
          marginBottom: '0.6rem',
        }}>The Process</p>
        <h2 className="fade-up-3" style={{
          textAlign: 'center', fontFamily: 'Fraunces, serif',
          fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700,
          marginBottom: '2rem', color: '#e8e8f0',
        }}>How It Works</h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
          {HOW_STEPS.map(({ icon, n, title, desc }, i) => (
            <div key={n} className={`fade-up-${i + 1}`} style={{
              background: 'var(--ink2)', border: '1px solid var(--line)',
              borderRadius: 'var(--radius-md)', padding: '1.5rem 1.25rem',
              textAlign: 'center', position: 'relative', overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', top: '0.75rem', right: '0.85rem',
                fontFamily: 'Fraunces, serif', fontSize: '0.65rem', color: '#2a2a3a',
                fontWeight: 700, letterSpacing: '0.05em',
              }}>{n}</div>
              <div style={{ fontSize: 28, marginBottom: '0.75rem' }}>{icon}</div>
              <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.4rem' }}>{title}</div>
              <div style={{ color: '#7070a0', fontSize: '0.78rem', lineHeight: 1.55 }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── ATS Score Breakdown preview ─────────────── */}
      <div style={{ marginTop: '4rem' }}>
        <p style={{
          textAlign: 'center', fontSize: '0.7rem', color: '#2dd4bf',
          letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600,
          marginBottom: '0.6rem',
        }}>What We Check</p>
        <h2 style={{
          textAlign: 'center', fontFamily: 'Fraunces, serif',
          fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700,
          marginBottom: '2rem', color: '#e8e8f0',
        }}>ATS Scoring Parameters</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {[
            { label: 'Keywords & Skills',       weight: 35, color: '#f5a623', desc: '200+ in-demand tech keywords + action verbs' },
            { label: 'ATS Formatting',           weight: 20, color: '#2dd4bf', desc: 'Bullet points, no emojis, ideal page length' },
            { label: 'Resume Sections',          weight: 20, color: '#a3e635', desc: 'Experience, Education, Skills, Summary headers' },
            { label: 'Contact Information',      weight: 15, color: '#fb7185', desc: 'Email, phone, LinkedIn, GitHub presence' },
            { label: 'Quantified Achievements',  weight: 10, color: '#818cf8', desc: 'Numbers, percentages, and measurable results' },
          ].map(({ label, weight, color, desc }) => (
            <div key={label} style={{
              background: 'var(--ink2)', border: '1px solid var(--line)',
              borderRadius: 'var(--radius-md)', padding: '1rem 1.25rem',
              display: 'flex', alignItems: 'center', gap: '1rem',
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                background: `rgba(${color === '#f5a623' ? '245,166,35' : color === '#2dd4bf' ? '45,212,191' : color === '#a3e635' ? '163,230,53' : color === '#fb7185' ? '251,113,133' : '129,140,248'},0.12)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Fraunces, serif', fontSize: '1rem', fontWeight: 700, color,
              }}>{weight}%</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: '0.2rem' }}>{label}</div>
                <div style={{ color: '#7070a0', fontSize: '0.78rem' }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

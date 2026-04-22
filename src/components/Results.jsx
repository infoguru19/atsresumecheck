import { useEffect, useState } from 'react'
import ScoreRing    from './ScoreRing.jsx'
import CategoryCard from './CategoryCard.jsx'

const GRADE_EMOJI = { Excellent: '🏆', Good: '✅', Fair: '⚠️', Poor: '❌' }

const GRADE_MSG = {
  Excellent: 'Your resume is highly ATS-compatible. Minor tweaks could push it to perfect.',
  Good:      'Solid foundation. A few targeted improvements will notably boost your pass rate.',
  Fair:      'Several issues may cause ATS to deprioritize your resume — follow the fixes below.',
  Poor:      'Your resume is likely being rejected before a human ever sees it. The suggestions below are critical.',
}

export default function Results({ result, fileName, onReset }) {
  const [vis, setVis] = useState(false)
  useEffect(() => { const t = setTimeout(() => setVis(true), 40); return () => clearTimeout(t) }, [])

  const { final_score, grade, grade_color, categories, all_issues, all_suggestions } = result

  return (
    <div style={{ maxWidth: 880, margin: '0 auto', opacity: vis ? 1 : 0, transition: 'opacity 0.4s ease' }}>

      {/* ── Top row ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem',
      }}>
        <div>
          <div style={{ fontSize: '0.72rem', color: '#4a4a70', marginBottom: '0.2rem' }}>
            Analyzed: <span style={{ color: '#7070a0' }}>{fileName}</span>
          </div>
          <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: '1.6rem', fontWeight: 700 }}>
            Your ATS Report
          </h2>
        </div>
        <button onClick={onReset} style={{
          background: 'var(--ink3)', border: '1px solid var(--line)',
          borderRadius: 'var(--radius-sm)', padding: '0.55rem 1.15rem',
          color: '#7070a0', fontSize: '0.82rem', fontWeight: 500,
          transition: 'color 0.2s, border-color 0.2s',
        }}
          onMouseOver={e => { e.currentTarget.style.color = '#e8e8f0'; e.currentTarget.style.borderColor = 'var(--line-hover)' }}
          onMouseOut={e =>  { e.currentTarget.style.color = '#7070a0'; e.currentTarget.style.borderColor = 'var(--line)' }}
        >← Check Another</button>
      </div>

      {/* ── Hero score card ── */}
      <div className="card fade-up" style={{
        padding: '2.25rem 2rem', marginBottom: '1.25rem',
        display: 'flex', alignItems: 'center', gap: '2.5rem',
        flexWrap: 'wrap', justifyContent: 'center',
      }}>
        <ScoreRing score={final_score} color={grade_color} />

        <div style={{ flex: 1, minWidth: 220 }}>
          {/* Grade badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: `${grade_color}14`, border: `1px solid ${grade_color}30`,
            borderRadius: 99, padding: '0.25rem 0.85rem',
            marginBottom: '0.65rem',
          }}>
            <span style={{ fontSize: 18 }}>{GRADE_EMOJI[grade]}</span>
            <span style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, color: grade_color, fontSize: '1rem' }}>
              {grade}
            </span>
          </div>

          <p style={{ color: '#7070a0', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '1.35rem', maxWidth: 380 }}>
            {GRADE_MSG[grade]}
          </p>

          {/* Mini bars */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            {Object.entries(categories).map(([k, cat]) => {
              const c = cat.score >= 70 ? '#a3e635' : cat.score >= 45 ? '#f5a623' : '#fb7185'
              return (
                <div key={k} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <span style={{ fontSize: '0.7rem', color: '#4a4a70', width: 150, flexShrink: 0, lineHeight: 1.2 }}>{cat.label}</span>
                  <div style={{ flex: 1, height: 5, background: 'rgba(255,255,255,0.05)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${cat.score}%`, background: c, borderRadius: 99, transition: 'width 1.4s cubic-bezier(0.16,1,0.3,1)' }} />
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#4a4a70', width: 26, textAlign: 'right' }}>{cat.score}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Issues banner ── */}
      {all_issues.length > 0 && (
        <div className="fade-up-1" style={{
          background: 'var(--rose-dim)', border: '1px solid rgba(251,113,133,0.2)',
          borderRadius: 'var(--radius-md)', padding: '1.1rem 1.4rem',
          marginBottom: '1.25rem',
        }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#fb7185', marginBottom: '0.6rem' }}>
            ⚠️ {all_issues.length} Issue{all_issues.length > 1 ? 's' : ''} Found
          </div>
          <ul style={{ paddingLeft: '1.15rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            {all_issues.map((issue, i) => (
              <li key={i} style={{ color: '#e89090', fontSize: '0.825rem' }}>{issue}</li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Category cards ── */}
      <h3 className="fade-up-2" style={{
        fontFamily: 'Fraunces, serif', fontSize: '1.15rem', fontWeight: 700,
        marginBottom: '1rem', color: '#e8e8f0',
      }}>Detailed Breakdown</h3>

      <div className="fade-up-2" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))',
        gap: '1rem', marginBottom: '1.5rem',
      }}>
        {Object.entries(categories).map(([k, cat], i) => (
          <CategoryCard key={k} category={cat} index={i} />
        ))}
      </div>

      {/* ── Suggestions ── */}
      {all_suggestions.length > 0 && (
        <div className="fade-up-3" style={{
          background: 'rgba(45,212,191,0.05)', border: '1px solid rgba(45,212,191,0.18)',
          borderRadius: 'var(--radius-md)', padding: '1.5rem',
          marginBottom: '2rem',
        }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#2dd4bf', marginBottom: '1rem' }}>
            💡 Top Improvements to Make
          </div>
          <ol style={{ paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {all_suggestions.map((s, i) => (
              <li key={i} style={{ color: '#88c8c0', fontSize: '0.875rem', lineHeight: 1.6 }}>{s}</li>
            ))}
          </ol>
        </div>
      )}

      {/* ── CTA ── */}
      <div style={{ textAlign: 'center', paddingBottom: '3rem' }}>
        <button onClick={onReset} style={{
          background: 'linear-gradient(135deg, #f5a623, #f97316)',
          border: 'none', borderRadius: 'var(--radius-sm)',
          padding: '0.875rem 2.5rem',
          color: '#0d0d0f', fontSize: '0.95rem', fontWeight: 700,
          transition: 'opacity 0.2s, transform 0.15s',
        }}
          onMouseOver={e => { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.transform = 'translateY(-1px)' }}
          onMouseOut={e =>  { e.currentTarget.style.opacity = '1';    e.currentTarget.style.transform = 'translateY(0)' }}
        >Check Another Resume</button>
        <p style={{ color: '#4a4a70', fontSize: '0.75rem', marginTop: '0.85rem' }}>
          🔒 Your file was permanently deleted immediately after analysis.
        </p>
      </div>
    </div>
  )
}

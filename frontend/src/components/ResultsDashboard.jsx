import { useEffect, useState } from 'react'
import ScoreRing from './ScoreRing'
import CategoryCard from './CategoryCard'

export default function ResultsDashboard({ result, fileName, onReset }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setTimeout(() => setVisible(true), 50)
  }, [])

  const { final_score, grade, grade_color, categories, all_issues, all_suggestions } = result

  const gradeEmoji = { Excellent: '🏆', Good: '✅', Fair: '⚠️', Poor: '❌' }

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', opacity: visible ? 1 : 0, transition: 'opacity 0.4s ease' }}>

      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ color: '#8888aa', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
            Analyzed: <span style={{ color: '#a0a0c0' }}>{fileName}</span>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Your ATS Report</h2>
        </div>
        <button
          onClick={onReset}
          style={{
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            borderRadius: 12, padding: '0.6rem 1.25rem',
            color: '#f0f0f8', fontSize: '0.875rem',
            cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
            transition: 'border-color 0.2s',
          }}
          onMouseOver={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'}
          onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}
        >
          ← Analyze Another
        </button>
      </div>

      {/* Score hero */}
      <div style={{
        background: 'var(--bg2)',
        border: '1px solid var(--border)',
        borderRadius: 24, padding: '2.5rem 2rem',
        marginBottom: '1.5rem',
        display: 'flex', alignItems: 'center', gap: '2.5rem',
        flexWrap: 'wrap', justifyContent: 'center',
        boxShadow: 'var(--card-shadow)',
      }}>
        <ScoreRing score={final_score} color={grade_color} />

        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: 28 }}>{gradeEmoji[grade]}</span>
            <span style={{
              fontFamily: 'Syne, sans-serif', fontSize: '2rem', fontWeight: 800, color: grade_color,
            }}>{grade}</span>
          </div>
          <p style={{ color: '#8888aa', fontSize: '0.95rem', marginBottom: '1.25rem', lineHeight: 1.6 }}>
            {final_score >= 85 && 'Your resume is highly ATS-compatible. Minor tweaks can push it to perfect.'}
            {final_score >= 70 && final_score < 85 && 'Good foundation. A few targeted improvements will significantly boost your pass rate.'}
            {final_score >= 50 && final_score < 70 && 'Your resume needs key improvements before submitting to ATS-screened jobs.'}
            {final_score < 50 && 'Your resume may be getting rejected by ATS before a human sees it. Follow the suggestions below.'}
          </p>

          {/* Mini score bars */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {Object.entries(categories).map(([key, cat]) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.72rem', color: '#8888aa', width: 140, flexShrink: 0 }}>
                  {cat.label}
                </span>
                <div style={{
                  flex: 1, height: 6, background: 'rgba(255,255,255,0.06)',
                  borderRadius: 100, overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%',
                    width: `${cat.score}%`,
                    background: cat.score >= 70 ? '#4ade80' : cat.score >= 45 ? '#fbbf24' : '#f87171',
                    borderRadius: 100,
                    transition: 'width 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  }} />
                </div>
                <span style={{ fontSize: '0.75rem', color: '#a0a0c0', width: 30, textAlign: 'right' }}>
                  {cat.score}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Issues summary */}
      {all_issues.length > 0 && (
        <div style={{
          background: 'rgba(248,113,113,0.05)',
          border: '1px solid rgba(248,113,113,0.2)',
          borderRadius: 16, padding: '1.25rem 1.5rem',
          marginBottom: '1.5rem',
        }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.75rem', color: '#f87171', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            ⚠️ Issues Found ({all_issues.length})
          </h3>
          <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {all_issues.map((issue, i) => (
              <li key={i} style={{ color: '#f0a0a0', fontSize: '0.875rem' }}>{issue}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Category breakdown */}
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>
        Detailed Breakdown
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {Object.entries(categories).map(([key, cat], i) => (
          <CategoryCard key={key} category={cat} index={i} />
        ))}
      </div>

      {/* Suggestions */}
      {all_suggestions.length > 0 && (
        <div style={{
          background: 'rgba(99,179,237,0.05)',
          border: '1px solid rgba(99,179,237,0.2)',
          borderRadius: 16, padding: '1.5rem',
          marginBottom: '2rem',
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: '#63b3ed', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            💡 Top Improvements to Make
          </h3>
          <ol style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {all_suggestions.map((s, i) => (
              <li key={i} style={{ color: '#a0c8e8', fontSize: '0.9rem', lineHeight: 1.5 }}>{s}</li>
            ))}
          </ol>
        </div>
      )}

      {/* Reset */}
      <div style={{ textAlign: 'center', paddingBottom: '2rem' }}>
        <button
          onClick={onReset}
          style={{
            background: 'linear-gradient(135deg, #63b3ed, #a78bfa)',
            border: 'none', borderRadius: 14,
            padding: '0.875rem 2.5rem', color: '#fff',
            fontSize: '1rem', fontWeight: 600,
            cursor: 'pointer', fontFamily: 'Syne, sans-serif',
          }}
        >
          Check Another Resume
        </button>
        <p style={{ color: '#666688', fontSize: '0.8rem', marginTop: '1rem' }}>
          🔒 Your file was deleted immediately after analysis. Nothing is stored.
        </p>
      </div>
    </div>
  )
}

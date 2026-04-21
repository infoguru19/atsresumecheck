import { useEffect, useRef, useState } from 'react'

const categoryIcons = {
  'Contact Information': '📞',
  'Resume Sections': '📋',
  'Keywords & Skills': '🔑',
  'ATS Formatting': '📐',
  'Quantified Achievements': '📈',
}

function getColor(score) {
  if (score >= 70) return '#4ade80'
  if (score >= 45) return '#fbbf24'
  return '#f87171'
}

export default function CategoryCard({ category, index }) {
  const [barWidth, setBarWidth] = useState(0)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setBarWidth(category.score), index * 100)
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [category.score, index])

  const color = getColor(category.score)
  const icon = categoryIcons[category.label] || '📌'

  return (
    <div ref={ref} style={{
      background: 'var(--bg2)',
      border: '1px solid var(--border)',
      borderRadius: 18, padding: '1.5rem',
      boxShadow: 'var(--card-shadow)',
      transition: 'border-color 0.2s',
    }}
      onMouseOver={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'}
      onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontSize: 22 }}>{icon}</span>
          <div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: '0.9rem' }}>
              {category.label}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#8888aa' }}>Weight: {category.weight}%</div>
          </div>
        </div>
        <div style={{
          fontFamily: 'Syne, sans-serif', fontSize: '1.5rem', fontWeight: 800, color,
        }}>
          {category.score}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{
        height: 8, background: 'rgba(255,255,255,0.06)',
        borderRadius: 100, overflow: 'hidden', marginBottom: '1rem',
      }}>
        <div style={{
          height: '100%',
          width: `${barWidth}%`,
          background: `linear-gradient(90deg, ${color}88, ${color})`,
          borderRadius: 100,
          transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: `0 0 8px ${color}44`,
        }} />
      </div>

      {/* Details */}
      {category.label === 'Keywords & Skills' && (
        <div style={{ marginBottom: '0.75rem' }}>
          <div style={{ fontSize: '0.75rem', color: '#8888aa', marginBottom: '0.4rem' }}>
            Tech keywords found ({category.tech_count}):
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
            {(category.tech_keywords_found || []).slice(0, 12).map(kw => (
              <span key={kw} style={{
                background: 'rgba(74,222,128,0.1)',
                border: '1px solid rgba(74,222,128,0.2)',
                borderRadius: 100, padding: '0.15rem 0.6rem',
                fontSize: '0.7rem', color: '#4ade80',
              }}>{kw}</span>
            ))}
            {(category.tech_keywords_found || []).length > 12 && (
              <span style={{ fontSize: '0.7rem', color: '#8888aa', alignSelf: 'center' }}>
                +{category.tech_keywords_found.length - 12} more
              </span>
            )}
          </div>
        </div>
      )}

      {category.label === 'Resume Sections' && category.found && (
        <div style={{ marginBottom: '0.75rem' }}>
          <div style={{ fontSize: '0.75rem', color: '#8888aa', marginBottom: '0.4rem' }}>Section detection:</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
            {Object.entries(category.found).map(([sec, found]) => (
              <span key={sec} style={{
                background: found ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)',
                border: `1px solid ${found ? 'rgba(74,222,128,0.25)' : 'rgba(248,113,113,0.25)'}`,
                borderRadius: 100, padding: '0.15rem 0.6rem',
                fontSize: '0.7rem', color: found ? '#4ade80' : '#f87171',
              }}>
                {found ? '✓' : '✗'} {sec}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Issues */}
      {category.issues?.length > 0 && (
        <div style={{ marginBottom: '0.5rem' }}>
          {category.issues.map((issue, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: '0.4rem',
              fontSize: '0.8rem', color: '#f0a0a0', marginBottom: '0.3rem',
            }}>
              <span style={{ flexShrink: 0, marginTop: 2 }}>⚠</span>
              {issue}
            </div>
          ))}
        </div>
      )}

      {/* Top suggestion */}
      {category.suggestions?.[0] && (
        <div style={{
          background: 'rgba(99,179,237,0.06)',
          border: '1px solid rgba(99,179,237,0.15)',
          borderRadius: 10, padding: '0.6rem 0.75rem',
          fontSize: '0.78rem', color: '#a0c8e8', lineHeight: 1.5,
        }}>
          💡 {category.suggestions[0]}
        </div>
      )}
    </div>
  )
}

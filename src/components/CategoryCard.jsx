import { useEffect, useRef, useState } from 'react'

const CAT_META = {
  'Contact Information':     { icon: '📞', accent: '#fb7185' },
  'Resume Sections':         { icon: '📋', accent: '#a3e635' },
  'Keywords & Skills':       { icon: '🔑', accent: '#f5a623' },
  'ATS Formatting':          { icon: '📐', accent: '#2dd4bf' },
  'Quantified Achievements': { icon: '📈', accent: '#818cf8' },
}

function scoreColor(s) {
  if (s >= 70) return '#a3e635'
  if (s >= 45) return '#f5a623'
  return '#fb7185'
}

export default function CategoryCard({ category, index }) {
  const [barW, setBarW] = useState(0)
  const ref = useRef(null)

  useEffect(() => {
    const ob = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setTimeout(() => setBarW(category.score), index * 80)
        ob.disconnect()
      }
    }, { threshold: 0.2 })
    if (ref.current) ob.observe(ref.current)
    return () => ob.disconnect()
  }, [category.score, index])

  const meta  = CAT_META[category.label] || { icon: '📌', accent: '#7070a0' }
  const color = scoreColor(category.score)

  return (
    <div ref={ref} className="card" style={{ padding: '1.4rem' }}>

      {/* Head */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 9, flexShrink: 0,
            background: `${meta.accent}18`,
            border: `1px solid ${meta.accent}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17,
          }}>{meta.icon}</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.875rem', lineHeight: 1.2 }}>{category.label}</div>
            <div style={{ fontSize: '0.68rem', color: '#4a4a70', marginTop: 2 }}>Weight: {category.weight}%</div>
          </div>
        </div>
        <div style={{ fontFamily: 'Fraunces, serif', fontSize: '1.6rem', fontWeight: 700, color, lineHeight: 1 }}>
          {category.score}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 99, overflow: 'hidden', marginBottom: '1rem' }}>
        <div style={{
          height: '100%', width: `${barW}%`,
          background: `linear-gradient(90deg, ${color}88, ${color})`,
          borderRadius: 99,
          transition: 'width 1.1s cubic-bezier(0.16,1,0.3,1)',
          boxShadow: `0 0 6px ${color}44`,
        }} />
      </div>

      {/* Keywords found */}
      {category.label === 'Keywords & Skills' && (category.tech_keywords_found?.length > 0) && (
        <div style={{ marginBottom: '0.75rem' }}>
          <div style={{ fontSize: '0.7rem', color: '#4a4a70', marginBottom: '0.4rem' }}>
            Found ({category.tech_count}):
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
            {category.tech_keywords_found.slice(0, 14).map(kw => (
              <span key={kw} style={{
                background: 'rgba(163,230,53,0.1)', border: '1px solid rgba(163,230,53,0.2)',
                borderRadius: 99, padding: '0.1rem 0.55rem',
                fontSize: '0.68rem', color: '#a3e635',
              }}>{kw}</span>
            ))}
            {category.tech_keywords_found.length > 14 && (
              <span style={{ fontSize: '0.68rem', color: '#4a4a70', alignSelf: 'center' }}>
                +{category.tech_keywords_found.length - 14} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Section detection */}
      {category.label === 'Resume Sections' && category.found && (
        <div style={{ marginBottom: '0.75rem' }}>
          <div style={{ fontSize: '0.7rem', color: '#4a4a70', marginBottom: '0.4rem' }}>Section detection:</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
            {Object.entries(category.found).map(([sec, ok]) => (
              <span key={sec} style={{
                background: ok ? 'rgba(163,230,53,0.1)' : 'rgba(251,113,133,0.1)',
                border: `1px solid ${ok ? 'rgba(163,230,53,0.25)' : 'rgba(251,113,133,0.25)'}`,
                borderRadius: 99, padding: '0.1rem 0.55rem',
                fontSize: '0.68rem', color: ok ? '#a3e635' : '#fb7185',
              }}>{ok ? '✓' : '✗'} {sec}</span>
            ))}
          </div>
        </div>
      )}

      {/* Issues */}
      {category.issues?.length > 0 && (
        <div style={{ marginBottom: '0.6rem' }}>
          {category.issues.map((issue, i) => (
            <div key={i} style={{
              display: 'flex', gap: '0.4rem',
              fontSize: '0.775rem', color: '#e87878', marginBottom: '0.25rem',
            }}>
              <span style={{ flexShrink: 0, opacity: 0.7, marginTop: 1 }}>▸</span>
              {issue}
            </div>
          ))}
        </div>
      )}

      {/* Top suggestion */}
      {category.suggestions?.[0] && (
        <div style={{
          background: `${meta.accent}0d`,
          border: `1px solid ${meta.accent}20`,
          borderRadius: 'var(--radius-sm)', padding: '0.6rem 0.8rem',
          fontSize: '0.775rem', color: '#a0b0c8', lineHeight: 1.55,
        }}>
          💡 {category.suggestions[0]}
        </div>
      )}
    </div>
  )
}

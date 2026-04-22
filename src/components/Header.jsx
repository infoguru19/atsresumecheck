import { useState, useEffect } from 'react'

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 100,
      borderBottom: `1px solid ${scrolled ? 'rgba(255,255,255,0.08)' : 'transparent'}`,
      background: scrolled ? 'rgba(13,13,15,0.92)' : 'transparent',
      backdropFilter: scrolled ? 'blur(16px)' : 'none',
      padding: '1.1rem 2rem',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      transition: 'all 0.3s ease',
    }}>
      {/* Logo */}
      <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none' }}>
        <div style={{
          width: 34, height: 34, borderRadius: 10,
          background: 'linear-gradient(135deg, #f5a623, #2dd4bf)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, fontWeight: 700, color: '#0d0d0f',
          flexShrink: 0,
        }}>✓</div>
        <div>
          <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: '1rem', color: '#e8e8f0', lineHeight: 1.1 }}>
            ATS Resume Check
          </div>
          <div style={{ fontSize: '0.65rem', color: '#7070a0', letterSpacing: '0.04em' }}>
            FREE ATS ANALYZER
          </div>
        </div>
      </a>

      {/* Nav */}
      <nav style={{ display: 'flex', gap: '1.75rem', alignItems: 'center' }}>
        {[['#how-it-works', 'How it works'], ['#faq', 'FAQ']].map(([href, label]) => (
          <a key={href} href={href} style={{
            color: '#7070a0', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500,
            transition: 'color 0.2s',
          }}
            onMouseOver={e => e.target.style.color = '#e8e8f0'}
            onMouseOut={e => e.target.style.color = '#7070a0'}
          >{label}</a>
        ))}
      </nav>
    </header>
  )
}

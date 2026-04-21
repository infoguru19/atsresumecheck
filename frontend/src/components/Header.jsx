export default function Header() {
  return (
    <header style={{
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      padding: '1.25rem 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: 'rgba(10,10,15,0.95)',
      backdropFilter: 'blur(12px)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'linear-gradient(135deg, #63b3ed, #a78bfa)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18,
        }}>✓</div>
        <div>
          <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#f0f0f8' }}>
            ATS Resume Check
          </div>
          <div style={{ fontSize: '0.7rem', color: '#8888aa', marginTop: '-2px' }}>
            Free ATS Score Analyzer
          </div>
        </div>
      </div>

      <nav style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        <a href="#how-it-works" style={{ color: '#8888aa', textDecoration: 'none', fontSize: '0.875rem', transition: 'color 0.2s' }}
          onMouseOver={e => e.target.style.color = '#f0f0f8'}
          onMouseOut={e => e.target.style.color = '#8888aa'}>
          How it works
        </a>
        <a href="#faq" style={{ color: '#8888aa', textDecoration: 'none', fontSize: '0.875rem', transition: 'color 0.2s' }}
          onMouseOver={e => e.target.style.color = '#f0f0f8'}
          onMouseOut={e => e.target.style.color = '#8888aa'}>
          FAQ
        </a>
      </nav>
    </header>
  )
}

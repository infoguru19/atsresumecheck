import { useState, useEffect } from 'react'

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: scrolled ? 'rgba(255,255,255,0.92)' : 'transparent',
      backdropFilter: scrolled ? 'blur(16px)' : 'none',
      borderBottom: scrolled ? '1px solid #e8ecf4' : '1px solid transparent',
      padding: '1rem 2.5rem',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      transition: 'all 0.3s ease',
    }}>
      <a href="/" style={{ display:'flex', alignItems:'center', gap:'0.6rem', textDecoration:'none' }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'linear-gradient(135deg, #2fc89a, #57cda4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 17, color: '#fff', fontWeight: 700, flexShrink: 0,
          boxShadow: '0 2px 8px rgba(47,200,154,0.35)',
        }}>✓</div>
        <div>
          <div style={{ fontFamily:'Fraunces,serif', fontWeight:700, fontSize:'1rem', color:'#1a2332', lineHeight:1.1 }}>
            ATS Resume Check
          </div>
          <div style={{ fontSize:'0.62rem', color:'#8896a8', letterSpacing:'0.06em', textTransform:'uppercase' }}>
            Free ATS Analyzer
          </div>
        </div>
      </a>
      <nav style={{ display:'flex', gap:'1.75rem', alignItems:'center' }}>
        {[['#how-it-works','How it works'],['#faq','FAQ']].map(([href,label])=>(
          <a key={href} href={href} style={{ color:'#8896a8', fontSize:'0.875rem', fontWeight:500, transition:'color 0.2s' }}
            onMouseOver={e=>e.target.style.color='#1a2332'}
            onMouseOut={e=>e.target.style.color='#8896a8'}
          >{label}</a>
        ))}
      </nav>
    </header>
  )
}

import { useEffect, useRef, useState } from 'react'

const CAT_META = {
  'Contact Information':     { icon:'📞', color:'#ef4444', bg:'#fef2f2' },
  'Resume Sections':         { icon:'📋', color:'#f59e0b', bg:'#fffbeb' },
  'Keywords & Skills':       { icon:'🔑', color:'#2fc89a', bg:'#e6f9f3' },
  'ATS Formatting':          { icon:'📐', color:'#6366f1', bg:'#eef2ff' },
  'Quantified Achievements': { icon:'📈', color:'#8b5cf6', bg:'#f5f3ff' },
}

function barColor(s) {
  if (s >= 70) return '#22c55e'
  if (s >= 45) return '#f59e0b'
  return '#ef4444'
}

export default function CategoryCard({ category, index }) {
  const [bw, setBw] = useState(0)
  const ref = useRef(null)

  useEffect(()=>{
    const ob = new IntersectionObserver(([e])=>{
      if(e.isIntersecting){ setTimeout(()=>setBw(category.score), index*80); ob.disconnect() }
    },{ threshold:0.2 })
    if(ref.current) ob.observe(ref.current)
    return ()=>ob.disconnect()
  },[category.score,index])

  const meta  = CAT_META[category.label] || { icon:'📌', color:'#6366f1', bg:'#eef2ff' }
  const color = barColor(category.score)

  return (
    <div ref={ref} className="card" style={{ padding:'1.4rem', transition:'box-shadow 0.2s, transform 0.2s' }}
      onMouseOver={e=>{ e.currentTarget.style.boxShadow='var(--shadow-lg)'; e.currentTarget.style.transform='translateY(-2px)' }}
      onMouseOut={e=>{ e.currentTarget.style.boxShadow='var(--shadow-md)'; e.currentTarget.style.transform='translateY(0)' }}
    >
      {/* Head */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'1rem' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'0.6rem' }}>
          <div style={{ width:36,height:36,borderRadius:9,flexShrink:0,background:meta.bg,border:`1px solid ${meta.color}25`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:17 }}>
            {meta.icon}
          </div>
          <div>
            <div style={{ fontWeight:600, fontSize:'0.875rem', color:'var(--navy)', lineHeight:1.2 }}>{category.label}</div>
            <div style={{ fontSize:'0.68rem', color:'var(--muted)', marginTop:2 }}>Weight: {category.weight}%</div>
          </div>
        </div>
        <div style={{ fontFamily:'Fraunces,serif', fontSize:'1.6rem', fontWeight:700, color, lineHeight:1 }}>
          {category.score}
        </div>
      </div>

      {/* Bar */}
      <div style={{ height:6, background:'#f0f4f8', borderRadius:99, overflow:'hidden', marginBottom:'1rem' }}>
        <div style={{ height:'100%', width:`${bw}%`, background:color, borderRadius:99, transition:'width 1.1s cubic-bezier(.16,1,.3,1)' }}/>
      </div>

      {/* Keywords */}
      {category.label==='Keywords & Skills' && category.tech_keywords_found?.length > 0 && (
        <div style={{ marginBottom:'0.75rem' }}>
          <div style={{ fontSize:'0.7rem', color:'var(--muted)', marginBottom:'0.4rem' }}>Found ({category.tech_count}):</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:'0.3rem' }}>
            {category.tech_keywords_found.slice(0,14).map(kw=>(
              <span key={kw} style={{ background:'#e6f9f3', border:'1px solid #a7f3d0', borderRadius:99, padding:'0.1rem 0.55rem', fontSize:'0.68rem', color:'#059669', fontWeight:500 }}>{kw}</span>
            ))}
            {category.tech_keywords_found.length > 14 && (
              <span style={{ fontSize:'0.68rem', color:'var(--muted)', alignSelf:'center' }}>+{category.tech_keywords_found.length-14} more</span>
            )}
          </div>
        </div>
      )}

      {/* Sections */}
      {category.label==='Resume Sections' && category.found && (
        <div style={{ marginBottom:'0.75rem' }}>
          <div style={{ fontSize:'0.7rem', color:'var(--muted)', marginBottom:'0.4rem' }}>Section detection:</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:'0.3rem' }}>
            {Object.entries(category.found).map(([s,ok])=>(
              <span key={s} style={{ background: ok?'#f0fdf4':'#fef2f2', border:`1px solid ${ok?'#bbf7d0':'#fecaca'}`, borderRadius:99, padding:'0.1rem 0.55rem', fontSize:'0.68rem', color: ok?'#15803d':'#dc2626', fontWeight:500 }}>
                {ok?'✓':'✗'} {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Issues */}
      {category.issues?.length > 0 && (
        <div style={{ marginBottom:'0.6rem' }}>
          {category.issues.map((issue,i)=>(
            <div key={i} style={{ display:'flex', gap:'0.4rem', fontSize:'0.78rem', color:'#dc2626', marginBottom:'0.25rem' }}>
              <span style={{ flexShrink:0, marginTop:1 }}>▸</span>{issue}
            </div>
          ))}
        </div>
      )}

      {/* Suggestion */}
      {category.suggestions?.[0] && (
        <div style={{ background:meta.bg, border:`1px solid ${meta.color}20`, borderRadius:'var(--radius-sm)', padding:'0.6rem 0.8rem', fontSize:'0.775rem', color:meta.color, lineHeight:1.55, fontWeight:500 }}>
          💡 {category.suggestions[0]}
        </div>
      )}
    </div>
  )
}

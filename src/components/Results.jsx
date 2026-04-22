import { useEffect, useState } from 'react'
import ScoreRing    from './ScoreRing.jsx'
import CategoryCard from './CategoryCard.jsx'

const EMOJI  = { Excellent:'🏆', Good:'✅', Fair:'⚠️', Poor:'❌' }
const GRADE_MSG = {
  Excellent: 'Your resume is highly ATS-compatible. Minor tweaks can push it to perfect.',
  Good:      'Solid foundation. A few targeted improvements will boost your pass rate.',
  Fair:      'Several issues may cause ATS to deprioritize your resume — fix these below.',
  Poor:      'Your resume is likely being rejected before a human sees it. Fix these now.',
}
const GRADE_STYLE = {
  Excellent: { color:'#15803d', bg:'#f0fdf4', border:'#bbf7d0' },
  Good:      { color:'#92400e', bg:'#fffbeb', border:'#fde68a' },
  Fair:      { color:'#c2410c', bg:'#fff7ed', border:'#fed7aa' },
  Poor:      { color:'#dc2626', bg:'#fef2f2', border:'#fecaca' },
}

export default function Results({ result, fileName, onReset }) {
  const [vis, setVis] = useState(false)
  useEffect(()=>{ const t=setTimeout(()=>setVis(true),40); return()=>clearTimeout(t) },[])
  const { final_score, grade, grade_color, categories, all_issues, all_suggestions } = result
  const gs = GRADE_STYLE[grade]

  return (
    <div style={{ maxWidth:880, margin:'0 auto', opacity:vis?1:0, transition:'opacity 0.4s ease' }}>

      {/* Top bar */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.75rem', flexWrap:'wrap', gap:'1rem' }}>
        <div>
          <div style={{ fontSize:'0.72rem', color:'var(--muted)', marginBottom:'0.2rem' }}>
            Analyzed: <span style={{ color:'var(--body)' }}>{fileName}</span>
          </div>
          <h2 style={{ fontFamily:'Fraunces,serif', fontSize:'1.6rem', fontWeight:700, color:'var(--navy)' }}>Your ATS Report</h2>
        </div>
        <button onClick={onReset} style={{
          background:'var(--surface)', border:'1px solid var(--border)',
          borderRadius:'var(--radius-sm)', padding:'0.55rem 1.15rem',
          color:'var(--body)', fontSize:'0.82rem', fontWeight:500,
          transition:'all 0.2s', boxShadow:'var(--shadow-sm)',
        }}
          onMouseOver={e=>{ e.currentTarget.style.borderColor='var(--teal)'; e.currentTarget.style.color='var(--teal)' }}
          onMouseOut={e=>{ e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--body)' }}
        >← Check Another</button>
      </div>

      {/* Score hero */}
      <div className="card fade-up" style={{
        padding:'2.25rem 2rem', marginBottom:'1.25rem',
        display:'flex', alignItems:'center', gap:'2.5rem',
        flexWrap:'wrap', justifyContent:'center',
      }}>
        <ScoreRing score={final_score} color={grade_color}/>
        <div style={{ flex:1, minWidth:220 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:'0.5rem', background:gs.bg, border:`1px solid ${gs.border}`, borderRadius:99, padding:'0.25rem 0.85rem', marginBottom:'0.65rem' }}>
            <span style={{ fontSize:16 }}>{EMOJI[grade]}</span>
            <span style={{ fontFamily:'Fraunces,serif', fontWeight:700, color:gs.color, fontSize:'0.95rem' }}>{grade}</span>
          </div>
          <p style={{ color:'var(--body)', fontSize:'0.9rem', lineHeight:1.7, marginBottom:'1.35rem', maxWidth:380 }}>
            {GRADE_MSG[grade]}
          </p>
          {/* Mini bars */}
          <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
            {Object.entries(categories).map(([k,cat])=>{
              const c = cat.score>=70?'#22c55e':cat.score>=45?'#f59e0b':'#ef4444'
              return (
                <div key={k} style={{ display:'flex', alignItems:'center', gap:'0.65rem' }}>
                  <span style={{ fontSize:'0.7rem', color:'var(--muted)', width:150, flexShrink:0 }}>{cat.label}</span>
                  <div style={{ flex:1, height:5, background:'#f0f4f8', borderRadius:99, overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${cat.score}%`, background:c, borderRadius:99, transition:'width 1.4s cubic-bezier(.16,1,.3,1)' }}/>
                  </div>
                  <span style={{ fontSize:'0.72rem', color:'var(--muted)', width:26, textAlign:'right' }}>{cat.score}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Issues banner */}
      {all_issues.length > 0 && (
        <div className="fade-up-1" style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:'var(--radius-md)', padding:'1.1rem 1.4rem', marginBottom:'1.25rem' }}>
          <div style={{ fontSize:'0.8rem', fontWeight:600, color:'#dc2626', marginBottom:'0.6rem' }}>
            ⚠️ {all_issues.length} Issue{all_issues.length>1?'s':''} Found
          </div>
          <ul style={{ paddingLeft:'1.15rem', display:'flex', flexDirection:'column', gap:'0.3rem' }}>
            {all_issues.map((issue,i)=><li key={i} style={{ color:'#b91c1c', fontSize:'0.825rem' }}>{issue}</li>)}
          </ul>
        </div>
      )}

      {/* Cards */}
      <h3 className="fade-up-2" style={{ fontFamily:'Fraunces,serif', fontSize:'1.15rem', fontWeight:700, marginBottom:'1rem', color:'var(--navy)' }}>
        Detailed Breakdown
      </h3>
      <div className="fade-up-2" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(320px,1fr))', gap:'1rem', marginBottom:'1.5rem' }}>
        {Object.entries(categories).map(([k,cat],i)=><CategoryCard key={k} category={cat} index={i}/>)}
      </div>

      {/* Suggestions */}
      {all_suggestions.length > 0 && (
        <div className="fade-up-3" style={{ background:'#e6f9f3', border:'1px solid #a7f3d0', borderRadius:'var(--radius-md)', padding:'1.5rem', marginBottom:'2rem' }}>
          <div style={{ fontSize:'0.8rem', fontWeight:700, color:'#047857', marginBottom:'1rem' }}>
            💡 Top Improvements to Make
          </div>
          <ol style={{ paddingLeft:'1.2rem', display:'flex', flexDirection:'column', gap:'0.6rem' }}>
            {all_suggestions.map((s,i)=><li key={i} style={{ color:'#065f46', fontSize:'0.875rem', lineHeight:1.6 }}>{s}</li>)}
          </ol>
        </div>
      )}

      <div style={{ textAlign:'center', paddingBottom:'3rem' }}>
        <button onClick={onReset} style={{
          background:'var(--teal)', border:'none', borderRadius:'var(--radius-sm)',
          padding:'0.875rem 2.5rem', color:'#fff', fontSize:'0.95rem', fontWeight:700,
          boxShadow:'0 4px 14px rgba(47,200,154,0.4)',
          transition:'transform 0.15s, box-shadow 0.15s',
        }}
          onMouseOver={e=>{ e.currentTarget.style.transform='translateY(-1px)'; e.currentTarget.style.boxShadow='0 6px 20px rgba(47,200,154,0.45)' }}
          onMouseOut={e=>{ e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 4px 14px rgba(47,200,154,0.4)' }}
        >Check Another Resume</button>
        <p style={{ color:'var(--dim)', fontSize:'0.75rem', marginTop:'0.85rem' }}>
          🔒 Your file was permanently deleted immediately after analysis.
        </p>
      </div>
    </div>
  )
}

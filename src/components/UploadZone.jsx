import { useState, useRef, useCallback } from 'react'

const ALLOWED = ['application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword']
const fmt = b => b < 1048576 ? (b/1024).toFixed(0)+' KB' : (b/1048576).toFixed(1)+' MB'

export default function UploadZone({ file, loading, error, onSelect, onDelete, onAnalyze }) {
  const [dragging, setDragging] = useState(false)
  const [fileErr, setFileErr]   = useState(null)
  const inputRef = useRef(null)

  const validate = useCallback((f) => {
    setFileErr(null)
    const okType = ALLOWED.includes(f.type) || /\.(pdf|docx|doc)$/i.test(f.name)
    if (!okType)        { setFileErr('Only PDF or DOCX files are supported.'); return }
    if (f.size > 5<<20) { setFileErr('File must be under 5 MB.'); return }
    onSelect(f)
  }, [onSelect])

  const onDrop = useCallback(e => {
    e.preventDefault(); setDragging(false)
    const f = e.dataTransfer.files[0]; if(f) validate(f)
  }, [validate])

  const displayError = fileErr || error

  return (
    <div style={{ maxWidth:660, margin:'0 auto' }}>

      {/* ── Hero ── */}
      <div className="fade-up" style={{ textAlign:'center', marginBottom:'2.75rem' }}>
        <div style={{
          display:'inline-flex', alignItems:'center', gap:'0.45rem',
          background:'var(--teal-light)', border:'1px solid rgba(47,200,154,0.3)',
          borderRadius:99, padding:'0.3rem 0.9rem',
          fontSize:'0.72rem', color:'var(--teal)',
          fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase',
          marginBottom:'1.25rem',
        }}>
          <span style={{ width:6,height:6,borderRadius:'50%',background:'var(--teal)',display:'inline-block' }}/>
          Free · Instant · No Sign-up
        </div>

        <h1 style={{
          fontSize:'clamp(2rem,5vw,3.2rem)', fontWeight:700,
          marginBottom:'1rem', color:'var(--navy)',
          letterSpacing:'-0.02em', lineHeight:1.15,
        }}>
          Is Your Resume Good<br/>
          <em style={{ color:'var(--teal)', fontStyle:'italic' }}>Enough?</em>
        </h1>

        <p style={{ color:'var(--body)', fontSize:'1rem', maxWidth:460, margin:'0 auto', lineHeight:1.75 }}>
          A free and fast ATS resume checker doing crucial checks to ensure your
          resume is ready to get you interview callbacks.
        </p>
      </div>

      {/* ── Drop Zone ── */}
      <div className="fade-up-1"
        style={{
          background: 'var(--surface)',
          border: `2px dashed ${dragging ? 'var(--teal)' : file ? '#22c55e' : '#d0dae8'}`,
          borderRadius: 'var(--radius-xl)', padding:'3rem 2rem', textAlign:'center',
          cursor: file ? 'default' : 'pointer',
          transition:'all 0.25s cubic-bezier(0.16,1,0.3,1)',
          transform: dragging ? 'scale(1.012)' : 'scale(1)',
          boxShadow: dragging
            ? '0 0 0 4px rgba(47,200,154,0.15), var(--shadow-lg)'
            : 'var(--shadow-md)',
        }}
        onDrop={onDrop}
        onDragOver={e=>{ e.preventDefault(); setDragging(true) }}
        onDragLeave={()=>setDragging(false)}
        onClick={()=>!file && inputRef.current?.click()}
      >
        <input ref={inputRef} type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          style={{ display:'none' }}
          onChange={e=>e.target.files[0] && validate(e.target.files[0])}
        />

        {!file ? (
          <>
            <div style={{
              width:72, height:72, borderRadius:20, margin:'0 auto 1.25rem',
              background:'linear-gradient(135deg,rgba(47,200,154,0.1),rgba(87,205,164,0.15))',
              border:'1px solid rgba(47,200,154,0.2)',
              display:'flex', alignItems:'center', justifyContent:'center', fontSize:32,
            }}>📄</div>

            <p style={{ fontFamily:'Fraunces,serif', fontSize:'1.2rem', fontWeight:600, color:'var(--navy)', marginBottom:'0.4rem' }}>
              {dragging ? 'Release to upload' : 'Drop your resume here'}
            </p>
            <p style={{ color:'var(--muted)', fontSize:'0.875rem', marginBottom:'1.75rem' }}>
              or click to browse &nbsp;·&nbsp; PDF or DOCX &nbsp;·&nbsp; max 5 MB
            </p>

            <button style={{
              background:'var(--teal)', border:'none', borderRadius:12,
              padding:'0.8rem 2.25rem', color:'#fff',
              fontSize:'0.9rem', fontWeight:700,
              boxShadow:'0 4px 14px rgba(47,200,154,0.4)',
              transition:'transform 0.15s, box-shadow 0.15s',
            }}
              onMouseOver={e=>{ e.currentTarget.style.transform='translateY(-1px)'; e.currentTarget.style.boxShadow='0 6px 20px rgba(47,200,154,0.45)' }}
              onMouseOut={e=>{ e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 4px 14px rgba(47,200,154,0.4)' }}
            >Upload Your Resume</button>
          </>
        ) : (
          <div style={{ animation:'fadeUp 0.3s ease both' }}>
            <div style={{
              width:72, height:72, borderRadius:20, margin:'0 auto 1rem',
              background:'#f0fdf4', border:'1px solid #bbf7d0',
              display:'flex', alignItems:'center', justifyContent:'center', fontSize:32,
            }}>
              {file.name.endsWith('.pdf') ? '📕' : '📘'}
            </div>
            <p style={{ fontFamily:'Fraunces,serif', fontSize:'1.1rem', fontWeight:600, color:'var(--navy)', marginBottom:'0.25rem' }}>
              {file.name}
            </p>
            <p style={{ color:'var(--muted)', fontSize:'0.8rem', marginBottom:'1.75rem' }}>
              {fmt(file.size)} · Ready to analyze
            </p>
            <div style={{ display:'flex', gap:'0.75rem', justifyContent:'center', flexWrap:'wrap' }}>
              <button
                onClick={e=>{ e.stopPropagation(); onAnalyze() }}
                disabled={loading}
                style={{
                  background: loading ? '#e8ecf4' : 'var(--teal)',
                  border:'none', borderRadius:12, padding:'0.8rem 2rem',
                  color: loading ? 'var(--muted)' : '#fff',
                  fontSize:'0.9rem', fontWeight:700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: loading ? 'none' : '0 4px 14px rgba(47,200,154,0.35)',
                  display:'flex', alignItems:'center', gap:'0.5rem',
                  transition:'all 0.2s',
                }}
              >
                {loading ? (
                  <>
                    <span style={{ width:15,height:15,border:'2px solid #b0bec8',borderTopColor:'#8896a8',borderRadius:'50%',animation:'spin 0.7s linear infinite',display:'inline-block' }}/>
                    Analyzing…
                  </>
                ) : '🔍  Analyze My Resume'}
              </button>
              <button
                onClick={e=>{ e.stopPropagation(); onDelete() }}
                disabled={loading}
                style={{
                  background:'var(--red-bg)', border:'1px solid #fecaca',
                  borderRadius:12, padding:'0.8rem 1.5rem',
                  color:'#ef4444', fontSize:'0.875rem', fontWeight:600,
                  cursor:'pointer', transition:'background 0.2s',
                }}
                onMouseOver={e=>e.currentTarget.style.background='#fee2e2'}
                onMouseOut={e=>e.currentTarget.style.background='var(--red-bg)'}
              >🗑  Delete</button>
            </div>
          </div>
        )}
      </div>

      {displayError && (
        <div className="fade-up" style={{
          marginTop:'1rem', background:'var(--red-bg)', border:'1px solid #fecaca',
          borderRadius:'var(--radius-sm)', padding:'0.85rem 1.1rem',
          color:'#dc2626', fontSize:'0.875rem', display:'flex', alignItems:'center', gap:'0.5rem',
        }}>⚠️ {displayError}</div>
      )}

      <div className="fade-up-2" style={{
        marginTop:'1.25rem', textAlign:'center',
        color:'#1a2332', fontSize:'0.78rem',
        display:'flex', alignItems:'center', justifyContent:'center', gap:'0.4rem',
      }}>
        <span>🔒</span>
        Privacy guaranteed — your resume is deleted immediately after analysis, never stored.
      </div>

      {/* ── How It Works ── */}
      <div id="how-it-works" style={{ marginTop:'5rem' }}>
        <p className="fade-up-3" style={{ textAlign:'center', fontSize:'0.7rem', color:'var(--teal)', letterSpacing:'0.1em', textTransform:'uppercase', fontWeight:700, marginBottom:'0.5rem' }}>The Process</p>
        <h2 className="fade-up-3" style={{ textAlign:'center', fontFamily:'Fraunces,serif', fontSize:'clamp(1.5rem,3vw,2rem)', fontWeight:700, marginBottom:'2rem', color:'var(--navy)' }}>How It Works</h2>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:'1rem' }}>
          {[
            { icon:'📤', n:'01', title:'Upload', desc:'Drop your PDF or DOCX — up to 5 MB' },
            { icon:'⚙️', n:'02', title:'Analyze', desc:'5 ATS parameters checked instantly' },
            { icon:'📊', n:'03', title:'Score', desc:'Weighted % with full breakdown' },
            { icon:'✏️', n:'04', title:'Improve', desc:'Prioritized list of actionable fixes' },
          ].map(({icon,n,title,desc})=>(
            <div key={n} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--radius-md)', padding:'1.5rem 1.25rem', textAlign:'center', boxShadow:'var(--shadow-sm)' }}>
              <div style={{ fontSize:28, marginBottom:'0.75rem' }}>{icon}</div>
              <div style={{ width:24,height:24,background:'var(--teal-light)',border:'1px solid rgba(47,200,154,0.3)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.65rem',fontWeight:700,color:'var(--teal)',margin:'0 auto 0.5rem' }}>{n}</div>
              <div style={{ fontFamily:'Fraunces,serif', fontWeight:600, fontSize:'0.9rem', color:'var(--navy)', marginBottom:'0.3rem' }}>{title}</div>
              <div style={{ color:'var(--muted)', fontSize:'0.78rem', lineHeight:1.55 }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Scoring Parameters ── */}
      <div style={{ marginTop:'4rem' }}>
        <p style={{ textAlign:'center', fontSize:'0.7rem', color:'var(--teal)', letterSpacing:'0.1em', textTransform:'uppercase', fontWeight:700, marginBottom:'0.5rem' }}>What We Check</p>
        <h2 style={{ textAlign:'center', fontFamily:'Fraunces,serif', fontSize:'clamp(1.5rem,3vw,2rem)', fontWeight:700, marginBottom:'2rem', color:'var(--navy)' }}>ATS Scoring Parameters</h2>
        <div style={{ display:'flex', flexDirection:'column', gap:'0.65rem' }}>
          {[
            { label:'Keywords & Skills',       weight:35, color:'#2fc89a', bg:'#e6f9f3', desc:'200+ in-demand tech keywords + action verbs' },
            { label:'ATS Formatting',           weight:20, color:'#6366f1', bg:'#eef2ff', desc:'Bullet points, no emojis, ideal 1–2 page length' },
            { label:'Resume Sections',          weight:20, color:'#f59e0b', bg:'#fffbeb', desc:'Experience, Education, Skills, Summary headers' },
            { label:'Contact Information',      weight:15, color:'#ef4444', bg:'#fef2f2', desc:'Email, phone, LinkedIn, GitHub presence' },
            { label:'Quantified Achievements',  weight:10, color:'#8b5cf6', bg:'#f5f3ff', desc:'Numbers, percentages, and measurable results' },
          ].map(({label,weight,color,bg,desc})=>(
            <div key={label} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--radius-md)', padding:'1rem 1.25rem', display:'flex', alignItems:'center', gap:'1rem', boxShadow:'var(--shadow-sm)' }}>
              <div style={{ width:44,height:44,borderRadius:10,flexShrink:0,background:bg,border:`1px solid ${color}30`,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Fraunces,serif',fontSize:'1rem',fontWeight:700,color }}>{weight}%</div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:600, fontSize:'0.875rem', color:'var(--navy)', marginBottom:'0.15rem' }}>{label}</div>
                <div style={{ color:'var(--muted)', fontSize:'0.78rem' }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

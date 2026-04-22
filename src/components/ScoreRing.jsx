import { useEffect, useState } from 'react'

export default function ScoreRing({ score, color, size = 160 }) {
  const [display,  setDisplay]  = useState(0)
  const [progress, setProgress] = useState(0)
  const sw = 13, r = (size-sw)/2, circ = 2*Math.PI*r

  useEffect(()=>{
    let f=0, total=65
    const id = setInterval(()=>{
      f++
      const ease = 1-Math.pow(1-f/total,3)
      setDisplay(Math.round(score*ease))
      setProgress(score*ease)
      if(f>=total) clearInterval(id)
    },14)
    return ()=>clearInterval(id)
  },[score])

  return (
    <div style={{ position:'relative', width:size, height:size, flexShrink:0 }}>
      <svg width={size} height={size} style={{ transform:'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f0f4f8" strokeWidth={sw}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={sw}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ-(progress/100)*circ}
          style={{ transition:'stroke-dashoffset 0.04s linear', filter:`drop-shadow(0 0 6px ${color}55)` }}
        />
      </svg>
      <div style={{ position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center' }}>
        <span style={{ fontFamily:'Fraunces,serif', fontSize:'2.5rem', fontWeight:700, color, lineHeight:1 }}>{display}</span>
        <span style={{ fontSize:'0.75rem', color:'var(--muted)', marginTop:2 }}>out of 100</span>
      </div>
    </div>
  )
}

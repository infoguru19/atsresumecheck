import { useEffect, useState } from 'react'

export default function ScoreRing({ score, color, size = 170 }) {
  const [display,  setDisplay]  = useState(0)
  const [progress, setProgress] = useState(0)

  const sw   = 13
  const r    = (size - sw) / 2
  const circ = 2 * Math.PI * r

  useEffect(() => {
    let frame = 0
    const total = 70
    const id = setInterval(() => {
      frame++
      const ease = 1 - Math.pow(1 - frame / total, 3)
      setDisplay(Math.round(score * ease))
      setProgress(score * ease)
      if (frame >= total) clearInterval(id)
    }, 14)
    return () => clearInterval(id)
  }, [score])

  const offset = circ - (progress / 100) * circ

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Track */}
        <circle cx={size/2} cy={size/2} r={r}
          fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={sw} />
        {/* Progress */}
        <circle cx={size/2} cy={size/2} r={r}
          fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          style={{
            transition: 'stroke-dashoffset 0.04s linear',
            filter: `drop-shadow(0 0 10px ${color}55)`,
          }}
        />
      </svg>

      {/* Label */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{
          fontFamily: 'Fraunces, serif',
          fontSize: '2.75rem', fontWeight: 700, color, lineHeight: 1,
        }}>{display}</span>
        <span style={{ fontSize: '0.78rem', color: '#4a4a70', marginTop: 2 }}>out of 100</span>
      </div>
    </div>
  )
}

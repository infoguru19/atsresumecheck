import { useEffect, useState } from 'react'

export default function ScoreRing({ score, color }) {
  const [displayScore, setDisplayScore] = useState(0)
  const [progress, setProgress] = useState(0)

  const size = 160
  const strokeWidth = 14
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  useEffect(() => {
    // Animate number count
    let frame = 0
    const totalFrames = 60
    const timer = setInterval(() => {
      frame++
      const eased = 1 - Math.pow(1 - frame / totalFrames, 3) // ease-out cubic
      setDisplayScore(Math.round(score * eased))
      setProgress(score * eased)
      if (frame >= totalFrames) clearInterval(timer)
    }, 16)
    return () => clearInterval(timer)
  }, [score])

  const dashOffset = circumference - (progress / 100) * circumference

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Background track */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: 'stroke-dashoffset 0.05s linear', filter: `drop-shadow(0 0 8px ${color}66)` }}
        />
      </svg>
      {/* Center text */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{
          fontFamily: 'Syne, sans-serif',
          fontSize: '2.5rem', fontWeight: 800,
          color: color, lineHeight: 1,
        }}>
          {displayScore}
        </span>
        <span style={{ fontSize: '0.85rem', color: '#8888aa', fontWeight: 500 }}>/ 100</span>
      </div>
    </div>
  )
}

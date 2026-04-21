import { useState, useRef, useCallback } from 'react'

const MAX_SIZE = 5 * 1024 * 1024

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

export default function UploadZone({ file, loading, error, onFileSelect, onDelete, onAnalyze }) {
  const [dragging, setDragging] = useState(false)
  const [fileError, setFileError] = useState(null)
  const inputRef = useRef(null)

  const validateAndSelect = (f) => {
    setFileError(null)
    const allowed = ['application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword']
    if (!allowed.includes(f.type)) {
      setFileError('Only PDF and DOCX files are supported.')
      return
    }
    if (f.size > MAX_SIZE) {
      setFileError('File must be under 5MB.')
      return
    }
    onFileSelect(f)
  }

  const onDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) validateAndSelect(f)
  }, [])

  const onDragOver = (e) => { e.preventDefault(); setDragging(true) }
  const onDragLeave = () => setDragging(false)

  const displayError = fileError || error

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>

      {/* Hero */}
      <div className="fade-up" style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div style={{
          display: 'inline-block',
          background: 'linear-gradient(135deg, rgba(99,179,237,0.15), rgba(167,139,250,0.15))',
          border: '1px solid rgba(99,179,237,0.25)',
          borderRadius: 100,
          padding: '0.35rem 1rem',
          fontSize: '0.75rem',
          color: '#63b3ed',
          marginBottom: '1.25rem',
          fontFamily: 'Syne, sans-serif',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
        }}>
          Free · Instant · No Sign-up Required
        </div>
        <h1 style={{
          fontSize: 'clamp(2rem, 5vw, 3.25rem)',
          fontWeight: 800,
          marginBottom: '1rem',
          background: 'linear-gradient(135deg, #f0f0f8 0%, #a78bfa 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Check Your ATS Score<br/>Instantly
        </h1>
        <p style={{ color: '#8888aa', fontSize: '1.05rem', maxWidth: 480, margin: '0 auto' }}>
          Upload your resume and get a detailed ATS compatibility score with actionable improvements.
          Your file is never stored.
        </p>
      </div>

      {/* Upload card */}
      <div className="fade-up-delay-1" style={{
        background: 'var(--bg2)',
        border: `2px dashed ${dragging ? 'var(--accent)' : file ? 'rgba(74,222,128,0.4)' : 'var(--border)'}`,
        borderRadius: 20,
        padding: '3rem 2rem',
        textAlign: 'center',
        cursor: file ? 'default' : 'pointer',
        transition: 'all 0.25s',
        transform: dragging ? 'scale(1.01)' : 'scale(1)',
        boxShadow: dragging ? '0 0 40px rgba(99,179,237,0.1)' : 'var(--card-shadow)',
      }}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => !file && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          style={{ display: 'none' }}
          onChange={(e) => e.target.files[0] && validateAndSelect(e.target.files[0])}
        />

        {!file ? (
          <>
            <div style={{ fontSize: 52, marginBottom: '1rem' }}>📄</div>
            <p style={{ fontSize: '1.1rem', fontWeight: 600, color: '#f0f0f8', marginBottom: '0.5rem' }}>
              {dragging ? 'Drop your resume here' : 'Drag & drop your resume'}
            </p>
            <p style={{ color: '#8888aa', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              or click to browse — PDF or DOCX, up to 5MB
            </p>
            <button style={{
              background: 'linear-gradient(135deg, #63b3ed, #a78bfa)',
              border: 'none',
              borderRadius: 12,
              padding: '0.75rem 2rem',
              color: '#fff',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'Syne, sans-serif',
            }}>
              Choose File
            </button>
          </>
        ) : (
          <div style={{ animation: 'fadeUp 0.3s ease' }}>
            <div style={{ fontSize: 48, marginBottom: '0.75rem' }}>
              {file.name.endsWith('.pdf') ? '📕' : '📘'}
            </div>
            <p style={{ fontWeight: 600, color: '#f0f0f8', marginBottom: '0.25rem', fontSize: '1.05rem' }}>
              {file.name}
            </p>
            <p style={{ color: '#8888aa', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              {formatBytes(file.size)}
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={(e) => { e.stopPropagation(); onAnalyze() }}
                disabled={loading}
                style={{
                  background: loading ? '#333' : 'linear-gradient(135deg, #63b3ed, #a78bfa)',
                  border: 'none', borderRadius: 12,
                  padding: '0.75rem 2rem', color: '#fff',
                  fontSize: '0.95rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: 'Syne, sans-serif', transition: 'opacity 0.2s',
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                }}
              >
                {loading ? (
                  <>
                    <span style={{
                      display: 'inline-block', width: 16, height: 16,
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: '#fff', borderRadius: '50%',
                      animation: 'spin 0.7s linear infinite',
                    }} />
                    Analyzing...
                  </>
                ) : '🔍 Analyze Resume'}
              </button>

              <button
                onClick={(e) => { e.stopPropagation(); onDelete() }}
                disabled={loading}
                style={{
                  background: 'rgba(248,113,113,0.1)',
                  border: '1px solid rgba(248,113,113,0.3)',
                  borderRadius: 12, padding: '0.75rem 1.5rem',
                  color: '#f87171', fontSize: '0.9rem',
                  fontWeight: 500, cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseOver={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.2)' }}
                onMouseOut={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.1)' }}
              >
                🗑 Delete File
              </button>
            </div>
          </div>
        )}
      </div>

      {displayError && (
        <div className="fade-up" style={{
          marginTop: '1rem',
          background: 'rgba(248,113,113,0.1)',
          border: '1px solid rgba(248,113,113,0.3)',
          borderRadius: 12, padding: '0.875rem 1.25rem',
          color: '#f87171', fontSize: '0.9rem',
          display: 'flex', alignItems: 'center', gap: '0.5rem',
        }}>
          ⚠️ {displayError}
        </div>
      )}

      {/* Privacy note */}
      <div className="fade-up-delay-2" style={{
        marginTop: '1.5rem', textAlign: 'center',
        color: '#666688', fontSize: '0.8rem',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
      }}>
        🔒 Your resume is processed in memory and deleted immediately after analysis. Never stored.
      </div>

      {/* How it works */}
      <div id="how-it-works" className="fade-up-delay-3" style={{ marginTop: '4rem' }}>
        <h2 style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 700, marginBottom: '2rem' }}>
          How It Works
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          {[
            { icon: '📤', step: '1', title: 'Upload Resume', desc: 'PDF or DOCX up to 5MB' },
            { icon: '🔍', step: '2', title: 'ATS Scan', desc: 'Analyzed against 5 key parameters' },
            { icon: '📊', step: '3', title: 'Get Your Score', desc: 'Weighted % score per category' },
            { icon: '✏️', step: '4', title: 'Improve', desc: 'Actionable fix suggestions' },
          ].map(({ icon, step, title, desc }) => (
            <div key={step} style={{
              background: 'var(--bg2)',
              border: '1px solid var(--border)',
              borderRadius: 16, padding: '1.5rem',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 32, marginBottom: '0.5rem' }}>{icon}</div>
              <div style={{
                width: 24, height: 24, background: 'linear-gradient(135deg, #63b3ed, #a78bfa)',
                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.7rem', fontWeight: 700, margin: '0 auto 0.5rem',
              }}>{step}</div>
              <div style={{ fontWeight: 600, marginBottom: '0.25rem', fontFamily: 'Syne, sans-serif' }}>{title}</div>
              <div style={{ color: '#8888aa', fontSize: '0.82rem' }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

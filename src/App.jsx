import { useState, useCallback } from 'react'
import Header        from './components/Header.jsx'
import UploadZone    from './components/UploadZone.jsx'
import Results       from './components/Results.jsx'
import ResumeBuilder from './components/ResumeBuilder.jsx'
import Footer        from './components/Footer.jsx'

export default function App() {
  const [mode,    setMode]    = useState('check')   // 'check' | 'build'
  const [file,    setFile]    = useState(null)
  const [loading, setLoading] = useState(false)
  const [result,  setResult]  = useState(null)
  const [error,   setError]   = useState(null)

  const handleSelect = useCallback((f) => { setFile(f); setResult(null); setError(null) }, [])
  const handleDelete = useCallback(() => { setFile(null); setResult(null); setError(null) }, [])
  const handleReset  = useCallback(() => { setFile(null); setResult(null); setError(null); setMode('check') }, [])

  const handleAnalyze = useCallback(async () => {
    if (!file) return
    setLoading(true); setError(null)
    const fd = new FormData()
    fd.append('file', file)
    try {
      const res = await fetch('/api/analyze', { method: 'POST', body: fd })
      let data
      try { data = await res.json() } catch { throw new Error(`Server error (${res.status})`) }
      if (!res.ok) throw new Error(data?.error || `Server error: ${res.status}`)
      setResult(data)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally { setLoading(false) }
  }, [file])

  return (
    <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      {/* ── Mode switcher tabs ── */}
      {mode !== 'build' && !result && (
        <div style={{ maxWidth: 940, margin: '0 auto', width: '100%', padding: '1.5rem 1.25rem 0' }}>
          <div style={{ display: 'inline-flex', background: '#f0f4f8', borderRadius: 12, padding: '0.2rem', gap: '0.15rem' }}>
            {[
              { id: 'check', label: '🔍  Check ATS Score',    desc: 'Analyze existing resume' },
              { id: 'build', label: '✏️  Build ATS Resume',   desc: 'Create from scratch' },
            ].map(tab => (
              <button key={tab.id} onClick={() => { setMode(tab.id); setFile(null); setResult(null); setError(null) }}
                style={{
                  background: mode === tab.id ? '#fff' : 'transparent',
                  border: 'none', borderRadius: 10,
                  padding: '0.6rem 1.25rem',
                  color: mode === tab.id ? '#1a2332' : '#8896a8',
                  fontSize: '0.875rem', fontWeight: mode === tab.id ? 700 : 500,
                  cursor: 'pointer',
                  boxShadow: mode === tab.id ? '0 1px 4px rgba(26,35,50,0.1)' : 'none',
                  transition: 'all 0.2s',
                }}
              >{tab.label}</button>
            ))}
          </div>
        </div>
      )}

      <main style={{ flex: 1, padding: '2rem 1.25rem 2.5rem', maxWidth: 940, margin: '0 auto', width: '100%' }}>
        {mode === 'build'
          ? <ResumeBuilder onBack={() => setMode('check')} />
          : result
            ? <Results result={result} fileName={file?.name} onReset={handleReset} onBuild={() => setMode('build')} />
            : <UploadZone file={file} loading={loading} error={error}
                onSelect={handleSelect} onDelete={handleDelete} onAnalyze={handleAnalyze}
                onBuild={() => setMode('build')} />
        }
      </main>
      <Footer />
    </div>
  )
}

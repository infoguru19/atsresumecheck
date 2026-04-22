import { useState, useCallback } from 'react'
import Header      from './components/Header.jsx'
import UploadZone  from './components/UploadZone.jsx'
import Results     from './components/Results.jsx'
import Footer      from './components/Footer.jsx'

export default function App() {
  const [file,    setFile]    = useState(null)
  const [loading, setLoading] = useState(false)
  const [result,  setResult]  = useState(null)
  const [error,   setError]   = useState(null)

  const handleSelect = useCallback((f) => { setFile(f); setResult(null); setError(null) }, [])
  const handleDelete = useCallback(() => { setFile(null); setResult(null); setError(null) }, [])

  const handleAnalyze = useCallback(async () => {
    if (!file) return
    setLoading(true); setError(null)
    const fd = new FormData()
    fd.append('file', file)
    try {
      const res = await fetch('/api/analyze', { method:'POST', body:fd })
      let data
      try { data = await res.json() } catch { throw new Error(`Server error (${res.status})`) }
      if (!res.ok) throw new Error(data?.error || `Server error: ${res.status}`)
      setResult(data)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally { setLoading(false) }
  }, [file])

  return (
    <div style={{ position:'relative', zIndex:1, minHeight:'100vh', display:'flex', flexDirection:'column' }}>
      <Header />
      <main style={{ flex:1, padding:'2.5rem 1.25rem', maxWidth:940, margin:'0 auto', width:'100%' }}>
        {result
          ? <Results result={result} fileName={file?.name} onReset={handleDelete}/>
          : <UploadZone file={file} loading={loading} error={error}
              onSelect={handleSelect} onDelete={handleDelete} onAnalyze={handleAnalyze}/>
        }
      </main>
      <Footer />
    </div>
  )
}

import { useState, useCallback } from 'react'
import axios from 'axios'
import UploadZone from './components/UploadZone'
import ResultsDashboard from './components/ResultsDashboard'
import Header from './components/Header'
import Footer from './components/Footer'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function App() {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleFileSelect = useCallback((selectedFile) => {
    setFile(selectedFile)
    setResult(null)
    setError(null)
  }, [])

  const handleDelete = useCallback(() => {
    setFile(null)
    setResult(null)
    setError(null)
  }, [])

  const handleAnalyze = useCallback(async () => {
    if (!file) return

    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await axios.post(`${API_URL}/analyze`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000,
      })
      setResult(response.data)
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Something went wrong. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [file])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main style={{ flex: 1, padding: '2rem 1rem', maxWidth: '900px', margin: '0 auto', width: '100%' }}>
        {!result ? (
          <UploadZone
            file={file}
            loading={loading}
            error={error}
            onFileSelect={handleFileSelect}
            onDelete={handleDelete}
            onAnalyze={handleAnalyze}
          />
        ) : (
          <ResultsDashboard
            result={result}
            fileName={file?.name}
            onReset={handleDelete}
          />
        )}
      </main>
      <Footer />
    </div>
  )
}

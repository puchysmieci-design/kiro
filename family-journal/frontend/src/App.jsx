import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import api from './api'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import AddEntry from './pages/AddEntry'
import Profiles from './pages/Profiles'
import Gallery from './pages/Gallery'
import Calendar from './pages/Calendar'
import Photobook from './pages/Photobook'
import Family from './pages/Family'
import GoProCloud from './pages/GoProCloud'
import GooglePhotos from './pages/GooglePhotos'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
    // Bezpieczny timeout – jeśli backend nie odpowiada w 3s, pokaż login
    const timer = setTimeout(() => setLoading(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  const checkAuth = async () => {
    try {
      const res = await api.get('/auth/current-user')
      setUser(res.data)
    } catch (err) {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-warm-600 font-medium">Ładowanie...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginPage />
  }

  return (
    <Layout user={user}>
      <Routes>
        <Route path="/" element={<Calendar />} />
        <Route path="/dodaj" element={<AddEntry />} />
        <Route path="/profile" element={<Profiles />} />
        <Route path="/galeria" element={<Gallery />} />
        <Route path="/kalendarz" element={<Calendar />} />
        <Route path="/fotoksiazki" element={<Photobook />} />
        <Route path="/rodzina" element={<Family />} />
        <Route path="/gopro" element={<GoProCloud />} />
        <Route path="/google-photos" element={<GooglePhotos />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}

export default App

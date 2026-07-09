import { useEffect, useState } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Register from './pages/Register'
import Feed from './pages/Feed'
import CreatorStudio from './pages/CreatorStudio'
import PlayGame from './pages/PlayGame'
import TeacherDashboard from './pages/TeacherDashboard'

function App() {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) fetchProfile(session.user.id)
      else setLoading(false)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) fetchProfile(session.user.id)
      else setProfile(null)
    })
  }, [])

  const fetchProfile = async (userId) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
    setProfile(data)
    setLoading(false)
  }

  if (loading) return <div className="container page-wrapper text-center">Loading...</div>

  return (
    <HashRouter>
      <Navbar session={session} profile={profile} />
      <div className="page-wrapper">
        <Routes>
          <Route path="/" element={<Feed />} />
          <Route path="/login" element={!session ? <Login /> : <Navigate to="/" />} />
          <Route path="/register" element={!session ? <Register /> : <Navigate to="/" />} />
          <Route path="/create" element={session ? <CreatorStudio session={session} /> : <Navigate to="/login" />} />
          <Route path="/game/:id" element={<PlayGame session={session} profile={profile} />} />
          <Route path="/dashboard" element={session && profile?.role === 'teacher' ? <TeacherDashboard /> : <Navigate to="/" />} />
        </Routes>
      </div>
    </HashRouter>
  )
}

export default App

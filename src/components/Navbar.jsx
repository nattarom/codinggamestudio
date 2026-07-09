import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Gamepad2, LogOut, PlusCircle, LayoutDashboard } from 'lucide-react'

export default function Navbar({ session, profile }) {
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <nav style={{ position: 'fixed', top: 0, width: '100%', zIndex: 100, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--glass-border)' }}>
      <div className="container flex justify-between items-center" style={{ height: '4rem' }}>
        <Link to="/" className="flex items-center gap-2" style={{ color: 'var(--text-primary)', fontSize: '1.25rem', fontWeight: 'bold' }}>
          <Gamepad2 color="var(--accent-primary)" />
          <span style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Student Games</span>
        </Link>
        <div className="flex items-center gap-4">
          {session ? (
            <>
              <span style={{ color: 'var(--text-secondary)' }}>Hi, {profile?.first_name || 'User'}</span>
              <Link to="/create" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>
                <PlusCircle size={18} /> Create
              </Link>
              {profile?.role === 'teacher' && (
                <Link to="/dashboard" className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                  <LayoutDashboard size={18} /> Dashboard
                </Link>
              )}
              <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                <LogOut size={18} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>Login</Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

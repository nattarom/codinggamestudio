import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Link } from 'react-router-dom'
import { Play } from 'lucide-react'

export default function Feed() {
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGames()
  }, [])

  const fetchGames = async () => {
    const { data } = await supabase
      .from('games')
      .select('*, profiles(username, class_grade)')
      .order('created_at', { ascending: false })
    if (data) setGames(data)
    setLoading(false)
  }

  if (loading) return <div className="container text-center mt-4">Loading games...</div>

  return (
    <div className="container animate-fade-in">
      <h1 className="text-center mb-4">Discover Games</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
        {games.map(game => (
          <div key={game.id} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: 'var(--bg-secondary)', height: '150px', borderRadius: 'var(--border-radius)', overflow: 'hidden', position: 'relative', border: '1px solid var(--glass-border)' }}>
              {game.html_code ? (
                <iframe
                  srcDoc={game.html_code}
                  sandbox="allow-scripts"
                  tabIndex="-1"
                  style={{
                    width: '200%',
                    height: '200%',
                    transform: 'scale(0.5)',
                    transformOrigin: 'top left',
                    border: 'none',
                    pointerEvents: 'none',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    background: '#fff'
                  }}
                />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <GamepadIcon />
                </div>
              )}
            </div>
            <div>
              <h3>{game.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>By @{game.profiles?.username} • {game.profiles?.class_grade}</p>
              <p style={{ marginTop: '0.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{game.description}</p>
            </div>
            <Link to={`/game/${game.id}`} className="btn btn-primary" style={{ marginTop: 'auto' }}>
              <Play size={18} /> Play Now
            </Link>
          </div>
        ))}
        {games.length === 0 && <p className="text-center" style={{ gridColumn: '1 / -1', color: 'var(--text-secondary)' }}>No games published yet. Be the first!</p>}
      </div>
    </div>
  )
}

function GamepadIcon() {
  return (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
      <line x1="6" y1="12" x2="10" y2="12"></line>
      <line x1="8" y1="10" x2="8" y2="14"></line>
      <line x1="15" y1="13" x2="15.01" y2="13"></line>
      <line x1="18" y1="11" x2="18.01" y2="11"></line>
      <rect x="2" y="6" width="20" height="12" rx="2"></rect>
    </svg>
  )
}

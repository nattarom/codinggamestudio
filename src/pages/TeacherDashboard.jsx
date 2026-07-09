import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function TeacherDashboard() {
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterClass, setFilterClass] = useState('All')
  const [filterRoom, setFilterRoom] = useState('All')

  useEffect(() => {
    fetchGames()
  }, [])

  const fetchGames = async () => {
    const { data } = await supabase
      .from('games')
      .select('*, profiles(username, class_grade, room_number, first_name, last_name)')
      .order('created_at', { ascending: false })
    if (data) setGames(data)
    setLoading(false)
  }

  const classes = ['All', ...new Set(games.map(g => g.profiles?.class_grade).filter(Boolean))]
  const rooms = ['All', ...new Set(games.map(g => g.profiles?.room_number).filter(Boolean))]
  
  const filteredGames = games.filter(g => {
    const matchClass = filterClass === 'All' || g.profiles?.class_grade === filterClass
    const matchRoom = filterRoom === 'All' || g.profiles?.room_number === filterRoom
    return matchClass && matchRoom
  })

  if (loading) return <div className="container text-center mt-4">Loading dashboard...</div>

  return (
    <div className="container animate-fade-in" style={{ marginTop: '2rem' }}>
      <h1 className="mb-4">Teacher Dashboard</h1>
      
      <div className="glass-panel mb-4" style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontWeight: 'bold' }}>Filter by Class:</span>
          <select className="form-select" style={{ maxWidth: '150px', margin: 0 }} value={filterClass} onChange={e => setFilterClass(e.target.value)}>
            {classes.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontWeight: 'bold' }}>Room:</span>
          <select className="form-select" style={{ maxWidth: '150px', margin: 0 }} value={filterRoom} onChange={e => setFilterRoom(e.target.value)}>
            {rooms.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div style={{ marginLeft: 'auto', color: 'var(--text-secondary)' }}>
          Total Submissions: {filteredGames.length}
        </div>
      </div>

      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid var(--glass-border)' }}>
              <th style={{ padding: '1rem' }}>Game Title</th>
              <th style={{ padding: '1rem' }}>Student</th>
              <th style={{ padding: '1rem' }}>Class / Room</th>
              <th style={{ padding: '1rem' }}>Date Submitted</th>
              <th style={{ padding: '1rem' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredGames.map(game => (
              <tr key={game.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <td style={{ padding: '1rem' }}>{game.title}</td>
                <td style={{ padding: '1rem' }}>{game.profiles?.first_name} {game.profiles?.last_name} (@{game.profiles?.username})</td>
                <td style={{ padding: '1rem' }}>{game.profiles?.class_grade} / {game.profiles?.room_number || '-'}</td>
                <td style={{ padding: '1rem' }}>{new Date(game.created_at).toLocaleDateString()}</td>
                <td style={{ padding: '1rem' }}>
                  <a href={`/game/${game.id}`} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem' }}>
                    View
                  </a>
                </td>
              </tr>
            ))}
            {filteredGames.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center" style={{ padding: '2rem', color: 'var(--text-secondary)' }}>No submissions found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

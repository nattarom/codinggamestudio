import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Heart, MessageSquare, Trash2, Maximize } from 'lucide-react'

export default function PlayGame({ session, profile }) {
  const { id } = useParams()
  const [game, setGame] = useState(null)
  const [comments, setComments] = useState([])
  const [likesCount, setLikesCount] = useState(0)
  const [hasLiked, setHasLiked] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [srcDoc, setSrcDoc] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchGame()
    fetchInteractions()
  }, [id])

  const fetchGame = async () => {
    const { data } = await supabase.from('games').select('*, profiles(username)').eq('id', id).single()
    if (data) {
      setGame(data)
      setSrcDoc(data.html_code + `
        <style>
          html, body { margin: 0; padding: 0; min-height: 100vh; display: flex; justify-content: center; align-items: center; background: #222; }
          canvas { max-width: 100%; max-height: 100vh; object-fit: contain; box-shadow: 0 0 20px rgba(0,0,0,0.5); }
        </style>
        <script>
          window.addEventListener('keydown', function(e) {
            if(['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].indexOf(e.code) > -1) {
              e.preventDefault();
            }
          }, false);
        </script>
      `)
    }
  }

  const fetchInteractions = async () => {
    // Likes
    const { count } = await supabase.from('likes').select('*', { count: 'exact', head: true }).eq('game_id', id)
    setLikesCount(count || 0)

    if (session) {
      const { data } = await supabase.from('likes').select('*').eq('game_id', id).eq('user_id', session.user.id).single()
      setHasLiked(!!data)
    }

    // Comments
    const { data: commentsData } = await supabase.from('comments').select('*, profiles(username)').eq('game_id', id).order('created_at', { ascending: false })
    if (commentsData) setComments(commentsData)
  }

  const toggleLike = async () => {
    if (!session) return alert('Please login to like')
    if (hasLiked) {
      await supabase.from('likes').delete().eq('game_id', id).eq('user_id', session.user.id)
      setHasLiked(false)
      setLikesCount(p => p - 1)
    } else {
      await supabase.from('likes').insert([{ game_id: id, user_id: session.user.id }])
      setHasLiked(true)
      setLikesCount(p => p + 1)
    }
  }

  const postComment = async (e) => {
    e.preventDefault()
    if (!session) return alert('Please login to comment')
    if (!newComment.trim()) return
    const { data } = await supabase.from('comments').insert([{ game_id: id, user_id: session.user.id, content: newComment }]).select('*, profiles(username)').single()
    if (data) {
      setComments([data, ...comments])
      setNewComment('')
    }
  }

  const handleDeleteGame = async () => {
    if (!window.confirm('Are you sure you want to delete this game? This action cannot be undone.')) return
    await supabase.from('games').delete().eq('id', id)
    navigate('/')
  }

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return
    await supabase.from('comments').delete().eq('id', commentId)
    setComments(comments.filter(c => c.id !== commentId))
  }

  const handleFullscreen = () => {
    const iframe = document.getElementById('game-iframe')
    if (iframe.requestFullscreen) iframe.requestFullscreen()
    else if (iframe.webkitRequestFullscreen) iframe.webkitRequestFullscreen()
  }

  if (!game) return <div className="container text-center mt-4">Loading...</div>

  return (
    <div className="container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: 'calc(100vh - 6rem)' }}>
      <div className="glass-panel flex justify-between items-start" style={{ padding: '1rem' }}>
        <div style={{ flex: 1, paddingRight: '2rem' }}>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{game.title}</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: game.description ? '1rem' : '0' }}>By @{game.profiles?.username}</p>
          {game.description && (
            <p style={{ lineHeight: '1.5', whiteSpace: 'pre-wrap', color: 'var(--text-primary)' }}>
              {game.description}
            </p>
          )}
        </div>
        <div className="flex gap-2" style={{ flexShrink: 0 }}>
          {(session?.user?.id === game.author_id || profile?.role === 'teacher') && (
            <button onClick={handleDeleteGame} className="btn btn-secondary" style={{ color: 'var(--danger)', padding: '0.5rem 1rem' }}>
              <Trash2 size={18} /> Delete Game
            </button>
          )}
          <button onClick={toggleLike} className="btn btn-secondary" style={{ color: hasLiked ? 'var(--danger)' : 'var(--text-primary)' }}>
            <Heart size={18} fill={hasLiked ? 'currentColor' : 'none'} /> {likesCount} Likes
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Game Area */}
        <div className="glass-panel" style={{ padding: 0, overflow: 'hidden', borderRadius: 'var(--border-radius)', height: '70vh', minHeight: '500px', position: 'relative' }}>
           <button 
             onClick={handleFullscreen} 
             style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10, background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '4px', padding: '0.5rem', cursor: 'pointer' }}
             title="Fullscreen"
           >
             <Maximize size={20} />
           </button>
           <iframe
              id="game-iframe"
              srcDoc={srcDoc}
              title="game"
              sandbox="allow-scripts allow-popups allow-modals allow-same-origin"
              frameBorder="0"
              width="100%"
              height="100%"
              style={{ background: '#fff' }}
            />
        </div>

        {/* Comments Side */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflow: 'hidden' }}>
          <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
            <MessageSquare size={18} /> <span>Comments ({comments.length})</span>
          </div>
          
          <form onSubmit={postComment} className="flex gap-2">
            <input type="text" className="form-input" placeholder="Add a comment..." value={newComment} onChange={e => setNewComment(e.target.value)} style={{ margin: 0 }} />
            <button type="submit" className="btn btn-primary" style={{ padding: '0 1rem' }}>Post</button>
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {comments.map(c => (
              <div key={c.id} style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', position: 'relative' }}>
                <span style={{ fontWeight: 'bold', color: 'var(--accent-primary)', fontSize: '0.9rem' }}>@{c.profiles?.username}</span>
                <p style={{ marginTop: '0.25rem' }}>{c.content}</p>
                {(session?.user?.id === c.user_id || profile?.role === 'teacher') && (
                  <button 
                    onClick={() => handleDeleteComment(c.id)} 
                    style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', opacity: 0.7 }}
                    title="Delete Comment"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
            {comments.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No comments yet. Be the first to comment!</p>}
          </div>
        </div>
    </div>
    </div>
  )
}

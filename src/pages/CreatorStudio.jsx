import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import { Save, Play } from 'lucide-react'

export default function CreatorStudio({ session }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [code, setCode] = useState(`<!DOCTYPE html>
<html>
<head>
  <style>
    body { text-align: center; font-family: sans-serif; background: #1e293b; color: white; padding: 20px; }
    button { padding: 10px 20px; cursor: pointer; }
  </style>
</head>
<body>
  <h1>My AI Game</h1>
  <button onclick="play()">Start Game</button>
  <script>
    function play() {
      alert("Game Started!");
    }
  </script>
</body>
</html>`)
  const [loading, setLoading] = useState(false)
  const [srcDoc, setSrcDoc] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSrcDoc(code + `
        <script>
          window.addEventListener('keydown', function(e) {
            if(['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].indexOf(e.code) > -1) {
              e.preventDefault();
            }
          }, false);
        </script>
      `)
    }, 500)
    return () => clearTimeout(timeout)
  }, [code])

  const handlePublish = async () => {
    if (!title) return alert('Title is required')
    setLoading(true)
    const { error } = await supabase.from('games').insert([
      {
        author_id: session.user.id,
        title,
        description,
        html_code: code,
        css_code: '',
        js_code: ''
      }
    ])
    if (error) alert(error.message)
    else navigate('/')
    setLoading(false)
  }

  const loadReactTemplate = () => {
    setCode(`<!DOCTYPE html>
<html>
<head>
  <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <style>
    body { font-family: sans-serif; text-align: center; background: #1e293b; color: white; padding: 20px; }
    button { padding: 10px 20px; font-size: 16px; cursor: pointer; border-radius: 8px; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    function App() {
      const [count, setCount] = React.useState(0);
      return (
        <div>
          <h1>My React Game</h1>
          <p>Score: {count}</p>
          <button onClick={() => setCount(count + 1)}>Click Me</button>
        </div>
      );
    }
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(<App />);
  </script>
</body>
</html>`)
  }

  return (
    <div className="container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: 'calc(100vh - 6rem)' }}>
      <div className="glass-panel flex justify-between items-center" style={{ padding: '1rem' }}>
        <div style={{ flex: 1, display: 'flex', gap: '1rem' }}>
          <input type="text" className="form-input" placeholder="Game Title" value={title} onChange={e => setTitle(e.target.value)} style={{ maxWidth: '300px', margin: 0 }} />
          <input type="text" className="form-input" placeholder="Short Description" value={description} onChange={e => setDescription(e.target.value)} style={{ margin: 0 }} />
        </div>
        <button onClick={handlePublish} className="btn btn-primary" disabled={loading}>
          <Save size={18} /> {loading ? 'Saving...' : 'Publish Game'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', flex: 1, minHeight: 0 }}>
        {/* Editor Side */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' }}>
          <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div className="flex justify-between items-center mb-2">
              <label className="form-label" style={{ margin: 0 }}>Full HTML Code</label>
              <button onClick={loadReactTemplate} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>
                Load React Template
              </button>
            </div>
            <textarea className="form-textarea" style={{ flex: 1, fontFamily: 'monospace', resize: 'none' }} value={code} onChange={e => setCode(e.target.value)} />
          </div>
        </div>

        {/* Preview Side */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div className="flex items-center gap-2 mb-4" style={{ color: 'var(--text-secondary)' }}>
            <Play size={18} /> <span>Live Preview</span>
          </div>
          <div style={{ flex: 1, background: '#fff', borderRadius: 'var(--border-radius)', overflow: 'hidden' }}>
            <iframe
              srcDoc={srcDoc}
              title="output"
              sandbox="allow-scripts allow-popups allow-modals allow-same-origin"
              frameBorder="0"
              width="100%"
              height="100%"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

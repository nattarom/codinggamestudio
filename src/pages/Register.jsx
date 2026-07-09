import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { Link, useNavigate } from 'react-router-dom'

export default function Register() {
  const [formData, setFormData] = useState({
    email: '', password: '', username: '', first_name: '', last_name: '', class_grade: '', room_number: '', role: 'student'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          username: formData.username,
          first_name: formData.first_name,
          last_name: formData.last_name,
          class_grade: formData.class_grade,
          room_number: formData.room_number,
          role: formData.role
        }
      }
    })
    if (error) setError(error.message)
    else navigate('/')
    setLoading(false)
  }

  return (
    <div className="container animate-fade-in" style={{ maxWidth: '500px', marginTop: '2rem' }}>
      <div className="glass-panel">
        <h2 className="text-center mb-4">Join the Community!</h2>
        {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
        <form onSubmit={handleRegister}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input type="text" name="first_name" className="form-input" required onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input type="text" name="last_name" className="form-input" required onChange={handleChange} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input type="text" name="username" className="form-input" required onChange={handleChange} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Class / Grade</label>
              <select name="class_grade" className="form-select" required value={formData.class_grade} onChange={handleChange}>
                <option value="" disabled>Select Class...</option>
                <option value="ม.1">ม.1</option>
                <option value="ม.2">ม.2</option>
                <option value="ม.3">ม.3</option>
                <option value="ม.4">ม.4</option>
                <option value="ม.5">ม.5</option>
                <option value="ม.6">ม.6</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Room Number</label>
              <select name="room_number" className="form-select" required value={formData.room_number} onChange={handleChange}>
                <option value="" disabled>Select Room...</option>
                {[...Array(15)].map((_, i) => (
                  <option key={i+1} value={String(i+1)}>ห้อง {i+1}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" name="email" className="form-input" required onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" name="password" className="form-input" required minLength="6" onChange={handleChange} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>
        <p className="text-center mt-4" style={{ color: 'var(--text-secondary)' }}>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  )
}

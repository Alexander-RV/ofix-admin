import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth.jsx'

export default function Login() {
  const { sesion, login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  if (sesion?.rol === 'ADMIN') return <Navigate to="/" replace />

  async function enviar(e) {
    e.preventDefault()
    setError('')
    setCargando(true)
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }

  return (
    <main className="login">
      <form className="login-card" onSubmit={enviar}>
        <div className="logo">OFIX</div>
        <p className="muted">Panel administrativo</p>

        <label>
          Correo electrónico
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
        </label>

        <label>
          Contraseña
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>

        {error && <p className="error" role="alert">{error}</p>}

        <button className="btn primary" disabled={cargando}>
          {cargando ? 'Entrando…' : 'Iniciar sesión'}
        </button>
      </form>
    </main>
  )
}

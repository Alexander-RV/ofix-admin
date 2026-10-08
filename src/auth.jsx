import { createContext, useContext, useState } from 'react'
import { API_URL, leerSesion, guardarSesion, borrarSesion } from './api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [sesion, setSesion] = useState(leerSesion())

  async function login(email, password) {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (!res.ok) throw new Error('Correo o contraseña incorrectos, o la cuenta está suspendida.')

    const data = await res.json() // { token, tipo, rol }

    if (data.rol !== 'ADMIN') {
      throw new Error('Esta cuenta no tiene permisos de administrador.')
    }

    const nueva = { token: data.token, rol: data.rol, email }
    guardarSesion(nueva)
    setSesion(nueva)
  }

  function logout() {
    borrarSesion()
    setSesion(null)
  }

  return (
    <AuthContext.Provider value={{ sesion, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

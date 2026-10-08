import { useEffect, useState } from 'react'
import { api } from '../api.js'
import { useAuth } from '../auth.jsx'

const NOMBRE_ROL = { CLIENTE: 'Cliente', TRABAJADOR: 'Profesional', ADMIN: 'Administrador' }

// Se reutiliza para Usuarios (clientes y admins) y para Profesionales (trabajadores).
export default function Usuarios({ titulo = 'Usuarios', profesionales = false }) {
  const { sesion } = useAuth()
  const [usuarios, setUsuarios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [busqueda, setBusqueda] = useState('')

  async function cargar() {
    try {
      setUsuarios(await api('/api/admin/usuarios'))
      setError('')
    } catch (err) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => { cargar() }, [])

  async function cambiarEstado(u) {
    const accion = u.activo ? 'suspender' : 'reactivar'
    if (!window.confirm(`¿Quieres ${accion} la cuenta de ${u.nombre} ${u.apellido}?`)) return
    try {
      await api(`/api/admin/usuarios/${u.id}/estado`, { method: 'PUT', body: { activo: !u.activo } })
      cargar()
    } catch (err) {
      setError(err.message)
    }
  }

  const filtrados = usuarios
    .filter((u) => (u.rol === 'TRABAJADOR') === profesionales)
    .filter((u) => `${u.nombre} ${u.apellido} ${u.email}`.toLowerCase().includes(busqueda.toLowerCase()))

  return (
    <>
      <header className="page-head">
        <h1>{titulo}</h1>
        <input className="search" placeholder="Buscar por nombre o correo" value={busqueda}
               onChange={(e) => setBusqueda(e.target.value)} />
      </header>

      {error && <p className="error" role="alert">{error}</p>}
      {cargando ? <p className="muted">Cargando…</p> : (
        <div className="card table-wrap">
          <table>
            <thead>
              <tr><th>Nombre</th><th>Correo</th><th>Rol</th><th>Estado</th><th>Registro</th><th></th></tr>
            </thead>
            <tbody>
              {filtrados.map((u) => (
                <tr key={u.id}>
                  <td>{u.nombre} {u.apellido}</td>
                  <td>{u.email}</td>
                  <td>{NOMBRE_ROL[u.rol] || u.rol}</td>
                  <td><span className={`pill ${u.activo ? 'ok' : 'bad'}`}>{u.activo ? 'Activo' : 'Suspendido'}</span></td>
                  <td>{new Date(u.fechaRegistro).toLocaleDateString('es-CO')}</td>
                  <td className="right">
                    {u.email !== sesion.email && (
                      <button className={`btn ${u.activo ? 'danger' : ''}`} onClick={() => cambiarEstado(u)}>
                        {u.activo ? 'Suspender' : 'Reactivar'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filtrados.length === 0 && (
                <tr><td colSpan="6" className="muted">No hay resultados.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

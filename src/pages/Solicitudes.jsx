import { useEffect, useState } from 'react'
import { api } from '../api.js'
import Estado, { LISTA_ESTADOS } from '../components/Estado.jsx'

export default function Solicitudes() {
  const [servicios, setServicios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [estado, setEstado] = useState('TODOS')
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    api('/api/admin/servicios')
      .then(setServicios)
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false))
  }, [])

  const filtradas = servicios
    .filter((s) => estado === 'TODOS' || s.estado === estado)
    .filter((s) =>
      `${s.titulo} ${s.clienteNombre} ${s.trabajadorNombre || ''} ${s.categoriaNombre}`
        .toLowerCase()
        .includes(busqueda.toLowerCase())
    )
    .sort((a, b) => new Date(b.fechaSolicitud) - new Date(a.fechaSolicitud))

  return (
    <>
      <header className="page-head">
        <h1>Solicitudes</h1>
        <div className="filters">
          <select value={estado} onChange={(e) => setEstado(e.target.value)} aria-label="Filtrar por estado">
            <option value="TODOS">Todos los estados</option>
            {LISTA_ESTADOS.map((e) => <option key={e} value={e}>{e.replace('_', ' ').toLowerCase()}</option>)}
          </select>
          <input className="search" placeholder="Buscar solicitud" value={busqueda}
                 onChange={(e) => setBusqueda(e.target.value)} />
        </div>
      </header>

      {error && <p className="error" role="alert">{error}</p>}
      {cargando ? <p className="muted">Cargando solicitudes…</p> : (
        <div className="card table-wrap">
          <table>
            <thead>
              <tr><th>ID</th><th>Título</th><th>Cliente</th><th>Profesional</th><th>Categoría</th><th>Fecha</th><th>Estado</th></tr>
            </thead>
            <tbody>
              {filtradas.map((s) => (
                <tr key={s.id}>
                  <td>#{String(s.id).padStart(3, '0')}</td>
                  <td>{s.titulo}</td>
                  <td>{s.clienteNombre}</td>
                  <td>{s.trabajadorNombre || <span className="muted">Sin asignar</span>}</td>
                  <td>{s.categoriaNombre}</td>
                  <td>{new Date(s.fechaSolicitud).toLocaleDateString('es-CO')}</td>
                  <td><Estado valor={s.estado} /></td>
                </tr>
              ))}
              {filtradas.length === 0 && (
                <tr><td colSpan="7" className="muted">No hay solicitudes que coincidan.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

import { useEffect, useState } from 'react'
import { api } from '../api.js'

export default function Categorias() {
  const [categorias, setCategorias] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [nuevo, setNuevo] = useState('')
  const [editando, setEditando] = useState(null) // { id, nombre }

  async function cargar() {
    try {
      setCategorias(await api('/api/categorias'))
      setError('')
    } catch (err) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => { cargar() }, [])

  async function crear(e) {
    e.preventDefault()
    setMensaje('')
    const nombre = nuevo.trim()

    if (!nombre) {
      setError('Escribe el nombre de la categoría antes de agregarla.')
      return
    }

    try {
      await api('/api/categorias', { method: 'POST', body: { nombre, activo: true } })
      setNuevo('')
      setError('')
      setMensaje(`Categoría "${nombre}" agregada.`)
      cargar()
    } catch (err) {
      setError(
        err.message.startsWith('Ocurrió un error')
          ? 'No se pudo agregar. Puede que ya exista una categoría con ese nombre.'
          : err.message
      )
    }
  }

  async function guardar(cat, cambios) {
    try {
      await api(`/api/categorias/${cat.id}`, {
        method: 'PUT',
        body: { nombre: cat.nombre, activo: cat.activo, ...cambios },
      })
      setEditando(null)
      cargar()
    } catch (err) {
      setError(err.message)
    }
  }

  async function eliminar(cat) {
    if (!window.confirm(`¿Eliminar la categoría "${cat.nombre}"?`)) return
    try {
      await api(`/api/categorias/${cat.id}`, { method: 'DELETE' })
      cargar()
    } catch {
      setError('No se pudo eliminar. Si tiene servicios asociados, desactívala en su lugar.')
    }
  }

  return (
    <>
      <header className="page-head">
        <h1>Categorías de servicio</h1>
      </header>

      <form className="inline-form" onSubmit={crear}>
        <input placeholder="Nueva categoría (ej. Plomería)" value={nuevo} onChange={(e) => setNuevo(e.target.value)} />
        <button type="submit" className="btn primary">Agregar categoría</button>
      </form>

      {mensaje && <p className="success" role="status">{mensaje}</p>}
      {error && <p className="error" role="alert">{error}</p>}
      {cargando ? <p className="muted">Cargando categorías…</p> : (
        <div className="card table-wrap">
          <table>
            <thead>
              <tr><th>Nombre</th><th>Estado</th><th></th></tr>
            </thead>
            <tbody>
              {categorias.map((c) => (
                <tr key={c.id}>
                  <td>
                    {editando?.id === c.id ? (
                      <input
                        value={editando.nombre}
                        onChange={(e) => setEditando({ ...editando, nombre: e.target.value })}
                        autoFocus
                      />
                    ) : c.nombre}
                  </td>
                  <td><span className={`pill ${c.activo ? 'ok' : 'bad'}`}>{c.activo ? 'Activa' : 'Inactiva'}</span></td>
                  <td className="right actions">
                    {editando?.id === c.id ? (
                      <>
                        <button className="btn primary" onClick={() => guardar(c, { nombre: editando.nombre })}>Guardar</button>
                        <button className="btn" onClick={() => setEditando(null)}>Cancelar</button>
                      </>
                    ) : (
                      <>
                        <button className="btn" onClick={() => setEditando({ id: c.id, nombre: c.nombre })}>Editar</button>
                        <button className="btn" onClick={() => guardar(c, { activo: !c.activo })}>
                          {c.activo ? 'Desactivar' : 'Activar'}
                        </button>
                        <button className="btn danger" onClick={() => eliminar(c)}>Eliminar</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {categorias.length === 0 && (
                <tr><td colSpan="3" className="muted">Aún no hay categorías. Agrega la primera arriba.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

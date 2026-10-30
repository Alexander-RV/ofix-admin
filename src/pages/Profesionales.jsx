import { useEffect, useState } from 'react'
import { api } from '../api.js'

const ESTADOS = {
  PENDIENTE: { texto: 'En revisión', clase: 'warn' },
  VERIFICADO: { texto: 'Verificado', clase: 'ok' },
  RECHAZADO: { texto: 'Rechazado', clase: 'bad' },
}

// Revisión de profesionales: el admin aprueba o rechaza (con motivo) cada registro.
// La decisión le llega al profesional por correo.
export default function Profesionales() {
  const [profesionales, setProfesionales] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [filtro, setFiltro] = useState('PENDIENTE') // PENDIENTE | VERIFICADO | RECHAZADO | TODOS

  // Ventana de confirmación: { tipo: 'aprobar' | 'rechazar', profesional }
  const [modal, setModal] = useState(null)
  const [motivo, setMotivo] = useState('')
  const [errorModal, setErrorModal] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function cargar() {
    try {
      setProfesionales(await api('/api/admin/profesionales'))
      setError('')
    } catch (err) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => { cargar() }, [])

  // Escape cierra la ventana
  useEffect(() => {
    if (!modal) return
    const alTeclear = (e) => { if (e.key === 'Escape' && !enviando) cerrar() }
    window.addEventListener('keydown', alTeclear)
    return () => window.removeEventListener('keydown', alTeclear)
  }, [modal, enviando])

  function abrir(tipo, profesional) {
    setModal({ tipo, profesional })
    setMotivo('')
    setErrorModal('')
  }

  function cerrar() {
    setModal(null)
    setMotivo('')
    setErrorModal('')
  }

  async function confirmar() {
    const { tipo, profesional } = modal

    if (tipo === 'rechazar' && !motivo.trim()) {
      setErrorModal('Escribe el motivo del rechazo.')
      return
    }

    setEnviando(true)
    try {
      if (tipo === 'aprobar') {
        await api(`/api/admin/profesionales/${profesional.id}/aprobar`, { method: 'PUT' })
      } else {
        await api(`/api/admin/profesionales/${profesional.id}/rechazar`, {
          method: 'PUT',
          body: { motivo: motivo.trim() },
        })
      }
      cerrar()
      await cargar()
    } catch (err) {
      setErrorModal(err.message)
    } finally {
      setEnviando(false)
    }
  }

  const contar = (estado) => profesionales.filter((p) => p.estadoVerificacion === estado).length

  const filtrados = profesionales
    .filter((p) => filtro === 'TODOS' || p.estadoVerificacion === filtro)
    .filter((p) =>
      `${p.nombre} ${p.apellido} ${p.email} ${p.profesion || ''}`
        .toLowerCase()
        .includes(busqueda.toLowerCase())
    )

  const p = modal?.profesional

  return (
    <>
      <header className="page-head">
        <h1>Profesionales</h1>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <select className="search" value={filtro} onChange={(e) => setFiltro(e.target.value)}>
            <option value="PENDIENTE">En revisión ({contar('PENDIENTE')})</option>
            <option value="VERIFICADO">Verificados ({contar('VERIFICADO')})</option>
            <option value="RECHAZADO">Rechazados ({contar('RECHAZADO')})</option>
            <option value="TODOS">Todos ({profesionales.length})</option>
          </select>
          <input className="search" placeholder="Buscar por nombre, correo u oficio" value={busqueda}
                 onChange={(e) => setBusqueda(e.target.value)} />
        </div>
      </header>

      {error && <p className="error" role="alert">{error}</p>}
      {cargando ? <p className="muted">Cargando…</p> : (
        <div className="card table-wrap">
          <table>
            <thead>
              <tr>
                <th>Profesional</th><th>Oficio</th><th>Categorías</th>
                <th>Estado</th><th>Registro</th><th></th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((prof) => {
                const estado = ESTADOS[prof.estadoVerificacion] || ESTADOS.PENDIENTE
                return (
                  <tr key={prof.id}>
                    <td>
                      {prof.nombre} {prof.apellido}
                      <div className="muted">{prof.email}</div>
                    </td>
                    <td>
                      {prof.profesion || '—'}
                      <div className="muted">
                        {prof.anosExperiencia ?? 0} años · {prof.zonaTrabajo || 'Sin zona'}
                      </div>
                    </td>
                    <td>{(prof.categorias || []).join(', ') || '—'}</td>
                    <td>
                      <span className={`pill ${estado.clase}`}>{estado.texto}</span>
                      {prof.estadoVerificacion === 'RECHAZADO' && prof.motivoRechazo && (
                        <div className="muted">Motivo: {prof.motivoRechazo}</div>
                      )}
                    </td>
                    <td>{new Date(prof.fechaRegistro).toLocaleDateString('es-CO')}</td>
                    <td className="right">
                      {prof.estadoVerificacion !== 'VERIFICADO' && (
                        <button className="btn" onClick={() => abrir('aprobar', prof)}>
                          Aprobar
                        </button>
                      )}{' '}
                      {prof.estadoVerificacion === 'PENDIENTE' && (
                        <button className="btn danger" onClick={() => abrir('rechazar', prof)}>
                          Rechazar
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
              {filtrados.length === 0 && (
                <tr><td colSpan="6" className="muted">No hay profesionales en este filtro.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <div className="modal-backdrop" onClick={() => !enviando && cerrar()}>
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-titulo"
               onClick={(e) => e.stopPropagation()}>
            {modal.tipo === 'aprobar' ? (
              <>
                <h2 id="modal-titulo">Aprobar profesional</h2>
                <p>
                  ¿Aprobar a <strong>{p.nombre} {p.apellido}</strong>? Podrá iniciar sesión y
                  ofertar en Ofix.
                </p>
                <p className="muted">Se le enviará un correo a {p.email} avisándole.</p>
              </>
            ) : (
              <>
                <h2 id="modal-titulo">Rechazar registro</h2>
                <p>
                  Escribe el motivo del rechazo para <strong>{p.nombre} {p.apellido}</strong>.
                  Se enviará al correo <strong>{p.email}</strong> y se le mostrará al intentar entrar.
                </p>
                <textarea
                  rows="4"
                  maxLength={500}
                  autoFocus
                  placeholder="Ej. No pudimos validar tu experiencia en el oficio indicado."
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                />
                <div className="counter muted">{motivo.length}/500</div>
              </>
            )}

            {errorModal && <p className="error" role="alert">{errorModal}</p>}

            <div className="modal-actions">
              <button className="btn" onClick={cerrar} disabled={enviando}>Cancelar</button>
              <button
                className={`btn ${modal.tipo === 'aprobar' ? 'primary' : 'danger'}`}
                onClick={confirmar}
                disabled={enviando}
              >
                {enviando
                  ? 'Enviando…'
                  : modal.tipo === 'aprobar' ? 'Aprobar y avisar' : 'Rechazar y avisar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
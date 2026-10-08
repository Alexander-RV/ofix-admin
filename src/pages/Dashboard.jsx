import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api.js'
import Estado from '../components/Estado.jsx'
import LineChart from '../components/LineChart.jsx'

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

// Cuenta solicitudes de los últimos 6 meses (incluye el mes actual).
function solicitudesPorMes(servicios) {
  const hoy = new Date()
  const meses = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1)
    meses.push({ anio: d.getFullYear(), mes: d.getMonth(), total: 0 })
  }
  servicios.forEach((s) => {
    const f = new Date(s.fechaSolicitud)
    const m = meses.find((x) => x.anio === f.getFullYear() && x.mes === f.getMonth())
    if (m) m.total++
  })
  return { etiquetas: meses.map((m) => MESES[m.mes]), valores: meses.map((m) => m.total) }
}

export default function Dashboard() {
  const [datos, setDatos] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      api('/api/admin/usuarios'),
      api('/api/admin/servicios'),
      api('/api/categorias'),
    ])
      .then(([usuarios, servicios, categorias]) => setDatos({ usuarios, servicios, categorias }))
      .catch((err) => setError(err.message))
  }, [])

  if (error) return <p className="error" role="alert">{error}</p>
  if (!datos) return <p className="muted">Cargando resumen…</p>

  const { usuarios, servicios, categorias } = datos
  const clientes = usuarios.filter((u) => u.rol === 'CLIENTE').length
  const profesionales = usuarios.filter((u) => u.rol === 'TRABAJADOR').length
  const recientes = [...servicios]
    .sort((a, b) => new Date(b.fechaSolicitud) - new Date(a.fechaSolicitud))
    .slice(0, 5)
  const grafica = solicitudesPorMes(servicios)

  const tarjetas = [
    { valor: clientes, texto: 'Clientes' },
    { valor: profesionales, texto: 'Profesionales' },
    { valor: categorias.length, texto: 'Categorías' },
    { valor: servicios.length, texto: 'Solicitudes' },
  ]

  return (
    <>
      <h1>Resumen general</h1>

      <section className="cards">
        {tarjetas.map((t) => (
          <div className="card stat" key={t.texto}>
            <strong>{t.valor.toLocaleString('es-CO')}</strong>
            <span className="muted">{t.texto}</span>
          </div>
        ))}
      </section>

      <section className="card">
        <div className="card-head">
          <h2>Solicitudes recientes</h2>
          <Link to="/solicitudes" className="link">Ver todas</Link>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>ID</th><th>Cliente</th><th>Profesional</th><th>Servicio</th><th>Estado</th></tr>
            </thead>
            <tbody>
              {recientes.map((s) => (
                <tr key={s.id}>
                  <td>#{String(s.id).padStart(3, '0')}</td>
                  <td>{s.clienteNombre}</td>
                  <td>{s.trabajadorNombre || <span className="muted">Sin asignar</span>}</td>
                  <td>{s.categoriaNombre}</td>
                  <td><Estado valor={s.estado} /></td>
                </tr>
              ))}
              {recientes.length === 0 && (
                <tr><td colSpan="5" className="muted">Todavía no hay solicitudes.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card">
        <h2>Crecimiento de solicitudes</h2>
        <LineChart etiquetas={grafica.etiquetas} valores={grafica.valores} />
      </section>
    </>
  )
}

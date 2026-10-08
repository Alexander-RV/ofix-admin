import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth.jsx'
import Icon from '../components/Icon.jsx'

// Opciones que ya funcionan y opciones planeadas (se muestran deshabilitadas).
const MENU = [
  { a: '/dashboard', texto: 'Dashboard', icono: 'dashboard' },
  { a: '/usuarios', texto: 'Usuarios', icono: 'users' },
  { a: '/profesionales', texto: 'Profesionales', icono: 'pro' },
  { a: '/categorias', texto: 'Categorías', icono: 'tag' },
  { a: '/solicitudes', texto: 'Solicitudes', icono: 'clipboard' },
  { texto: 'Pagos', icono: 'card' },
  { texto: 'Reportes', icono: 'chart' },
  { texto: 'Configuración', icono: 'gear' },
]

export default function Layout() {
  const { sesion, logout } = useAuth()
  const navigate = useNavigate()

  function salir() {
    logout()
    navigate('/login')
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="logo">OFIX</div>

        <nav>
          {MENU.map((op) =>
            op.a ? (
              <NavLink key={op.texto} to={op.a}>
                <Icon name={op.icono} /> {op.texto}
              </NavLink>
            ) : (
              <span key={op.texto} className="disabled" title="Próximamente">
                <Icon name={op.icono} /> {op.texto}
              </span>
            )
          )}
        </nav>

        <button className="logout" onClick={salir}>
          <Icon name="logout" /> Cerrar sesión
        </button>
      </aside>

      <div className="main">
        <header className="topbar">
          <span className="muted">{sesion.email}</span>
          <span className="avatar" aria-hidden="true">{sesion.email[0].toUpperCase()}</span>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

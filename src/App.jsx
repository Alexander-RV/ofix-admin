import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./auth.jsx";
import Layout from "./pages/Layout.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Usuarios from "./pages/Usuarios.jsx";
import Profesionales from "./pages/Profesionales.jsx";
import Categorias from "./pages/Categorias.jsx";
import Solicitudes from "./pages/Solicitudes.jsx";

// Solo deja pasar a quien tenga sesión de ADMIN.
function RutaProtegida({ children }) {
  const { sesion } = useAuth();
  if (!sesion || sesion.rol !== "ADMIN")
    return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <RutaProtegida>
            <Layout />
          </RutaProtegida>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="usuarios" element={<Usuarios titulo="Usuarios" />} />
        {/* Revisión de profesionales: aprobar / rechazar registros */}
        <Route path="profesionales" element={<Profesionales />} />
        <Route path="categorias" element={<Categorias />} />
        <Route path="solicitudes" element={<Solicitudes />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

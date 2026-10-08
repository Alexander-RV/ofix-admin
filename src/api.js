// URL del backend Spring Boot. Cámbiala si tu API corre en otro puerto.
export const API_URL = 'http://localhost:8080'

const KEY = 'ofix_admin_session'

export function leerSesion() {
  try {
    return JSON.parse(localStorage.getItem(KEY))
  } catch {
    return null
  }
}

export function guardarSesion(sesion) {
  localStorage.setItem(KEY, JSON.stringify(sesion))
}

export function borrarSesion() {
  localStorage.removeItem(KEY)
}

// Wrapper de fetch: agrega el JWT y avisa cuando la sesión expiró (401).
export async function api(ruta, { method = 'GET', body } = {}) {
  const sesion = leerSesion()
  const headers = { 'Content-Type': 'application/json' }
  if (sesion?.token) headers.Authorization = `Bearer ${sesion.token}`

  let res
  try {
    res = await fetch(`${API_URL}${ruta}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new Error('No se pudo conectar con el servidor. Verifica que el backend esté en ejecución.')
  }

  if (res.status === 401) {
    borrarSesion()
    window.location.href = '/login'
    throw new Error('Tu sesión expiró. Inicia sesión de nuevo.')
  }

  if (res.status === 403) throw new Error('No tienes permisos para esta acción.')

  if (!res.ok) {
    let mensaje = 'Ocurrió un error. Intenta de nuevo.'
    try {
      const data = await res.json()
      if (data.mensaje) mensaje = data.mensaje
    } catch { /* la respuesta no traía JSON */ }
    throw new Error(mensaje)
  }

  if (res.status === 204) return null
  return res.json()
}

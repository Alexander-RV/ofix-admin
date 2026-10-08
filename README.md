# Ofix · Panel administrativo (React)

Panel web para el rol ADMIN. Consume la API de Spring Boot (`ofix-backend`).

## Requisitos
- Node.js 18 o superior
- Backend corriendo en http://localhost:8080 (con los cambios de `backend-cambios/`)

## Ejecutar
```bash
npm install
npm run dev
```
Abre http://localhost:5173 e inicia sesión con un usuario con rol ADMIN.

## Estructura
- `src/api.js`     → fetch con JWT y manejo de errores
- `src/auth.jsx`   → contexto de sesión (login / logout)
- `src/App.jsx`    → rutas y ruta protegida por rol
- `src/pages/`     → Login, Layout, Usuarios, Categorías

Si tu backend corre en otro puerto, cambia `API_URL` en `src/api.js`.

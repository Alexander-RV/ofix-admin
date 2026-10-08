// Etiqueta de color para el estado de una solicitud.
const ESTADOS = {
  PENDIENTE: { texto: 'Pendiente', clase: 'warn' },
  EN_PROCESO: { texto: 'En proceso', clase: 'info' },
  COMPLETADO: { texto: 'Completado', clase: 'ok' },
  CANCELADO: { texto: 'Cancelado', clase: 'bad' },
}

export default function Estado({ valor }) {
  const e = ESTADOS[valor] || { texto: valor, clase: 'info' }
  return <span className={`pill ${e.clase}`}>{e.texto}</span>
}

export const LISTA_ESTADOS = Object.keys(ESTADOS)

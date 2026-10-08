// Gráfica de línea con área, hecha en SVG (sin librerías externas).
export default function LineChart({ etiquetas, valores }) {
  const W = 640, H = 260
  const m = { t: 16, r: 16, b: 32, l: 40 }
  const maxDato = Math.max(...valores, 0)
  const paso = maxDato <= 10 ? 2 : maxDato <= 50 ? 10 : maxDato <= 200 ? 50 : 100
  const max = Math.max(paso * 2, Math.ceil(maxDato / paso) * paso)

  const x = (i) => m.l + (i * (W - m.l - m.r)) / Math.max(valores.length - 1, 1)
  const y = (v) => m.t + (1 - v / max) * (H - m.t - m.b)

  const puntos = valores.map((v, i) => [x(i), y(v)])
  const linea = puntos.map(([px, py], i) => `${i ? 'L' : 'M'}${px},${py}`).join(' ')
  const area = `${linea} L${x(valores.length - 1)},${y(0)} L${x(0)},${y(0)} Z`
  const guias = []
  for (let v = 0; v <= max; v += paso) guias.push(v)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart" role="img"
         aria-label="Crecimiento de solicitudes por mes">
      <defs>
        <linearGradient id="relleno" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="var(--brand)" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {guias.map((v) => (
        <g key={v}>
          <line x1={m.l} x2={W - m.r} y1={y(v)} y2={y(v)} stroke="var(--line)" />
          <text x={m.l - 8} y={y(v) + 4} textAnchor="end" className="chart-txt">{v}</text>
        </g>
      ))}

      <path d={area} fill="url(#relleno)" />
      <path d={linea} fill="none" stroke="var(--brand)" strokeWidth="2.5" strokeLinejoin="round" />

      {puntos.map(([px, py], i) => (
        <g key={i}>
          <circle cx={px} cy={py} r="4" fill="var(--surface)" stroke="var(--brand)" strokeWidth="2" />
          <title>{`${etiquetas[i]}: ${valores[i]}`}</title>
          <text x={px} y={H - 10} textAnchor="middle" className="chart-txt">{etiquetas[i]}</text>
        </g>
      ))}
    </svg>
  )
}

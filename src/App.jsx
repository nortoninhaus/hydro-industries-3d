import { useEffect, useState } from 'react'
import PlantScene from './PlantScene'
import './App.css'

const PHASES = [
  { id: 'intake', stage: 1, title: 'Captación', chemistry: 'Aguas crudas entran y se caracterizan in-situ por nuestros químicos antes de dimensionar una sola tubería.', metric: { value: 0, unit: '—', label: 'química del sitio mapeada antes del diseño' }, cta: { label: 'Cómo dimensionamos un sitio', url: '/contact/' } },
  { id: 'coag', stage: 2, title: 'Coagulación + Floculación', chemistry: 'El coagulante desestabiliza partículas suspendidas; el floculante las agrupa en flóculos sedimentables.', metric: { value: 0, unit: '—', label: 'dosis optimizada por sitio → menor gasto en reactivos' }, cta: { label: 'Reduzca su gasto en reactivos', url: '/contact/' } },
  { id: 'sedim', stage: 3, title: 'Sedimentación', chemistry: 'Los flóculos se asientan como lodo en los clarificadores; el agua clarificada sigue su curso.', metric: { value: 0, unit: '—', label: 'separación sin energía — sin bombas, sin consumo' }, cta: { label: 'Reduzca su consumo energético', url: '/contact/' } },
  { id: 'filtr', stage: 4, title: 'Filtración', chemistry: 'Filtros multimedia + carbón activado retiran sólidos y orgánicos residuales hasta el estándar de descarga o reúso.', metric: { value: 0, unit: '—', label: 'filtración a especificación de cumplimiento' }, cta: { label: 'Cumpla su límite de descarga', url: '/contact/' } },
  { id: 'disinf', stage: 5, title: 'Desinfección', chemistry: 'UV, cloro u ozono neutralizan patógenos — elegidos para el sitio, no por defecto.', metric: { value: 454339000, unit: 'litros', label: 'agua potable entregada' }, cta: { label: 'Entregue agua limpia', url: '/contact/' } },
  { id: 'sludge', stage: 6, title: 'Lodos + Recuperación', chemistry: 'El lodo se deshidrata y procesa; materiales valiosos se recuperan del flujo.', metric: { value: 132440000, unit: 'kg', label: 'bio-sólidos recuperados' }, cta: { label: 'Recupere lo que hoy descarta', url: '/contact/' } },
]

const TOTAL = 24819282000 // 24.8B litros aguas industriales tratadas

function fmt(n) {
  if (n >= 1e9) return (n / 1e9).toFixed(1).replace(/\.0$/, '') + 'B'
  if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M'
  return n.toLocaleString()
}

export default function App() {
  const [stage, setStage] = useState(1)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      const p = window.scrollY / (document.body.scrollHeight - window.innerHeight)
      const s = Math.min(6, Math.max(1, Math.floor(p * 6) + 1))
      setStage(s)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const phase = PHASES[stage - 1]
  const hard = phase.metric.value > 0
  const revealPct = (stage / 6) * 100

  return (
    <div className="app">
      <div className="hero">
        <PlantScene />
        <div className="hero-title">
          <h1>Generating Clean Water</h1>
          <p>Recorra la planta completa — de la captación a la recuperación de recursos.</p>
        </div>
      </div>

      <div className="spacer" />

      {/* Overlay de fase */}
      <div className={`overlay ${open ? 'open' : ''}`}>
        <div className="overlay-stage">Fase {phase.stage} / 6</div>
        <h2>{phase.title}</h2>
        <p className="chemistry">{phase.chemistry}</p>
        <div className={`metric ${hard ? 'hard' : 'capability'}`}>
          {hard ? (
            <>
              <span className="metric-num">{fmt(phase.metric.value)}</span>
              <span className="metric-unit">{phase.metric.unit}</span>
            </>
          ) : (
            <span className="cap-chip">Capacidad</span>
          )}
          <span className="metric-label">{phase.metric.label}</span>
        </div>
        <a className="cta" href={phase.cta.url}>{phase.cta.label} →</a>
      </div>

      {/* Footer reveal */}
      <div className="footer">
        <div className="footer-label">Aguas industriales tratadas</div>
        <div className="bar"><div className="bar-fill" style={{ width: `${revealPct}%` }} /></div>
        <div className="footer-total">{fmt(TOTAL)} litros</div>
      </div>
    </div>
  )
}

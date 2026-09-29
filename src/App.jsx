import { useEffect, useState } from 'react'
import PlantScene from './PlantScene'
import { loadPlantData } from './plantData'
import { detectLocale, LOCALES, t } from './i18n'
import './App.css'

function fmt(n) {
  if (n >= 1e9) return (n / 1e9).toFixed(1).replace(/\.0$/, '') + 'B'
  if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M'
  return n.toLocaleString()
}

export default function App() {
  const [data, setData] = useState(null)
  const [stage, setStage] = useState(1)
  const [open, setOpen] = useState(true)
  const [locale, setLocale] = useState(detectLocale)

  useEffect(() => {
    loadPlantData().then(setData).catch(console.error)
  }, [])

  // Scroll-scrub → fase discreta 1..6. Listener passive en scroll (patrón canónico
  // de scroll-scrub; el navegador emite eventos por wheel/touch en runtime real).
  // Los eventos leen scrollY fresco en cada tick; como leen el mismo scrollY que la
  // cámara (useFrame), overlay/footer quedan en sync con el track 3D. El floor() da
  // snap-back: soltar a mitad de scroll regresa a la fase actual completa.
  useEffect(() => {
    const onScroll = () => {
      const max = document.body.scrollHeight - window.innerHeight
      const p = max > 0 ? window.scrollY / max : 0
      setStage(Math.min(6, Math.max(1, Math.floor(p * 6) + 1)))
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const goStage = (n) => {
    setStage(n)
    const max = document.body.scrollHeight - window.innerHeight
    window.scrollTo({ top: max * ((n - 1) / 5), behavior: 'smooth' })
  }

  const I18N = t(locale)
  const chrome = I18N.chrome
  const phase = data ? I18N.phase(data.phases[stage - 1]) : null
  const hard = phase ? phase.metric.value > 0 : false

  // Footer: headline = reveal ponderado (teaser 1–4, primer dato duro en disinf, cierre en sludge);
  // rotate = cicla los slots de totals.rotate por fase.
  let footer = null
  if (data) {
    if (data.footerMode === 'rotate') {
      const slot = data.totals.rotate[(stage - 1) % data.totals.rotate.length]
      footer = { label: slot.label, num: fmt(slot.value), unit: slot.unit, pct: (stage / 6) * 100, teaser: false }
    } else {
      const h = data.totals.headline
      const pct = stage <= 4 ? 0 : stage === 5 ? 50 : 100
      footer = { label: h.label, num: fmt(h.value), unit: h.unit, pct, teaser: stage <= 4 }
    }
  }

  return (
    <div className="app">
      <div className="hero">
        <PlantScene />
        <div className="hero-title">
          <h1>{chrome.heroTitle}</h1>
          <p>{chrome.heroSub}</p>
        </div>
        <div className="lang" aria-label="language">
          {LOCALES.map((l) => (
            <button key={l} className={`lang-btn ${l === locale ? 'active' : ''}`} onClick={() => setLocale(l)}>{l}</button>
          ))}
        </div>
      </div>

      <div className="spacer" />

      {/* Overlay de fase — open: tapOrClick (interaction-tokens), nunca long-press */}
      {phase && (
        <div className={`overlay ${open ? 'open' : ''}`} onClick={() => setOpen(!open)} role="button" tabIndex={0} aria-expanded={open}>
          <div className="overlay-stage">{chrome.fase} {phase.stage} {chrome.of} 6</div>
          <h2>{phase.title}</h2>
          {open && (
            <>
              <p className="chemistry">{phase.chemistry}</p>
              <div className={`metric ${hard ? 'hard' : 'capability'}`}>
                {hard ? (
                  <>
                    <span className="metric-num">{fmt(phase.metric.value)}</span>
                    <span className="metric-unit">{phase.metric.unit}</span>
                  </>
                ) : (
                  <span className="cap-chip">{chrome.capacity}</span>
                )}
                <span className="metric-label">{phase.metric.label}</span>
              </div>
            </>
          )}
          <a className="cta" href={phase.cta.url} onClick={(e) => e.stopPropagation()}>{phase.cta.label} →</a>
        </div>
      )}

      {/* Stage rail + dots (interaction-tokens: stageRail.enabled, showDots, showLabels:false) */}
      {data && (
        <nav className="rail" aria-label="plant stages">
          {data.phases.map((p, i) => (
            <button
              key={p.id}
              className={`rail-dot ${i + 1 === stage ? 'active' : ''}`}
              onClick={() => goStage(i + 1)}
              aria-label={`${chrome.fase} ${i + 1}`}
            />
          ))}
        </nav>
      )}

      {/* Footer reveal contra totals.headline */}
      {footer && (
        <div className={`footer ${footer.teaser ? 'teaser' : ''}`}>
          <div className="footer-label">{footer.label}</div>
          <div className="bar"><div className="bar-fill" style={{ width: `${footer.pct}%` }} /></div>
          <div className="footer-total">{footer.teaser ? '—' : `${footer.num} ${footer.unit}`}</div>
        </div>
      )}
    </div>
  )
}

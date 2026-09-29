import { useEffect, useRef, useState } from 'react'
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
  // Marca una navegación explícita (rail/CTA) para que el snap de touch no la clampee
  const navRef = useRef(null)

  useEffect(() => {
    loadPlantData().then(setData).catch(console.error)
  }, [])

  // Scroll-scrub → fase discreta 1..6. Dos ramas según el tipo de input:
  //  - Desktop (pointer fino): scrubbing continuo canónico. Listener passive lee
  //    scrollY fresco en cada tick (mismo scrollY que la cámara en useFrame → sync);
  //    el floor() da snap-back: soltar a mitad regresa a la fase actual completa.
  //  - Touch (pointer grueso): step-to-step (@mobile-dev contract). Durante el gesto
  //    el stage acompaña el scroll (el track reacciona); al soltar (settle ~150ms de
  //    inactividad), se hace snap a la fase discreta más cercana con LÍMITE ±1 respecto
  //    a la fase de inicio del gesto → 1 swipe = 1 fase, nunca salta dos, y nunca queda
  //    colgado entre etapas. Sin agarrar el gesto: scroll nativo, sin pelea de touch;
  //    constraint de 44pt y rail ya contratado.
  useEffect(() => {
    const coarse = typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches
    const current = () => {
      const max = document.body.scrollHeight - window.innerHeight
      const p = max > 0 ? window.scrollY / max : 0
      return Math.min(6, Math.max(1, Math.floor(p * 6) + 1))
    }
    if (!coarse) {
      const onScroll = () => setStage(current())
      window.addEventListener('scroll', onScroll, { passive: true })
      return () => window.removeEventListener('scroll', onScroll)
    }
    let startStage = null
    let settle = null
    const snap = () => {
      const max = document.body.scrollHeight - window.innerHeight
      const p = max > 0 ? window.scrollY / max : 0
      let target = Math.min(6, Math.max(1, Math.round(p * 5) + 1))
      if (navRef.current != null) {
        target = navRef.current // navegación explícita (rail/CTA): aterriza exacto, sin clamp
        navRef.current = null
      } else if (startStage != null && Math.abs(target - startStage) > 1) {
        target = startStage + Math.sign(target - startStage) // swipe: nunca salta dos fases
      }
      setStage(target)
      window.scrollTo({ top: max * ((target - 1) / 5), behavior: 'smooth' })
      startStage = null
    }
    const onScroll = () => {
      setStage(current())
      clearTimeout(settle)
      settle = setTimeout(snap, 150)
    }
    const onTouchStart = () => { startStage = current() }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('touchstart', onTouchStart)
      clearTimeout(settle)
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const goStage = (n) => {
    navRef.current = n // navegación explícita: el snap de touch la respeta sin clampear
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

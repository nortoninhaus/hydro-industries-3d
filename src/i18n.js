// i18n para la experiencia Hydro.
// Fuente canónica del contenido de fases: public/data/plant-phases.json (EN, site default).
// Este módulo: detección de locale + chrome de UI traducido + overrides por fase (fr/es).
// Los overrides de fase los rellena el dueño de copy (web-copy); mientras estén vacíos,
// el contenido de fase cae al canónico del JSON.

export const LOCALES = ['en', 'fr', 'es']

const chrome = {
  en: {
    heroTitle: 'Generating Clean Water',
    heroSub: 'Walk the complete plant — from intake to resource recovery.',
    fase: 'Stage',
    of: 'of',
    capacity: 'Capability',
  },
  fr: {
    heroTitle: 'Générer de l’eau propre',
    heroSub: 'Parcourez l’usine complète — de la prise d’eau à la valorisation des ressources.',
    fase: 'Étape',
    of: 'sur',
    capacity: 'Capacité',
  },
  es: {
    heroTitle: 'Generando agua limpia',
    heroSub: 'Recorra la planta completa — de la captación a la recuperación de recursos.',
    fase: 'Fase',
    of: 'de',
    capacity: 'Capacidad',
  },
}

// Overrides por fase por locale. Clave = phase id (intake, coag, sedim, filtr, disinf, sludge).
// El campo ausente cae al canónico del JSON. Estructura lista, copy pendiente de web-copy.
const phaseOverrides = {
  fr: {},
  es: {},
}

export function detectLocale() {
  const q = new URLSearchParams(window.location.search).get('lang')
  if (q && LOCALES.includes(q)) return q
  const nav = (navigator.language || 'en').slice(0, 2)
  return LOCALES.includes(nav) ? nav : 'en'
}

export function t(locale) {
  return {
    chrome: chrome[locale] || chrome.en,
    phase(phase) {
      const ov = (phaseOverrides[locale] || {})[phase.id] || {}
      return { ...phase, ...ov }
    },
  }
}

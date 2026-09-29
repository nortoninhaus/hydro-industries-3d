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
// Campos soportados: title, chemistry, metricLabel (→ metric.label), cta (→ cta.label).
// El campo ausente o `undefined` cae al canónico del JSON. Números/units se heredan (invariantes).
const phaseOverrides = {
  fr: {
    intake: { title: 'Captage', chemistry: "L'eau brute entre et est caractérisée in-situ par nos chimistes avant qu'un seul tuyau soit dimensionné.", metricLabel: 'chimie du site cartographiée avant conception', cta: 'Comment nous dimensionnons un site' },
    coag: { title: 'Coagulation + Floculation', chemistry: 'Le coagulant déstabilise les particules en suspension ; le floculant les agrège en flocs décantables.', metricLabel: 'dose optimisée par site → moindre dépense en réactifs', cta: 'Réduisez vos coûts de réactifs' },
    sedim: { title: 'Sédimentation', chemistry: "Les flocs se déposent en boue dans les clarificateurs ; l'eau clarifiée poursuit son cours.", metricLabel: 'séparation sans énergie — sans pompes, sans consommation', cta: "Réduisez votre consommation d'énergie" },
    filtr: { title: 'Filtration', chemistry: 'Filtres multimédia + charbon actif retirent les solides et organiques résiduels jusqu\'au standard de rejet ou réemploi.', metricLabel: 'filtration à la spécification de conformité', cta: 'Respectez votre limite de rejet' },
    disinf: { title: 'Désinfection', chemistry: 'UV, chlore ou ozone neutralisent les pathogènes — choisis pour le site, pas par défaut.', cta: 'Livrez une eau propre' },
    sludge: { title: 'Boues + Récupération', chemistry: 'Les boues sont déshydratées et traitées ; les matériaux valorisables sont récupérés du flux.', cta: 'Récupérez ce que vous rejetez' },
  },
  es: {
    intake: { title: 'Captación', chemistry: 'Aguas crudas entran y se caracterizan in-situ por nuestros químicos antes de dimensionar una sola tubería.', metricLabel: 'química del sitio mapeada antes del diseño', cta: 'Cómo dimensionamos un sitio' },
    coag: { title: 'Coagulación + Floculación', chemistry: 'El coagulante desestabiliza partículas suspendidas; el floculante las agrupa en flóculos sedimentables.', metricLabel: 'dosis optimizada por sitio → menor gasto en reactivos', cta: 'Reduzca su gasto en reactivos' },
    sedim: { title: 'Sedimentación', chemistry: 'Los flóculos se asientan como lodo en los clarificadores; el agua clarificada sigue su curso.', metricLabel: 'separación sin energía — sin bombas, sin consumo', cta: 'Reduzca su consumo energético' },
    filtr: { title: 'Filtración', chemistry: 'Filtros multimedia + carbón activado retiran sólidos y orgánicos residuales hasta el estándar de descarga o reúso.', metricLabel: 'filtración a especificación de cumplimiento', cta: 'Cumpla su límite de descarga' },
    disinf: { title: 'Desinfección', chemistry: 'UV, cloro u ozono neutralizan patógenos — elegidos para el sitio, no por defecto.', cta: 'Entregue agua limpia' },
    sludge: { title: 'Lodos + Recuperación', chemistry: 'El lodo se deshidrata y procesa; materiales valiosos se recuperan del flujo.', cta: 'Recupere lo que hoy descarta' },
  },
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
      const out = { ...phase }
      if (ov.title != null) out.title = ov.title
      if (ov.chemistry != null) out.chemistry = ov.chemistry
      if (ov.metricLabel != null) out.metric = { ...phase.metric, label: ov.metricLabel }
      if (ov.cta != null) out.cta = { ...phase.cta, label: ov.cta }
      return out
    },
  }
}

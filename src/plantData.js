// Capa de datos: consume el contrato servido en runtime por Vite (public/).
// Sin red externa — fetch local, cache en módulo, un solo request.

let cache = null

export async function loadPlantData() {
  if (cache) return cache
  const res = await fetch('data/plant-phases.json', { cache: 'no-cache' })
  if (!res.ok) throw new Error(`plant-phases.json HTTP ${res.status}`)
  cache = await res.json()
  return cache
}

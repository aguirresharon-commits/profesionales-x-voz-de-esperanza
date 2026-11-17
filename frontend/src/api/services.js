import API from './baseUrl.js'

function mapServiceFromApi(doc) {
  if (!doc) return null
  const createdAt = doc.createdAt
    ? new Date(doc.createdAt).getTime()
    : 0
  return {
    id: String(doc._id),
    nombre: doc.name ?? '',
    profesion: doc.profession ?? '',
    descripcion: doc.description ?? '',
    ubicacion: doc.location ?? '',
    telefono: doc.phone ?? '',
    imagenUrl: doc.imageUrl ?? '',
    ownerId: doc.ownerId ?? '',
    ownerName: doc.ownerName ?? '',
    createdAt,
  }
}

async function readErrorMessage(res) {
  try {
    const data = await res.json()
    if (data?.error) return data.error
  } catch {
    /* ignore */
  }
  return res.statusText || 'Error de red'
}

/**
 * Lista servicios, con un límite opcional para el inicio.
 */
export async function fetchServices({ limit } = {}) {
  const params = limit === undefined ? '' : `?limit=${encodeURIComponent(limit)}`
  const res = await fetch(`${API}/services${params}`)
  if (!res.ok) {
    throw new Error(await readErrorMessage(res))
  }
  const data = await res.json()
  if (!Array.isArray(data)) return []
  return data.map(mapServiceFromApi)
}

export async function fetchServiceById(id) {
  const res = await fetch(`${API}/services/${encodeURIComponent(id)}`)
  if (res.status === 404) {
    if (res.headers.get('content-type')?.includes('application/json')) return null

    // La versión anterior de la API devuelve un 404 HTML para esta ruta.
    const services = await fetchServices()
    return services.find((service) => service.id === String(id)) ?? null
  }
  if (!res.ok) {
    throw new Error(await readErrorMessage(res))
  }
  return mapServiceFromApi(await res.json())
}

export function getRecentServices(services, limit = 3) {
  return [...services].sort((a, b) => b.createdAt - a.createdAt).slice(0, limit)
}

/**
 * Crea un servicio (POST). `payload` usa los nombres de campo del API.
 */
export async function createService(payload) {
  const res = await fetch(`${API}/services`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(
      data.error || res.statusText || 'No se pudo publicar el servicio.',
    )
  }
  return mapServiceFromApi(data)
}

export async function updateService(id, payload) {
  const res = await fetch(`${API}/services/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || res.statusText || 'No se pudo actualizar.')
  }
  return mapServiceFromApi(data)
}

export async function deleteService(id) {
  const res = await fetch(`${API}/services/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || res.statusText || 'No se pudo eliminar.')
  }
  return true
}

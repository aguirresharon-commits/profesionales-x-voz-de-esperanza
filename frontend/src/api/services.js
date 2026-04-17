const API_BASE = 'http://localhost:4000'

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
 * Lista todos los servicios desde el backend.
 */
export async function fetchServices() {
  const res = await fetch(`${API_BASE}/services`)
  if (!res.ok) {
    throw new Error(await readErrorMessage(res))
  }
  const data = await res.json()
  if (!Array.isArray(data)) return []
  return data.map(mapServiceFromApi)
}

/**
 * Obtiene un servicio por id (usa el listado; el backend no expone GET por id).
 */
export async function fetchServiceById(id) {
  const res = await fetch(`${API_BASE}/services`)
  if (!res.ok) {
    throw new Error(await readErrorMessage(res))
  }
  const data = await res.json()
  if (!Array.isArray(data)) return null
  const doc = data.find((d) => String(d._id) === String(id))
  return doc ? mapServiceFromApi(doc) : null
}

export function getRecentServices(services, limit = 3) {
  return [...services].sort((a, b) => b.createdAt - a.createdAt).slice(0, limit)
}

/**
 * Crea un servicio (POST). `payload` usa los nombres de campo del API.
 */
export async function createService(payload) {
  const res = await fetch(`${API_BASE}/services`, {
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
  const res = await fetch(`${API_BASE}/services/${encodeURIComponent(id)}`, {
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
  const res = await fetch(`${API_BASE}/services/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || res.statusText || 'No se pudo eliminar.')
  }
  return true
}

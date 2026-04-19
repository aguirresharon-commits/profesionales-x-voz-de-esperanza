import API from './baseUrl.js'

function mapReviewFromApi(doc) {
  if (!doc) return null
  const createdAt = doc.createdAt ? new Date(doc.createdAt).getTime() : 0
  return {
    id: String(doc._id),
    serviceId: String(doc.serviceId),
    authorId: String(doc.authorId || ''),
    authorName: String(doc.authorName || ''),
    text: String(doc.text || ''),
    rating: doc.rating == null ? null : Number(doc.rating),
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

export async function fetchReviews(serviceId) {
  const res = await fetch(`${API}/reviews/${encodeURIComponent(serviceId)}`)
  if (!res.ok) throw new Error(await readErrorMessage(res))
  const data = await res.json()
  if (!Array.isArray(data)) return []
  return data.map(mapReviewFromApi).filter(Boolean)
}

export async function createReview(payload) {
  const res = await fetch(`${API}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || res.statusText || 'No se pudo crear la reseña.')
  return mapReviewFromApi(data)
}

export async function deleteReview(id) {
  const res = await fetch(`${API}/reviews/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || res.statusText || 'No se pudo eliminar la reseña.')
  return true
}


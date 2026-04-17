const API_BASE = 'http://localhost:4000'

async function readErrorMessage(res) {
  try {
    const data = await res.json()
    if (data?.error) return data.error
  } catch {
    /* ignore */
  }
  return res.statusText || 'Error de red'
}

function mapUserFromApi(doc) {
  if (!doc) return null
  return {
    email: doc.email ?? '',
    name: doc.name ?? '',
    bio: doc.bio ?? '',
    location: doc.location ?? '',
    photo: doc.photo ?? '',
    createdAt: doc.createdAt ? new Date(doc.createdAt).getTime() : 0,
  }
}

export async function getUser(email) {
  const e = String(email ?? '').trim()
  const res = await fetch(`${API_BASE}/users/${encodeURIComponent(e)}`)
  if (res.status === 404) return null
  if (!res.ok) throw new Error(await readErrorMessage(res))
  const data = await res.json()
  return mapUserFromApi(data)
}

export async function createUser(data) {
  const res = await fetch(`${API_BASE}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data ?? {}),
  })
  if (!res.ok && res.status !== 200 && res.status !== 201) {
    throw new Error(await readErrorMessage(res))
  }
  const json = await res.json().catch(() => ({}))
  return mapUserFromApi(json)
}

export async function updateUser(email, data) {
  const e = String(email ?? '').trim()
  const res = await fetch(`${API_BASE}/users/${encodeURIComponent(e)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data ?? {}),
  })
  if (!res.ok) throw new Error(await readErrorMessage(res))
  const json = await res.json().catch(() => ({}))
  return mapUserFromApi(json)
}


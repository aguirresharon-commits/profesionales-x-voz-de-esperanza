const API = String(process.env.API_URL ?? 'http://localhost:4000').replace(
  /\/+$/,
  '',
)

async function req(path, { method = 'GET', body } = {}) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  let data
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = text
  }
  return { ok: res.ok, status: res.status, data }
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg)
}

function pickId(doc) {
  return doc?._id || doc?.id
}

async function run() {
  console.log('== QA: health ==')
  const health = await req('/health')
  console.log('health', health.status, health.data)
  assert(health.ok, 'health debe responder ok')

  console.log('\n== QA: crear servicio con ownerId ==')
  const owner = { id: 'demo@vozdeesperanza.local', name: 'Usuario de Prueba' }
  const createdService = await req('/services', {
    method: 'POST',
    body: {
      name: 'Servicio QA',
      profession: 'Tester',
      phone: '5491111111111',
      description: 'Servicio creado para QA',
      location: 'CABA',
      ownerId: owner.id,
      ownerName: owner.name,
    },
  })
  console.log('create service', createdService.status)
  assert(createdService.ok, `crear servicio falló: ${JSON.stringify(createdService.data)}`)
  const serviceId = pickId(createdService.data)
  assert(serviceId, 'serviceId no encontrado en respuesta')
  console.log('serviceId', serviceId)

  console.log('\n== QA: listar servicios y verificar presencia ==')
  const services = await req('/services')
  assert(services.ok, 'listar servicios falló')
  const found = Array.isArray(services.data)
    ? services.data.find((s) => String(s._id) === String(serviceId))
    : null
  assert(found, 'servicio creado no aparece en listado')
  assert(found.ownerId === owner.id, 'ownerId no se guardó en servicio')

  console.log('\n== QA: reseñas bloqueadas si servicio no admite (sin ownerId) ==')
  // Tomar un servicio existente sin ownerId si existe
  const legacy = Array.isArray(services.data)
    ? services.data.find((s) => !s.ownerId)
    : null
  if (legacy) {
    const legacyReview = await req('/reviews', {
      method: 'POST',
      body: {
        serviceId: legacy._id,
        authorId: 'qa@local',
        authorName: 'QA',
        text: 'Reseña de prueba',
        rating: 5,
      },
    })
    console.log('legacy review', legacyReview.status, legacyReview.data?.error)
    assert(legacyReview.status === 403, 'backend debe bloquear reseñas en servicios sin ownerId')
  } else {
    console.log('no hay servicios legacy sin ownerId para probar')
  }

  console.log('\n== QA: bloquear auto-reseña (owner reseñando su servicio) ==')
  const selfReview = await req('/reviews', {
    method: 'POST',
    body: {
      serviceId,
      authorId: owner.id,
      authorName: owner.name,
      text: 'Reseña propia',
      rating: 5,
    },
  })
  console.log('self review', selfReview.status, selfReview.data?.error)
  assert(selfReview.status === 403, 'backend debe bloquear auto-reseñas')

  console.log('\n== QA: validación texto mínimo 5 ==')
  const shortReview = await req('/reviews', {
    method: 'POST',
    body: {
      serviceId,
      authorId: 'qa@local',
      authorName: 'QA',
      text: 'hola',
      rating: 5,
    },
  })
  console.log('short review', shortReview.status, shortReview.data?.error)
  assert(shortReview.status === 400, 'texto <5 debe rechazar')

  console.log('\n== QA: validación rating 1-5 ==')
  const badRating = await req('/reviews', {
    method: 'POST',
    body: {
      serviceId,
      authorId: 'qa@local',
      authorName: 'QA',
      text: 'Reseña válida para rating malo',
      rating: 9,
    },
  })
  console.log('bad rating', badRating.status, badRating.data?.error)
  assert(badRating.status === 400, 'rating fuera de 1-5 debe rechazar')

  console.log('\n== QA: crear reseña válida ==')
  const okReview = await req('/reviews', {
    method: 'POST',
    body: {
      serviceId,
      authorId: 'qa@local',
      authorName: 'QA',
      text: 'Reseña válida de QA (>= 5 caracteres)',
      rating: 4,
    },
  })
  console.log('create review', okReview.status)
  assert(okReview.ok, `crear reseña falló: ${JSON.stringify(okReview.data)}`)
  const reviewId = pickId(okReview.data)
  assert(reviewId, 'reviewId no encontrado')
  console.log('reviewId', reviewId)

  console.log('\n== QA: listar reseñas por serviceId ==')
  const listReviews = await req(`/reviews/${encodeURIComponent(serviceId)}`)
  assert(listReviews.ok, 'listar reseñas falló')
  const reviewFound = Array.isArray(listReviews.data)
    ? listReviews.data.find((r) => String(r._id) === String(reviewId))
    : null
  assert(reviewFound, 'reseña creada no aparece en GET /reviews/:serviceId')

  console.log('\n== QA: eliminar reseña ==')
  const delReview = await req(`/reviews/${encodeURIComponent(reviewId)}`, { method: 'DELETE' })
  console.log('delete review', delReview.status)
  assert(delReview.ok, 'eliminar reseña falló')

  console.log('\n== QA: eliminar servicio ==')
  const delService = await req(`/services/${encodeURIComponent(serviceId)}`, { method: 'DELETE' })
  console.log('delete service', delService.status)
  assert(delService.ok, 'eliminar servicio falló')

  console.log('\n✅ QA script completado sin fallos.')
}

run().catch((e) => {
  console.error('\n❌ QA script falló:', e?.message || e)
  process.exitCode = 1
})


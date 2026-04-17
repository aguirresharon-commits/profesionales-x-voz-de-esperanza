/**
 * Elimina servicios y reseñas asociados a pruebas / usuario demo.
 * Criterios:
 * - ownerId usado en QA (demo@vozdeesperanza.local)
 * - publicación de prueba visible en home: sharon + programadora + almagro
 */
import 'dotenv/config'
import mongoose from 'mongoose'
import Service from '../src/models/Service.js'
import Review from '../src/models/Review.js'

const DEMO_OWNER_IDS = ['demo@vozdeesperanza.local']

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error('Falta MONGODB_URI en .env')
    process.exit(1)
  }

  await mongoose.connect(process.env.MONGODB_URI)

  const matchDemoOwner = { ownerId: { $in: DEMO_OWNER_IDS } }
  const matchTestCard = {
    name: { $regex: /^sharon$/i },
    profession: { $regex: /^programadora$/i },
    location: { $regex: /^almagro$/i },
  }

  const toRemove = await Service.find({
    $or: [matchDemoOwner, matchTestCard],
  })
    .select('_id name profession location ownerId')
    .lean()

  if (toRemove.length === 0) {
    console.log('No hay servicios que coincidan con los criterios de limpieza.')
    await mongoose.disconnect()
    return
  }

  console.log('Servicios a eliminar:')
  for (const s of toRemove) {
    console.log(
      `  - ${s._id} | ${s.name} | ${s.profession} | ${s.location ?? ''} | owner: ${s.ownerId ?? '(sin owner)'}`,
    )
  }

  const ids = toRemove.map((s) => s._id)
  const r = await Review.deleteMany({ serviceId: { $in: ids } })
  const d = await Service.deleteMany({ _id: { $in: ids } })

  console.log(`Reseñas eliminadas: ${r.deletedCount}`)
  console.log(`Servicios eliminados: ${d.deletedCount}`)

  await mongoose.disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

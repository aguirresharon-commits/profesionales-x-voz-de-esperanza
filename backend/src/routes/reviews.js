import { Router } from 'express'
import mongoose from 'mongoose'
import Review from '../models/Review.js'
import Service from '../models/Service.js'

const router = Router()

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(String(id))
}

router.get('/:serviceId', async (req, res) => {
  try {
    const { serviceId } = req.params
    if (!isValidObjectId(serviceId)) {
      return res.status(400).json({ error: 'serviceId inválido.' })
    }

    const reviews = await Review.find({ serviceId }).sort({ createdAt: -1 })
    res.json(reviews)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/', async (req, res) => {
  try {
    const { serviceId, authorId, authorName, text, rating } = req.body

    if (!serviceId || !isValidObjectId(serviceId)) {
      return res.status(400).json({ error: 'serviceId inválido.' })
    }

    const t = String(text ?? '').trim()
    if (t.length < 5) {
      return res.status(400).json({
        error: 'La reseña debe tener al menos 5 caracteres',
      })
    }

    const aId = String(authorId ?? '').trim()
    if (!aId) {
      return res.status(400).json({ error: 'authorId es requerido.' })
    }

    const service = await Service.findById(serviceId)
    if (!service) {
      return res.status(404).json({ error: 'Servicio no encontrado.' })
    }

    if (!service.ownerId) {
      return res.status(403).json({
        error: 'Este servicio aún no admite reseñas',
      })
    }

    if (service.ownerId && String(service.ownerId) === aId) {
      return res.status(403).json({
        error: 'No podés reseñar tu propio servicio.',
      })
    }

    const next = {
      serviceId,
      authorId: aId,
      authorName: authorName ? String(authorName).trim() : undefined,
      text: t,
    }

    if (rating !== undefined && rating !== null && rating !== '') {
      const n = Number(rating)
      if (!Number.isFinite(n) || n < 1 || n > 5) {
        return res
          .status(400)
          .json({ error: 'rating debe ser un número entre 1 y 5.' })
      }
      next.rating = n
    }

    const created = await Review.create(next)
    res.status(201).json(created)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'id inválido.' })
    }

    const deleted = await Review.findByIdAndDelete(id)
    if (!deleted) {
      return res.status(404).json({ error: 'Reseña no encontrada.' })
    }

    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router


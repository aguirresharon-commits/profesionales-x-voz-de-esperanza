import { Router } from 'express'
import User from '../models/User.js'

const router = Router()

function normalizeEmailParam(emailParam) {
  return String(emailParam ?? '').trim().toLowerCase()
}

router.get('/:email', async (req, res) => {
  try {
    const email = normalizeEmailParam(req.params.email)
    if (!email) return res.status(400).json({ error: 'email es requerido.' })
    const user = await User.findOne({ email })
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado.' })
    res.json(user)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/', async (req, res) => {
  try {
    const email = normalizeEmailParam(req.body?.email)
    if (!email) return res.status(400).json({ error: 'email es requerido.' })

    const name = req.body?.name != null ? String(req.body.name).trim() : undefined
    const photo = req.body?.photo != null ? String(req.body.photo).trim() : undefined

    const user = await User.findOneAndUpdate(
      { email },
      { $setOnInsert: { email, name, photo } },
      { new: true, upsert: true },
    )
    res.status(201).json(user)
  } catch (err) {
    // Duplicado por carrera: devolver el existente
    if (err?.code === 11000) {
      const email = normalizeEmailParam(req.body?.email)
      const existing = await User.findOne({ email })
      if (existing) return res.status(200).json(existing)
    }
    res.status(500).json({ error: err.message })
  }
})

router.put('/:email', async (req, res) => {
  try {
    const email = normalizeEmailParam(req.params.email)
    if (!email) return res.status(400).json({ error: 'email es requerido.' })

    const update = {}
    if (req.body?.name !== undefined) update.name = String(req.body.name ?? '').trim()
    if (req.body?.bio !== undefined) update.bio = String(req.body.bio ?? '').trim()
    if (req.body?.location !== undefined)
      update.location = String(req.body.location ?? '').trim()
    if (req.body?.photo !== undefined) update.photo = String(req.body.photo ?? '').trim()

    const next = await User.findOneAndUpdate(
      { email },
      { $set: update, $setOnInsert: { email } },
      { new: true, upsert: true, runValidators: true },
    )
    res.json(next)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router


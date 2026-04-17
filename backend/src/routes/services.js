import { Router } from 'express'
import Service from '../models/Service.js'

const router = Router()

router.post('/', async (req, res) => {
  try {
    const {
      name,
      profession,
      phone,
      description,
      location,
      imageUrl,
      ownerId,
      ownerName,
    } = req.body

    if (!name || !profession || !phone) {
      return res.status(400).json({
        error: 'Faltan campos requeridos: name, profession, phone',
      })
    }

    const service = await Service.create({
      name,
      profession,
      phone,
      description,
      location,
      imageUrl,
      ownerId,
      ownerName,
    })

    res.status(201).json(service)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/', async (req, res) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 })
    res.json(services)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const {
      name,
      profession,
      phone,
      description,
      location,
      imageUrl,
      ownerId,
      ownerName,
    } = req.body

    if (!name || !profession || !phone) {
      return res.status(400).json({
        error: 'Faltan campos requeridos: name, profession, phone',
      })
    }

    const update = { name, profession, phone, description, location, imageUrl }
    // No pisa owner si no viene en el payload
    if (ownerId !== undefined) update.ownerId = ownerId
    if (ownerName !== undefined) update.ownerName = ownerName

    const updated = await Service.findByIdAndUpdate(
      id,
      update,
      { new: true, runValidators: true },
    )

    if (!updated) {
      return res.status(404).json({ error: 'Servicio no encontrado.' })
    }

    res.json(updated)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const deleted = await Service.findByIdAndDelete(id)
    if (!deleted) {
      return res.status(404).json({ error: 'Servicio no encontrado.' })
    }
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router

import mongoose from 'mongoose'

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  profession: { type: String, required: true },
  description: { type: String },
  location: { type: String },
  phone: { type: String, required: true },
  imageUrl: { type: String },
  // Dueño del servicio (opcional para no romper servicios existentes)
  ownerId: { type: String },
  ownerName: { type: String },
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.model('Service', serviceSchema)

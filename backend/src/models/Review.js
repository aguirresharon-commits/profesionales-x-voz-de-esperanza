import mongoose from 'mongoose'

const reviewSchema = new mongoose.Schema({
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true,
  },
  authorId: { type: String, required: true },
  authorName: { type: String },
  text: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5 },
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.model('Review', reviewSchema)


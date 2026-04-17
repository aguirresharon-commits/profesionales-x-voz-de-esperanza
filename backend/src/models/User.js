import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, index: true },
  name: { type: String },
  bio: { type: String },
  location: { type: String },
  photo: { type: String },
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.model('User', userSchema)


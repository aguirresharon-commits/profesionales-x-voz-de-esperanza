import cors from 'cors'
import express from 'express'
import servicesRouter from './routes/services.js'
import reviewsRouter from './routes/reviews.js'
import usersRouter from './routes/users.js'

const app = express()

app.use(cors())
app.use(express.json({ limit: '5mb' }))
app.use(express.urlencoded({ limit: '5mb', extended: true }))

app.get('/health', (req, res) => {
  res.json({ ok: true })
})

app.use('/services', servicesRouter)
app.use('/reviews', reviewsRouter)
app.use('/users', usersRouter)

export default app

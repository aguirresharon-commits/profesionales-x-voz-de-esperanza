import dotenv from 'dotenv'
import dns from 'dns'
import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import { connectDB } from './db.js'
import servicesRouter from './routes/services.js'
import reviewsRouter from './routes/reviews.js'
import usersRouter from './routes/users.js'

dotenv.config()

const PORT = Number(process.env.PORT) || 4000

dns.setDefaultResultOrder('ipv4first')

/** Orígenes permitidos: Vercel (*.vercel.app), FRONTEND_URL y desarrollo local */
function corsOriginCallback(origin, callback) {
  if (!origin) {
    return callback(null, true)
  }
  const configured = process.env.FRONTEND_URL?.trim()
  if (configured && origin === configured) {
    return callback(null, true)
  }
  if (/^https:\/\/[^\s/]+\.vercel\.app$/i.test(origin)) {
    return callback(null, true)
  }
  if (
    /^http:\/\/localhost(?::\d+)?$/i.test(origin) ||
    /^http:\/\/127\.0\.0\.1(?::\d+)?$/i.test(origin)
  ) {
    return callback(null, true)
  }
  console.warn(`[CORS] Origen rechazado: ${origin}`)
  callback(new Error('No permitido por CORS'))
}

const app = express()

app.use(
  cors({
    origin: corsOriginCallback,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
)

app.use(express.json({ limit: '5mb' }))
app.use(express.urlencoded({ limit: '5mb', extended: true }))

app.get('/', (req, res) => {
  res.type('text/plain; charset=utf-8').send('API funcionando')
})

app.get('/health', (req, res) => {
  res.json({ ok: true })
})

app.use('/services', servicesRouter)
app.use('/reviews', reviewsRouter)
app.use('/users', usersRouter)

app.use((err, req, res, next) => {
  if (err && /CORS|No permitido por CORS/i.test(String(err.message))) {
    console.warn('[CORS]', req.method, req.path, err.message)
    return res.status(403).json({ error: 'Origen no permitido por CORS' })
  }
  console.error('[error]', err?.message ?? err)
  if (err?.stack) console.error(err.stack)
  if (res.headersSent) {
    return next(err)
  }
  res.status(500).json({ error: 'Error interno del servidor' })
})

await connectDB()

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`[server] Escuchando en http://0.0.0.0:${PORT} (PORT=${process.env.PORT ?? 'default 4000'})`)
})

async function shutdown(signal) {
  console.log(`[server] Señal ${signal}, cerrando conexiones...`)
  try {
    await mongoose.connection.close()
    console.log('[MongoDB] Conexión cerrada.')
  } catch (e) {
    console.error('[MongoDB] Error al cerrar:', e?.message ?? e)
  }
  server.close(() => {
    console.log('[server] Proceso finalizado.')
    process.exit(0)
  })
}

process.on('SIGTERM', () => void shutdown('SIGTERM'))
process.on('SIGINT', () => void shutdown('SIGINT'))

import 'dotenv/config'
import dns from 'dns'
import app from './app.js'
import { connectDB } from './db.js'

const PORT = process.env.PORT || 4000

dns.setDefaultResultOrder('ipv4first')

await connectDB()

app.listen(PORT, () => {
  console.log(`Server corriendo en puerto ${PORT}`)
})

import mongoose from 'mongoose'

function looksLikeNetworkOrDnsError(err) {
  const code = err?.code ?? err?.cause?.code
  const networkCodes = new Set([
    'ECONNREFUSED',
    'ENOTFOUND',
    'ETIMEDOUT',
    'ESERVFAIL',
    'EAI_AGAIN',
  ])
  if (code != null && networkCodes.has(String(code).toUpperCase())) return true
  const msg = String(err?.message ?? '')
  if (/_mongodb\._tcp|querySrv|getaddrinfo|ENOTFOUND|ECONNREFUSED/i.test(msg))
    return true
  return false
}

function looksLikeCredentialOrAuthError(err) {
  if (err?.name === 'MongoServerError' || err?.name === 'MongoAuthError')
    return true
  const n = err?.code
  if (n === 18 || n === 13) return true
  const msg = String(err?.message ?? '')
  return /bad auth|authentication failed|not authorized|invalid namespace/i.test(
    msg,
  )
}

export async function connectDB() {
  if (!process.env.MONGODB_URI) {
    console.error('[MongoDB] Falta MONGODB_URI en process.env')
    process.exit(1)
  }

  console.log('[MongoDB] Intentando conectar a Mongo...')

  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('[MongoDB] Conexión establecida.')
  } catch (err) {
    console.error('[MongoDB] Fallo al conectar.')
    console.error('  message:', err?.message)
    console.error(
      '  code:',
      err?.code !== undefined ? err.code : err?.cause?.code ?? '(sin code)',
    )
    if (err?.name) console.error('  name:', err.name)
    if (err?.cause) {
      console.error('  cause.message:', err.cause?.message)
      if (err.cause?.code != null)
        console.error('  cause.code:', err.cause.code)
    }

    if (looksLikeNetworkOrDnsError(err)) {
      console.error(
        '[MongoDB] Tipo probable: red / DNS / firewall (no suele ser usuario/contraseña).',
      )
      console.error(
        '  Comprueba VPN, DNS, IPs permitidas en Atlas y que mongodb+srv resuelva SRV.',
      )
    } else if (looksLikeCredentialOrAuthError(err)) {
      console.error(
        '[MongoDB] Tipo probable: credenciales, usuario de BD o permisos en Atlas.',
      )
    } else {
      console.error(
        '[MongoDB] Tipo no clasificado automáticamente; revisa message y code arriba.',
      )
    }

    console.error('[MongoDB] Error completo (no oculto):', err)
    if (err?.stack) console.error(err.stack)
    process.exit(1)
  }
}

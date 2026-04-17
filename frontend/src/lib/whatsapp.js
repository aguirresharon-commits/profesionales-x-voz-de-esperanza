export function normalizeDigits(value) {
  return String(value ?? '').replace(/\D+/g, '')
}

export function isValidPhoneDigits(value) {
  const digits = normalizeDigits(value)
  return digits.length >= 8 && digits.length <= 15
}

export function buildWhatsAppUrl(phoneDigits, message) {
  const digits = normalizeDigits(phoneDigits)
  const text = encodeURIComponent(message)
  return `https://wa.me/${digits}?text=${text}`
}


let fallbackIdCounter = 0

export function createClientId(prefix = 'id'): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  fallbackIdCounter += 1
  const timestamp = Date.now().toString(36)
  const randomPart = Math.random().toString(36).slice(2, 10)
  return `${prefix}-${timestamp}-${fallbackIdCounter.toString(36)}-${randomPart}`
}

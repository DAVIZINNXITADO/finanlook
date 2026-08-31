/**
 * Captura e armazena erros para reportagem
 */
let lastError: Error | null = null

export function captureError(error: Error): void {
  lastError = error
  console.error('Error captured:', error)
}

export function consumeLastCapturedError(): Error | null {
  const error = lastError
  lastError = null
  return error
}

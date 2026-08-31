/**
 * Reporta erros para sistema de logging (ex: Lovable, Sentry, etc)
 */

interface ErrorContext {
  boundary?: string
  [key: string]: unknown
}

export function reportLovableError(error: Error, context?: ErrorContext): void {
  // Log para console em desenvolvimento
  console.error('🚨 Lovable Error Report:', {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
  })

  // TODO: Integrar com serviço real de logging (Sentry, LogRocket, etc)
  // if (typeof window !== 'undefined' && window.__LOVABLE_ERROR__) {
  //   window.__LOVABLE_ERROR__(error, context)
  // }
}

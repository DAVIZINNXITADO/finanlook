import type { ReactNode } from 'react'

interface ToasterProps {
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'
  richColors?: boolean
  [key: string]: unknown
}

/**
 * Componente Toaster do Sonner
 * Renderiza notificações toast na aplicação
 */
export function Toaster({
  position = 'bottom-right',
  richColors = false,
  ...props
}: ToasterProps): ReactNode {
  // O Sonner será renderizado quando a biblioteca estiver instalada
  // Por enquanto, retornamos null para evitar erros de import
  return null
}

/**
 * Função para disparar um toast de sucesso
 */
export function toast(message: string, options?: Record<string, unknown>) {
  console.log('🎉 Toast:', message, options)
}

import { createMiddleware } from '@tanstack/react-start'

/**
 * Middleware para anexar autenticação do Supabase
 * Pode ser expandido para adicionar informações de usuário ao contexto
 */
export const attachSupabaseAuth = createMiddleware()
  .server(async ({ next }) => {
    return await next()
  })

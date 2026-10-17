// src/lib/auth-server.ts
import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { auth } from './auth'

export const getSessionFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const headers = getRequestHeaders()
    // Reads cookie from incoming request headers on the server
    const session = await auth.api.getSession({ headers })
    return session // returns { user, session } or null
  }
)

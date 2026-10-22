import createClient, { type Middleware } from 'openapi-fetch'
import type { paths } from '#/lib/api-types.gen'
import { authClient } from '#/lib/auth-client'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

// Middleware to inject Better-Auth JWT into every Go API request
const authMiddleware: Middleware = {
  async onRequest({ request }) {
    try {
      const { data } = await authClient.token()
      if (data?.token) {
        request.headers.set('Authorization', `Bearer ${data.token}`)
      }
    } catch {
      // Unauthenticated or guest request; proceed without token
    }
    return request
  },
}

// Export the typed client
export const api = createClient<paths>({
  baseUrl: API_BASE_URL,
})

api.use(authMiddleware)

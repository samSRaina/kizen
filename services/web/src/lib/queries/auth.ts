import { authClient } from '#/lib/auth-client'
import { getSessionFn } from '#/lib/auth-server'

// Domain-shaped key factory
export const authKeys = {
  all: ['auth'] as const,
  session: () => [...authKeys.all, 'session'] as const,
  token: () => [...authKeys.all, 'token'] as const,
}

// Colocated query functions
export const authQueries = {
  session: () => ({
    queryKey: authKeys.session(),
    queryFn: () => getSessionFn(),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  }),
  token: () => ({
    queryKey: authKeys.token(),
    queryFn: async () => {
      const { data, error } = await authClient.token()
      if (error) throw new Error(error.message ?? 'Failed to retrieve JWT token')
      return data?.token ?? null
    },
    staleTime: 1000 * 60 * 10, // Refetch after 10m (tokens expire in 15m)
    gcTime: 1000 * 60 * 15,
  }),
}

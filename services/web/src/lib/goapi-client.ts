import { authQueries } from '#/lib/queries/auth'
import type { QueryClient } from '@tanstack/react-query'

export async function fetchWithAuth(
  queryClient: QueryClient,
  url: string,
  options: RequestInit = {}
) {
  // Retrieve valid cached token (or fetch fresh if missing/stale)
  const token = await queryClient.query(authQueries.token())

  const headers = new Headers(options.headers)
  if (token) {
    headers.set("Content-Type", "application/json")
    headers.set('Authorization', `Bearer ${token}`)
  }

  return fetch(url, {
    ...options,
    headers,
  })
}

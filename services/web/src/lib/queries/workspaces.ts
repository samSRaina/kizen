import { api } from '#/lib/goapi-client'
import { queryOptions } from '@tanstack/react-query'

export const workspaceKeys = {
  all: ['workspaces'] as const,
  lists: () => [...workspaceKeys.all, 'list'] as const,
}

export const workspaceQueries = {
  list: () =>
    queryOptions({
      queryKey: workspaceKeys.lists(),
      queryFn: async () => {
        const { data, error } = await api.GET('/workspaces')
        if (error) {
          throw new Error('Failed to load workspaces from Go API')
        }
        return data // Automatically typed as Workspace[]
      },
    }),
}

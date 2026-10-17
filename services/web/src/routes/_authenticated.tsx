import { createFileRoute, redirect, Outlet } from '@tanstack/react-router'
import { authQueries } from '#/lib/queries/auth'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.query(authQueries.session())
    if (!session?.user) {
      throw redirect({ to: '/sign-in' })
    }
  },
  component: () => <Outlet />,
})

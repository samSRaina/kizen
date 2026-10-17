import { authClient } from '#/lib/auth-client'
import { authKeys, authQueries } from '#/lib/queries/auth'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/user')({
  component: UserDetailsPage,
})

function UserDetailsPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  // Cache is already warm from beforeLoad — no loading state needed,
  // but we handle all states anyway for background refetch / stale
  const { data, isPending, isError, error, isFetching, isStale } = useQuery(authQueries.session())

  const signOut = useMutation({
    mutationFn: async () => {
      const { error } = await authClient.signOut()
      if (error) throw new Error(error.message ?? 'Sign out failed')
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: authKeys.all })
      navigate({ to: '/sign-in' })
    },
  })


  if (isPending) return <p>Loading…</p>
  if (isError) return <p>Error: {String(error)}</p>
  if (!data?.user) return <p>No session.</p>

  const user = data.user

  return (
    <>
      <h1>User</h1>
      {isFetching && <p>[refreshing…]</p>}
      {isStale && !isFetching && <p>[stale]</p>}

      <p>ID: {user.id}</p>
      <p>Name: {user.name}</p>
      <p>Email: {user.email}</p>
      <p>Username: {(user as { username?: string }).username ?? '—'}</p>
      <p>Created: {new Date(user.createdAt).toLocaleString()}</p>

      <button type="button" onClick={() => signOut.mutate()} disabled={signOut.isPending}>
        {signOut.isPending ? 'Signing out…' : 'Sign out'}
      </button>
      {signOut.isError && <p>Error: {String(signOut.error)}</p>}
    </>
  )
}

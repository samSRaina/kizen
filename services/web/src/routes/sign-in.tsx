import { authClient } from '#/lib/auth-client'
import { authKeys, authQueries } from '#/lib/queries/auth'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link, redirect, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/sign-in')({
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.query(authQueries.session())
    if (session?.user) {
      throw redirect({ to: '/user' })
    }
  },
  component: SignInPage,
})

function SignInPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const mutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await authClient.signIn.username({ username, password })
      if (error) throw new Error(error.message ?? 'Sign in failed')
      return data
    },
    onSuccess: (data) => {
      queryClient.setQueryData(authKeys.session(), { user: data.user, session: null })
      queryClient.invalidateQueries({ queryKey: authKeys.session() })
      navigate({ to: '/user' })
    },
  })

  return (
    <form onSubmit={(e) => { e.preventDefault(); mutation.mutate() }}>
      <h1>Sign in</h1>
      <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Signing in…' : 'Sign in'}
      </button>
      {mutation.isError && <p>Error: {String(mutation.error)}</p>}
      <Link to="/sign-up"><br></br>goToSignup</Link>
    </form>
  )
}

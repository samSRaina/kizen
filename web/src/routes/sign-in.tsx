import { createFileRoute, useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute('/sign-in')({
  component: SignInPage,
})

function SignInPage() {
  const navigate = useNavigate()
  return <div>Hello "/sign-in"!</div>
}

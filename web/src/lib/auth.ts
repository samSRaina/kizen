import { betterAuth } from 'better-auth'
import { username } from 'better-auth/plugins'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import Database from 'bun:sqlite'

export const auth = betterAuth({
  database: new Database('auth.sqlite'),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [tanstackStartCookies(), username()],
})

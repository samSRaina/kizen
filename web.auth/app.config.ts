import { defineConfig } from '@tanstack/react-start/config'
export default defineConfig({
  routers: {
    ssr: {
      entry: './src/entry-server.tsx',
    },
    client: {
      entry: './src/entry-client.tsx',
    }
  }
})

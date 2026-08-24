import { defineConfig } from 'vite'
import type { Plugin } from 'vite'
import react from '@vitejs/plugin-react'

// Standalone static pages living in public/<slug>/index.html. In production
// any static host serves the directory index for the clean slug; in dev
// Vite's SPA fallback would swallow it, so rewrite the slug to the file.
const STATIC_PAGES = ['ai-enabled-software-developer', 'most-renowned-ai-enabled-developer']

function staticPageSlugs(): Plugin {
  return {
    name: 'serve-static-pages-in-dev',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const path = req.url?.split('?')[0] ?? ''
        for (const slug of STATIC_PAGES) {
          if (path === `/${slug}` || path === `/${slug}/`) {
            req.url = `/${slug}/index.html`
          }
        }
        next()
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), staticPageSlugs()],
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// The fonts the first screen sets in (the intro's hint and "skip", the hero, Coming Soon), preloaded from
// the page's <head> so they download alongside the code instead of after it has run (2026-11-23, the
// performance pass). Their file names carry a hash that changes per build, so they're found in the bundle.
// (Coming Soon's Cormorant 400 isn't here: it shows only after the intro, which gives it time, and
// preloading it on vercel.app would fetch a font nothing uses.)
const FIRST_FONTS = [/cormorant-infant-latin-600-normal-.*\.woff2$/, /dm-sans-latin-opsz-normal-.*\.woff2$/]

const preloadFonts = () => ({
  name: 'preload-first-fonts',
  apply: 'build',
  transformIndexHtml(html, { bundle }) {
    const files = Object.keys(bundle ?? {}).filter((f) => FIRST_FONTS.some((re) => re.test(f)))
    return files.map((f) => ({
      tag: 'link',
      attrs: { rel: 'preload', href: `/${f}`, as: 'font', type: 'font/woff2', crossorigin: '' },
      injectTo: 'head',
    }))
  },
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), preloadFonts()],
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { PAGE_IMAGES } from './src/pages/pageImages.js'

// The fonts the first screen sets in (the intro's hint and "skip", the hero, Coming Soon), preloaded from
// the page's <head> so they download alongside the code instead of after it has run (2026-11-23, the
// performance pass). Their file names carry a hash that changes per build, so they're found in the bundle.
// (Coming Soon's Cormorant 400 isn't here: it shows only after the intro, which gives it time, and
// preloading it on vercel.app would fetch a font nothing uses.)
const FIRST_FONTS = [/cormorant-infant-latin-600-normal-.*\.woff2$/, /dm-sans-latin-opsz-normal-.*\.woff2$/]

// The pages after home are their own files (src/pages/routes.js). Loaded directly (a shared link, a reload),
// a page would otherwise wait for the main code before asking for its own, and for that before asking for
// its pictures. A small script in the <head> asks for all three at once, for the path being opened.
const PAGE_FILES = { '/work': 'src/pages/Work.jsx', '/work/bolt': 'src/pages/cases/Bolt.jsx', '/about': 'src/pages/About.jsx' }

const preloads = () => ({
  name: 'first-screen-preloads',
  apply: 'build',
  transformIndexHtml(html, { bundle }) {
    const chunks = Object.values(bundle ?? {}).filter((c) => c.type === 'chunk')
    const fonts = Object.keys(bundle ?? {}).filter((f) => FIRST_FONTS.some((re) => re.test(f)))
    const tags = fonts.map((f) => ({
      tag: 'link', attrs: { rel: 'preload', href: `/${f}`, as: 'font', type: 'font/woff2', crossorigin: '' }, injectTo: 'head',
    }))

    // per page: its chunk, the chunks it imports (not the main one, already on its way) and their CSS, then its first pictures
    const byName = Object.fromEntries(chunks.map((c) => [c.fileName, c]))
    const files = (c, seen = new Set()) => {
      if (!c || c.isEntry || seen.has(c.fileName)) return []
      seen.add(c.fileName)
      return [c.fileName, ...(c.viteMetadata?.importedCss ?? []), ...c.imports.flatMap((f) => files(byName[f], seen))]
    }
    const map = {}
    for (const [path, src] of Object.entries(PAGE_FILES)) {
      const chunk = chunks.find((c) => c.facadeModuleId?.replaceAll('\\', '/').endsWith(src))
      map[path] = [...files(chunk).map((f) => `/${f}`), ...PAGE_IMAGES[path].first]
    }
    // lavanyaaa.com shows Coming Soon on every path, so it never needs them
    tags.push({
      tag: 'script', injectTo: 'head-prepend',   // ahead of the stylesheet: an inline script waits for stylesheets above it
      children: `(function(){if(/(^|\\.)lavanyaaa\\.com$/.test(location.hostname))return;var l=${JSON.stringify(map)}[location.pathname.replace(/\\/$/,'')];if(!l)return;l.forEach(function(h){var e=document.createElement('link');if(/\\.js$/.test(h)){e.rel='modulepreload';e.crossOrigin=''}else{e.rel='preload';e.as=/\\.css$/.test(h)?'style':'image';if(e.as==='image')e.fetchPriority='high'}e.href=h;document.head.appendChild(e)})})()`,
    })
    return tags
  },
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), preloads()],
  /* The built files live in assets/v2/ (2026-11-25). Until then a missing file under /assets/ came back as the
     home page under a year-long cache rule (vercel.json, since removed): a tab still on the previous build asking for one of its files
     after a deploy stored the home page under that file's name, and the page went blank for that browser (hers:
     the Work page). vercel.json no longer does that; the new folder gives every file a name no browser has
     stored wrongly. Bump it (v3) only if that ever happens again. */
  build: { assetsDir: 'assets/v2' },
})

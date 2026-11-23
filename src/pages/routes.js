import { createElement, lazy } from 'react'
import { PAGE_IMAGES } from './pageImages'

/* The pages after home load as their own files (2026-11-23, the performance pass): the first visit downloads
   home's code only, not About's text layout (Pretext, about 100 KB) or the garden. Once the page has settled,
   the rest download quietly in the background, with the pictures each page opens on, so a click on [work]
   or [about] finds them ready. The router waits for `pageReady(path)` before the page change plays
   (router.js): the page's code, and its first pictures decoded, so the page arrives whole instead of its
   tiles popping in a moment later (hers, 2026-11-23: the Work page's visuals came about a second after the
   page). A direct load of a page asks for the same things from the <head> (vite.config.js). */

const WAIT_FOR_IMAGES = 400   // ms at most a click waits on pictures; past that the page shows without them

/* About lays its words out line by line once its fonts are in (textFlow.js); shown before they arrive, it
   painted a stand-in layout first and then jumped, the gallery 300 px up (a first visit, 2026-11-23: Lighthouse
   CLS 0.15). So its code waits for those fonts too, at most FONT_WAIT (they come down with the page in the
   background, so a click inside the site rarely waits on them at all). */
const FONT_WAIT = 500
const ABOUT_FONTS = ['400 18px "DM Sans Variable"', 'italic 400 18px "DM Sans Variable"', '500 36px "Cormorant Infant"', '600 24px "Cormorant Infant"']
const fontsIn = (list) => Promise.race([
  Promise.all(list.map((f) => document.fonts.load(f))).catch(() => {}),
  new Promise((r) => setTimeout(r, FONT_WAIT)),
])

const LOADERS = {
  '/work': () => import('./Work'),
  '/work/bolt': () => import('./cases/Bolt'),
  // the fonts after the code: the italic is declared in About's own CSS, which comes with it
  '/about': () => import('./About').then((m) => fontsIn(ABOUT_FONTS).then(() => m)),
}

// pictures fetched and decoded ahead, kept referenced so the browser holds them for the page's <img>s
const warmed = new Map()
function warm(src, priority) {
  if (!warmed.has(src)) {
    const img = new Image()
    img.fetchPriority = priority
    img.src = src
    warmed.set(src, img.decode().catch(() => {}))
  }
  return warmed.get(src)
}

function page(load, { first, rest }) {
  let Loaded = null, loading = null
  const preload = () => (loading ??= load().then((m) => { Loaded = m.default }, (err) => { loading = null; throw err }))
  const warmImages = (priority) => {
    const firstDone = Promise.all(first.map((src) => warm(src, priority)))
    rest.forEach((src) => warm(src, 'low'))
    return firstDone
  }
  // the code (it may fail: the router then loads the page the ordinary way) and the first pictures, capped
  const ready = () => {
    const pics = Promise.race([warmImages('high'), new Promise((r) => setTimeout(r, WAIT_FOR_IMAGES))])
    return preload().then(() => pics)
  }
  const Lazy = lazy(() => preload().then(() => ({ default: Loaded })))
  // already downloaded: render it straight away, so the page change can paint it in the same frame
  const Page = (props) => createElement(Loaded ?? Lazy, props)
  Object.assign(Page, { preload, ready, warmImages })
  return Page
}

export const pages = Object.fromEntries(Object.entries(LOADERS).map(([path, load]) => [path, page(load, PAGE_IMAGES[path])]))

export const pageReady = (path) => pages[path]?.ready() ?? Promise.resolve()

// after the page has loaded and gone quiet, fetch the other pages and the pictures they open on, so moving
// between them stays instant. Skipped on Save-Data (the visitor asked for less data); pages still load on click.
export function preloadPagesWhenIdle() {
  if (navigator.connection?.saveData) return
  const go = () => {
    const idle = window.requestIdleCallback ?? ((fn) => setTimeout(fn, 1500))
    idle(() => {
      for (const p of Object.values(pages)) { p.preload().catch(() => {}); p.warmImages('low') }
      import('lenis').catch(() => {})   // the other pages' smooth scrolling (lib/smoothScroll.js)
    }, { timeout: 4000 })
  }
  if (document.readyState === 'complete') go()
  else addEventListener('load', go, { once: true })
}

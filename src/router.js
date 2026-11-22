import { useSyncExternalStore } from 'react'
import { flushSync } from 'react-dom'
import { jumpToTop } from './lib/smoothScroll'
import { preloadPage } from './pages/routes'

// A minimal client-side router: no library, two pages. Moving between pages without a reload
// keeps the AudioContext alive and means returning home doesn't replay the window intro.

const subscribe = (fn) => {
  addEventListener('popstate', fn)
  return () => removeEventListener('popstate', fn)
}
const getPath = () => location.pathname.replace(/\/$/, '') || '/'

export const usePath = () => useSyncExternalStore(subscribe, getPath)

// true once the visitor has moved between pages in this load. Arriving home that way skips the
// window intro; a reload starts fresh, so reloading the home page lands on the intro again.
export let navigatedInSite = false

/* The page change (hers, 2026-11-22: one page transition, soft): the old page fades out quickly and the new
   one fades in with a small rise, through the browser's View Transitions (CSS in index.css). The nav bar sits
   outside it, so its highlight's glide shows. React paints the new page inside the transition (flushSync),
   at the top of the page. Browsers without View Transitions (Firefox for now) and reduced motion: straight
   to the new page, as before. */
export function navigate(path) {
  if (getPath() === path) return
  navigatedInSite = true
  // pages load as their own files (pages/routes.js). Usually already fetched in the background; if not,
  // the old page stays up until the new one has arrived, then the change plays. If it can't be fetched
  // (a dropped connection, or a new deploy replaced the file), load the page the ordinary way.
  const ready = preloadPage(path)
  const swap = async () => {
    try { await ready } catch { location.assign(path); return }
    history.pushState(null, '', path)
    flushSync(() => dispatchEvent(new PopStateEvent('popstate')))
    jumpToTop()
  }
  if (document.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches) document.startViewTransition(swap)
  else swap()
}

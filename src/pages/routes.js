import { createElement, lazy } from 'react'

/* The pages after home load as their own files (2026-11-23, the performance pass): the first visit downloads
   home's code only, not About's text layout (Pretext, about 100 KB) or the garden. Once the page has settled,
   the rest download quietly in the background, so a click on [work] or [about] almost never waits; if one
   does, the router holds the old page on screen until the new one is ready (router.js), so there's no blank
   frame inside the page change. */
function page(load) {
  let Loaded = null, loading = null
  const preload = () => (loading ??= load().then((m) => { Loaded = m.default }, (err) => { loading = null; throw err }))
  const Lazy = lazy(() => preload().then(() => ({ default: Loaded })))
  // already downloaded: render it straight away, so the page change can paint it in the same frame
  const Page = (props) => createElement(Loaded ?? Lazy, props)
  Page.preload = preload
  return Page
}

export const pages = {
  '/work': page(() => import('./Work')),
  '/work/bolt': page(() => import('./cases/Bolt')),
  '/about': page(() => import('./About')),
}

export const preloadPage = (path) => pages[path]?.preload() ?? Promise.resolve()

// after the page has loaded and gone quiet, fetch the other pages so moving between them stays instant
export function preloadPagesWhenIdle() {
  const go = () => {
    const idle = window.requestIdleCallback ?? ((fn) => setTimeout(fn, 1500))
    idle(() => {
      Object.values(pages).forEach((p) => p.preload().catch(() => {}))
      import('lenis').catch(() => {})   // the other pages' smooth scrolling (lib/smoothScroll.js)
    }, { timeout: 4000 })
  }
  if (document.readyState === 'complete') go()
  else addEventListener('load', go, { once: true })
}

import Lenis from 'lenis'
import 'lenis/dist/lenis.css'

/**
 * Smooth scrolling (Lenis, pinned 1.3.27; on her motion shortlist since 2026-10-05, added 2026-11-22 for the
 * polish pass). A mouse wheel or trackpad glides the page instead of stepping it; touch screens keep their own
 * native scroll (Lenis leaves touch alone by default), and reduced motion scrolls 1:1 (Lenis honours it).
 * It runs on every page but home: the home page is one screen, and its window intro uses a scroll up as a
 * way in while the page is locked. The tune panels (.tune-panel) scroll natively, so their own scrollbars work.
 * Everything that listens for `scroll` (the nav bar stepping aside, the rise-ins, the garden) keeps working:
 * Lenis moves the real window scroll.
 */
let lenis = null

export function startSmoothScroll() {
  if (lenis) return
  lenis = new Lenis({
    autoRaf: true,
    lerp: 0.1,                                  // how much of the way it catches up each frame: soft, not floaty
    prevent: (node) => !!node.closest?.('.tune-panel'),
  })
}

export function stopSmoothScroll() {
  lenis?.destroy()
  lenis = null
}

/** to the top at once (a page change), without Lenis gliding back from where the last page was */
export function jumpToTop() {
  if (lenis) lenis.scrollTo(0, { immediate: true, force: true })
  else scrollTo(0, 0)
}

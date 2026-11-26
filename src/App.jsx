import { Suspense, useEffect } from 'react'
import Home from './pages/Home'
import { pages, preloadPagesWhenIdle } from './pages/routes'
import { SOON } from './site'
import { usePath } from './router'
import { armUnlockOnFirstGesture, holdSoundUntil } from './lib/sound/engine'
import { pageSettled } from './lib/pageSettled'
import { startSmoothScroll, stopSmoothScroll } from './lib/smoothScroll'

// lavanyaaa.com shows Coming Soon on every path, so unfinished pages never reach it
function App() {
  const path = usePath()
  // sound wakes on the first click, tap or key (dragging the window open counts) and loads then.
  // The Coming Soon face has nothing to play, so it never downloads the samples. The samples wait for the
  // page on screen to have its pictures (pageSettled), so a click that opens a page isn't queued behind them.
  useEffect(() => { if (!SOON) { holdSoundUntil(() => pageSettled()); armUnlockOnFirstGesture(); preloadPagesWhenIdle() } }, [])
  // ?perf: how the page runs on this machine (lib/perfProbe.js), fetched only when asked for
  useEffect(() => {
    if (!new URLSearchParams(location.search).has('perf')) return
    let stop = null, gone = false
    import('./lib/perfProbe').then(({ mountPerfProbe }) => { if (!gone) stop = mountPerfProbe() })
    return () => { gone = true; stop?.() }
  }, [])
  // smooth scrolling on every page but home (one screen, and the intro's scroll lock): smoothScroll.js
  const home = SOON || !['/work', '/work/bolt', '/about'].includes(path)
  useEffect(() => {
    if (home) stopSmoothScroll()
    else startSmoothScroll()
  }, [home])
  const Page = SOON ? null : pages[path]
  // a mistyped address goes home quietly (hers, 2026-11-23: no "not found" page), and the address bar says so
  const lost = !SOON && !Page && path !== '/'
  useEffect(() => { if (lost) history.replaceState(null, '', '/' + location.search) }, [lost])
  if (!Page) return <Home />
  // only waits on a first visit straight to a page (a link or a reload), for its own file
  return <Suspense fallback={null}><Page /></Suspense>
}

export default App

import { useEffect } from 'react'
import Home from './pages/Home'
import Work from './pages/Work'
import Bolt from './pages/cases/Bolt'
import About from './pages/About'
import { SOON } from './site'
import { usePath } from './router'
import { armUnlockOnFirstGesture } from './lib/sound/engine'
import { startSmoothScroll, stopSmoothScroll } from './lib/smoothScroll'

// lavanyaaa.com shows Coming Soon on every path, so unfinished pages never reach it
function App() {
  const path = usePath()
  // sound wakes on the first click, tap or key (dragging the window open counts) and loads then.
  // The Coming Soon face has nothing to play, so it never downloads the samples.
  useEffect(() => { if (!SOON) armUnlockOnFirstGesture() }, [])
  // smooth scrolling on every page but home (one screen, and the intro's scroll lock): smoothScroll.js
  const home = SOON || !['/work', '/work/bolt', '/about'].includes(path)
  useEffect(() => {
    if (home) stopSmoothScroll()
    else startSmoothScroll()
  }, [home])
  if (SOON) return <Home />
  if (path === '/work') return <Work />
  if (path === '/work/bolt') return <Bolt />
  if (path === '/about') return <About />
  return <Home />
}

export default App

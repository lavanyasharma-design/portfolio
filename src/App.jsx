import { useEffect } from 'react'
import Home from './pages/Home'
import Work from './pages/Work'
import { SOON } from './site'
import { usePath } from './router'
import { armUnlockOnFirstGesture } from './lib/sound/engine'

// lavanyaaa.com shows Coming Soon on every path, so unfinished pages never reach it
function App() {
  const path = usePath()
  // sound wakes on the first click, tap or key (dragging the window open counts) and loads then.
  // The Coming Soon face has nothing to play, so it never downloads the samples.
  useEffect(() => { if (!SOON) armUnlockOnFirstGesture() }, [])
  return !SOON && path === '/work' ? <Work /> : <Home />
}

export default App

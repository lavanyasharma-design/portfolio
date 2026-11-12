import { useSyncExternalStore } from 'react'

// A minimal client-side router: no library, two pages. Moving between pages without a reload
// keeps the AudioContext alive and means returning home doesn't replay the window intro.

const subscribe = (fn) => {
  addEventListener('popstate', fn)
  return () => removeEventListener('popstate', fn)
}
const getPath = () => location.pathname.replace(/\/$/, '') || '/'

export const usePath = () => useSyncExternalStore(subscribe, getPath)

export function navigate(path) {
  if (getPath() === path) return
  history.pushState(null, '', path)
  dispatchEvent(new PopStateEvent('popstate'))
  scrollTo(0, 0)
}

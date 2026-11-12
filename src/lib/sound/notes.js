import { useSyncExternalStore } from 'react'
import { playMotif, unlockSound, isMuted } from './engine'

// Plays a motif and counts its notes for the footer's "notes played". Every motif is two notes,
// so a played motif adds 2; a silent one (muted, or samples still loading) adds nothing.
let count = 0
const listeners = new Set()
const bump = () => { count += 2; listeners.forEach((fn) => fn()) }

export function play(name) {
  if (playMotif(name)) { bump(); return true }
  // iOS pauses audio when the visitor leaves for another app and comes back; the press that just
  // happened is a gesture, so wake the context with it and play once it is running
  if (!isMuted()) unlockSound().then(() => { if (playMotif(name)) bump() })
  return false
}

const subscribe = (fn) => { listeners.add(fn); return () => listeners.delete(fn) }
export const useNotesPlayed = () => useSyncExternalStore(subscribe, () => count)

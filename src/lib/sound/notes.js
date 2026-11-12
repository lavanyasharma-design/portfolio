import { useSyncExternalStore } from 'react'
import { playMotif } from './engine'

// Plays a motif and counts its notes for the footer's "notes played". Every motif is two notes,
// so a played motif adds 2; a silent one (muted, or samples still loading) adds nothing.
let count = 0
const listeners = new Set()

export function play(name) {
  if (!playMotif(name)) return false
  count += 2
  listeners.forEach((fn) => fn())
  return true
}

const subscribe = (fn) => { listeners.add(fn); return () => listeners.delete(fn) }
export const useNotesPlayed = () => useSyncExternalStore(subscribe, () => count)

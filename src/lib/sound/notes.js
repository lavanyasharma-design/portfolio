import { useSyncExternalStore } from 'react'
import { playMotif, playButterfly, unlockSound, isMuted } from './engine'
import { SOUND } from './config'

// Plays a motif and counts its notes for the footer's "notes played": a motif adds as many notes
// as it has (one right now, two when a motif has an answering note). A silent one (muted, or
// samples still loading) adds nothing.
let count = 0
const listeners = new Set()
const bump = (name) => { count += SOUND.motifNotes[name]?.length ?? 0; listeners.forEach((fn) => fn()) }

export function play(name) {
  if (playMotif(name)) { bump(name); return true }
  // iOS pauses audio when the visitor leaves for another app and comes back; the press that just
  // happened is a gesture, so wake the context with it and play once it is running
  if (!isMuted()) unlockSound().then(() => { if (playMotif(name)) bump(name) })
  return false
}

// The butterfly's own sound; it counts as one note however many it is made of
export function playButterflySound() {
  const done = () => { count += 1; listeners.forEach((fn) => fn()) }
  if (playButterfly()) { done(); return }
  if (!isMuted()) unlockSound().then(() => { if (playButterfly()) done() })
}

// Props for any link or button that should play a motif when pressed: the note sounds on the press
// itself (finger or mouse down), or on Enter / Space from the keyboard. The element's own click
// (opening a page, a mail app) is left alone.
export const pressSound = (name) => ({
  onPointerDown: (e) => { if (e.button === 0) play(name) },
  onClick: (e) => { if (e.detail === 0) play(name) },   // detail 0: a keyboard "click"
})

const subscribe = (fn) => { listeners.add(fn); return () => listeners.delete(fn) }
export const useNotesPlayed = () => useSyncExternalStore(subscribe, () => count)

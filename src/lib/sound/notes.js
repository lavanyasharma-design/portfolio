import { useSyncExternalStore } from 'react'
import { playMotif, playButterfly, unlockSound, isMuted, setMuted, onSoundReady } from './engine'
import { SOUND } from './config'

// Plays a motif and counts its notes for the footer's "notes played": a motif adds as many notes
// as it has (one right now, two when a motif has an answering note). A silent one (muted, or
// samples still loading) adds nothing.
let count = 0
const listeners = new Set()
const bump = (name) => { count += SOUND.motifNotes[name]?.length ?? 0; listeners.forEach((fn) => fn()) }

// A note that couldn't play yet because audio isn't allowed. Phones only allow sound once a
// finger *lifts*, but notes play as it lands, so the first tap of a visit (and the first after iOS
// pauses audio when you switch apps) asks a moment too early. Rather than drop that note, hold it
// and play it as soon as the lift unlocks audio, if that's within HOLD_MS.
const HOLD_MS = 1200
let pending = null

function flush() {
  const p = pending
  if (!p) return
  if (performance.now() - p.at > HOLD_MS) { pending = null; return }
  if (p.fn()) { pending = null; p.done() }
}

function attempt(fn, done) {
  if (fn()) { done(); return true }
  if (isMuted()) return false
  pending = { fn, done, at: performance.now() }
  unlockSound().then(flush)
  return false
}

// the lift is the gesture browsers accept; wake the audio with it and play what's waiting.
// On a visit's very first tap the samples may still be downloading, so also try once they land.
for (const type of ['pointerup', 'touchend']) {
  addEventListener(type, () => { if (pending) unlockSound().then(flush) }, true)
}
onSoundReady(flush)

export const play = (name) => attempt(() => playMotif(name), () => bump(name))

// The butterfly's own sound; it counts as one note however many it is made of
export function playButterflySound() {
  attempt(playButterfly, () => { count += 1; listeners.forEach((fn) => fn()) })
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

// The footer's sound switch. The site starts with sound on; muting lasts for the visit
// (a reload starts unmuted again).
export function toggleMute() {
  setMuted(!isMuted())
  listeners.forEach((fn) => fn())
}
export const useMuted = () => useSyncExternalStore(subscribe, isMuted)

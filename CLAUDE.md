# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Lavanya Sharma's product design portfolio, built in code (not Framer). Deployed on Vercel. GitHub repo: `lavanyasharma-design/portfolio`.

## Tech Stack

- **React** with **Tailwind CSS**
- Deployed on **Vercel**

## Commands

To be added once the project is scaffolded (expected: `npm run dev`, `npm run build`, `npm run lint`).

## Pages

- Homepage
- Case studies: Bolt, EMI Card, BBPS
- About
- Archive

## Navigation

`About · Design · AllthingsLav · Let's talk` — where "Let's talk" links to LinkedIn.

## Design Principles

- Premium feel with strong, intentional typography
- Micro-animations throughout
- Mobile-first, fully responsive
- Every design decision should be deliberate and distinctive — no generic templates
- British English throughout
- No em dashes

## Homepage loader

- **Visual:** purple curtain backdrop, no penguin, no illustration
- **Copy (overlay text):** "A few systems and stories, waiting to be wondered
  at."
- **Subtext/toast, beneath the main line:**
  - Desktop: "press any key or click to enter"
  - Mobile: "tap to enter or swipe up"
- **Timing:** auto-advances after ~4 seconds if there's no interaction —
  doesn't trap anyone behind a locked curtain
- **Behaviour:** the first click / keypress / tap that dismisses the curtain
  also silently unlocks the `AudioContext` in the background, so the piano
  bars are already sound-ready by the time the homepage appears — this is
  what makes the audio-unlock problem solvable without a dedicated gesture
  screen bolted on separately
- **Why the copy works:** deliberately withholds the word "reason" — it
  shows up moments later in the homepage's own "i design / with reason / and
  wonder" line, so it reads as a callback rather than a repeat

## Homepage sound logic — piano key interaction

**Mechanic:** discrete note-triggering, not continuous audio scrubbing. Each bar
corresponds to one note in an 18-note original phrase (below). Cursor/finger
crossing a bar triggers that note. Speed of movement = time between triggers,
not playback-rate distortion of a recording — this avoids pitch-shifting
artefacts (no "chipmunk" effect) by construction, not by restraint.

**Note sequence (D minor pentatonic: D–F–G–A–C):**
D · F · A · G(breath) · A · C · D · D · C · A · A · C · D(peak) · C · A · G · F · D(home)

**Durations in seconds, same order:**
0.70, 0.70, 0.70, 0.85, 0.60, 0.52, 0.47, 0.44, 0.42, 0.40, 0.42, 0.44, 0.48, 0.52, 0.58, 0.66, 0.72, 0.82

**Composition notes:** inspired by the harmonic colour of a specific piano
cover of "La Maritza" (Sylvie Vartan) — sits in the D minor / F major family,
opens spaciously before a driving dominant pulls toward a climax. This is an
original melody shaped by that arc (unhurried open → gradual accelerando →
peak → gradual ritardando → resolve home) — not a transcription of the source,
by design.

**Tone/synthesis approach** (validated in a working Web Audio prototype):
- 3 oscillators per note: fundamental (sine) + same note detuned +0.4%
  (warmth/chorus) + soft octave-up harmonic at ~10% gain
- Gentle lowpass filter (~2200Hz, Q 0.5) to remove harshness
- Envelope: fast attack (~15ms), long exponential decay — tail extends well
  past the note's rhythmic "slot" (≈2.6× its spacing, minimum 1.4s) so notes
  overlap and ring like a held sustain pedal, rather than clipping to silence
- Small feedback-delay reverb send (delay ~0.12s, feedback ~0.4, lowpass
  inside the feedback loop) for room warmth
- Master `DynamicsCompressor` to prevent clipping as notes overlap
- The peak note (high D) gets slightly more gain (0.30 vs 0.22 for the rest)
  for emphasis

**Browser audio unlock:** hover alone does not unlock audio in most browsers
— passive mouse movement isn't a qualifying user gesture. Unlock the
`AudioContext` on the first real interaction with the page (e.g. skipping or
clicking the loader) so sound is already ready by the time the visitor
reaches the bars.

## Mobile behaviour

- No "lesser" mobile version of the sound/motion layer — full parity with
  desktop is the deliberate choice.
- Idle ambient sway (slow, low-amplitude) runs on both desktop and mobile as
  the resting, "alive" state of the bars.
- On mobile, `touchstart`/`touchmove` drive the exact same note-triggering
  logic as `mousemove` on desktop — a finger swipe across the bars presses
  keys in sequence, same mechanic, different input event.
- `touchstart` is a valid browser gesture for unlocking audio (unlike passive
  hover), so mobile audio unlock is if anything more reliable than desktop's.

## Piano roll direction (visual block for "with reason")

- **Locked:** the "with reason" visual, of the three blocks under the
  homepage name/tagline, is a piano roll / tracker bar concept — paper roll
  passing over a reading bar, aligned perforations letting air through to
  trigger notes. Chosen over the hammer-mechanism and full-spool
  alternatives that were also explored.
- **Rationale:** a piano roll is a literal encoded system (holes =
  instructions) — ties directly into the systems-thinking side of the brand
  more than the other two directions did.
- **Open:** applying this piano-roll motif to actual site navigation
  (persistent nav styled as a tracker bar, in-page section progress, etc.)
  was explored but is not locked — pending final nav decisions. Add to this
  doc once that's settled.

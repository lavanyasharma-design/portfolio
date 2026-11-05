# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Lavanya Sharma's product design portfolio, built in code (not Framer). Deployed on Vercel. GitHub repo: `lavanyasharma-design/portfolio`.

Current direction: a **window intro** (a pencil-drawn sash window you drag open; a butterfly escapes and flies on to the page) that lands on a **single-screen hero** from the Figma "home page" frame (node 90:13, drawn at 1512x982). It was prototyped as a static page in `D:\loader` and ported here.

## Tech Stack

- **React 19** + **Vite**, **Tailwind CSS v4** (via `@tailwindcss/vite`)
- **motion** (motion.dev, v12) for springs and tweens, imported from `motion` (not `motion/react`)
- Fonts self-hosted via **@fontsource**: Cormorant Infant 600 (serif) and DM Sans variable with the `opsz` axis (sans, also the body default used by the intro hint and skip link)
- **oxlint** for linting
- Deployed on **Vercel**

## Commands

- `npm run dev`: dev server
- `npm run build`: production build to `dist/`
- `npm run preview`: serve the build
- `npm run lint`: oxlint

Add `?slow` (or `?slow=8`) to the URL to slow every intro animation 4x (or 8x) when reviewing motion.

## Structure

```
src/pages/Home.jsx                 intro + hero; owns `revealed` and the body scroll lock
src/components/intro/WindowIntro   the loader: orb canvas, veil, window, sash, hint, skip, flying butterfly
src/components/intro/orbField.js   WebGL orb field + pencil pass (two-pass shader)
src/components/home/Hero           the Figma home screen
public/assets/                     window-back.webp, window-sash.webp, butterfly.png, dot.svg
public/motif.svg                   tiled page background
```

## Window intro

- **Sequence:** paper veil with a hole cut where the glass is → the orb field shows through → butterfly roams and taps the pane → visitor opens the sash → butterfly escapes → camera pushes through the lower opening (2.2s) → site fades in at 55% of the push → butterfly flies an S-curve (3s) and lands exactly on the hero butterfly, then its glow fades off.
- **Ways in:** drag the sash up (opens past 42% or on a fast upward flick), Enter / Space / ArrowUp on the focused sash, scroll up, or "skip".
- **Hint:** "drag the window up" (Cormorant Infant 600, 16px, #1a1a1a) appears 1s after page load, or on a click that doesn't drag, and stays until the camera push starts, fading out with "skip" (Cormorant Infant 600, 14px, #616161).
- `prefers-reduced-motion`: push shortened to 0.7s and the butterfly flight is skipped.
- **Tunables** in `WindowIntro.jsx` / `orbField.js`: `ORBS` (positions, orbits, depth), `DAY` palette, `WIN` (window image measurements as fractions, only touch if the artwork changes), spring stiffness/damping, push duration and `PUSH` easing, `F.sketch` / `F.grain`.
- **Implementation notes:**
  - The logic is one imperative mount effect (refs, rAF loop, Motion `animate`), ported as-is from the prototype. Keep it that way rather than driving per-frame motion through React state.
  - The flying butterfly is portalled to `document.body` and `position: fixed` for the whole intro, tracking the window's rect, so it survives the intro being hidden before it lands.
  - The veil's hole is recomputed every frame. Nothing opaque may sit under the intro, or the reveal loses its seam.
  - Everything is client-only (WebGL, `window`, pointer events).
  - Tailwind Preflight differs from the browser defaults the prototype was built on (`line-height`, `<p>` margins). Those are restored explicitly in the CSS; check this if anything shifts by a few pixels.

## Hero (single screen)

- Built to the Figma frame at 1512x982. `--u` is one design pixel and only shrinks when the 521px hero block no longer fits (`min(1px, (100vw - 32px)/521)`).
- Copy: "Hi, I'm Lavanya" / "Product Designer" / "systems thinker, backend literate & stubborn about clarity".
- Top bar: `hi@lavanyaaa.com` (mailto), LinkedIn, X. Section links: `[work]` #551999, `[about]` #46b2d7, `[play]` #e821ba.
- Footer: chandigarh → bengaluru · v1.0.0 · 0 notes played · colophon.
- Blocks rise in (opacity, 14px, 4px blur) on reveal, staggered 0 to 0.55s.

## Coming soon (lavanyaaa.com)

- `src/site.js` exports `SOON`: true on lavanyaaa.com (or with `?soon`). The intro then lands on a screen with only "Coming Soon" (Cormorant Infant 400, #1A1A1A) and the butterfly; the vercel.app address keeps the full hero.
- Butterfly placement in soon mode is `--bs` / `--b-dy` / `--b-gap` on `.site.soon` (Hero.css), centred on the caps of the 108px type. `--u` divides by the line's real width so phones keep 16px gutters; re-measure if the type changes.

## Motif hover (`src/components/motif`)

- `MotifField` is a fixed canvas: near the pointer the background motif turns from #E8DBFF to the hover colour, as a soft blob with a wake (water-like). Reusable on any page whose host has the motif as its CSS background. Tunables in `motifConfig.js`; `?motif` shows a live panel.
- The dark tile is rasterised at device pixel size with a thin same-colour outline (`weight`), because the motif's strokes are ~0.3px and read as dotted otherwise.
- Elements marked `data-no-motif` (the butterfly) switch it off while hovered.

## Butterfly (`src/components/home/Butterfly`)

- Hover or tap: wings flinch (the image is split down the body and each half rotates in 3D), body scrunches and jolts away from the pointer, and it glows from within: slight brighten plus a faded pale-purple holographic shimmer masked to its shape, no halo. Tunables in `TWITCH`; `?tune` shows a live panel with a "twitch it" button.
- `bflyRef` stays on the outer box; the intro's flight lands on it. `onTwitch` is the hook for sound.

## Sound

- The piano and music interaction is **staying** (decided 5 Oct 2026). "0 notes played" in the footer counts it.
- Source: Lavanya's own sound package (handoff in `public/sound tryout/SOUND.md`, not yet moved into `src/` and `public/`). Each hover or tap plays a two-note motif: folk harp with grand piano under it, D major pentatonic, soft reverb. Plain Web Audio engine (`engine.js`), settings in `config.js`.
- No Tone.js, Howler or other audio library. One `AudioContext`, owned by the engine. Change sounds in `config.js` only.
- Browsers block audio until the visitor clicks, taps or presses a key. Dragging the window open, "skip" and Enter all count; scrolling in does not. Audio (~660 KB) loads after that first gesture, never blocking first paint.
- Decided: "0 notes played" counts every note (+2 per motif). The mute control goes in the footer next to the counter ("sound on / off"), in the footer's Cormorant style. Not wired in yet.
- Samples: folk harp from the Versilian Community Sample Library (CC0), grand piano from the Salamander Grand Piano by Alexander Holm (CC BY 3.0, credit required, e.g. in the colophon).

## Design Principles

- Premium feel with strong, intentional typography
- Micro-animations throughout
- Mobile-first, fully responsive
- Every design decision should be deliberate and distinctive, no generic templates
- British English throughout
- No em dashes

## Credit / licence

The pencil pass in `orbField.js` is adapted from Florian Berger's "notebook drawings" (shadertoy.com/view/XtVGD1, CC BY-NC-SA 3.0). Fine for a personal portfolio with credit in the source. If the site is ever used commercially, replace that pass.

## Open (to decide)

- Pages beyond the home screen: case studies (Bolt, EMI Card, BBPS), About, Archive/play. Where `[work]`, `[about]`, `[play]` lead.
- LinkedIn and X links are still `#`.
- Sound: how the piano interaction plays, where it lives, and how it drives the "0 notes played" counter. See **Sound** above.

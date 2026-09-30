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
- **Hint:** "drag the window up" appears after 2.2s, or on a click that doesn't drag.
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
- The piano-bar sound interaction from the previous direction (hinted at by "0 notes played" in the footer): dropped, or coming back?

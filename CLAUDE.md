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
public/assets/                     window-back-clean.webp, window-sash-clean.webp (used), window-back.webp, window-sash.webp (untouched originals), butterfly.png, dot.svg
public/motif.svg                   tiled page background
```

## Window intro

- **Sequence:** paper veil with a hole cut where the glass is → the orb field shows through → butterfly roams and taps the pane → visitor opens the sash → butterfly escapes → camera pushes through the lower opening (2.2s) → site fades in at 55% of the push → butterfly flies an S-curve (3s) and lands exactly on the hero butterfly, then its glow fades off.
- **Ways in:** drag the sash up (opens past 42% or on a fast upward flick), Enter / Space / ArrowUp on the focused sash, scroll up, or "skip".
- **Hint:** "drag the window up" (Cormorant Infant 600, 16px, #1a1a1a) appears 1s after page load, or on a click that doesn't drag, and stays until the camera push starts, fading out with "skip" (Cormorant Infant 600, 14px, #616161).
- `prefers-reduced-motion`: push shortened to 0.7s and the butterfly flight is skipped.
- **Glass:** the view through the window is tinted in the hero's section colours ([work] #551999, [about] #46b2d7, [play] #e821ba), each lifted to a light vivid version and mixed with white by `GLASS.tint` (orbField.js), with the pencil pass off (`GLASS.sketch` 0) and a dither against banding. `?glass` shows a live panel. The `*-clean.webp` window images are the originals with the frost speckle and the painted grey shadow made clear (alpha kept only for warm wood and dark pencil), baked once: a live filter on the ~10x-scaled push stalled phones. If the artwork changes, regenerate them the same way.
- **Landing:** the flyer covers the hero butterfly for 650ms after landing; touching it in that window drops the flyer at once so the hero's twitch is visible.
- **Tunables** in `WindowIntro.jsx` / `orbField.js`: `ORBS` (positions, orbits, depth), `GLASS` / `BRAND` palette, `WIN` (window image measurements as fractions, only touch if the artwork changes), spring stiffness/damping, push duration and `PUSH` easing, `F.sketch` / `F.grain`.
- **Implementation notes:**
  - The logic is one imperative mount effect (refs, rAF loop, Motion `animate`), ported as-is from the prototype. Keep it that way rather than driving per-frame motion through React state.
  - The flying butterfly is portalled to `document.body` and `position: fixed` for the whole intro, tracking the window's rect, so it survives the intro being hidden before it lands.
  - The veil's hole is recomputed every frame. Nothing opaque may sit under the intro, or the reveal loses its seam.
  - Everything is client-only (WebGL, `window`, pointer events).
  - Tailwind Preflight differs from the browser defaults the prototype was built on (`line-height`, `<p>` margins). Those are restored explicitly in the CSS; check this if anything shifts by a few pixels.

## Hero (single screen)

- Desktop is Figma 90:13 (1512x982); at 600px and below it switches to the mobile frame 21:2 (402x874), its own layout (tagline wraps centred, nav spans the body), not the desktop shrunk. `--u` is one design pixel: `min(1px, (100vw - 32px)/484)` on desktop, `min(1px, 100vw/402)` on phones. Rows are `1fr auto 1fr` so the body sits on the screen's centre, as in both frames.
- Phones differ from the mobile frame on purpose (Lavanya, 2026-11-12): top gap `--top-pad` 20 and bottom gap `--foot-pad` 20 instead of Figma's 56 / 32 (those left room for the status bar and home indicator), footer (Mobile/h7, 14px SemiBold) with no letter spacing and items 4 apart instead of 5, so it stays on one line up to 999 notes played, and an upright phone gets one screen that never scrolls (`touch-action:none`) so a finger sweep drives the motif. `?spacing` shows sliders for the two gaps.
- Copy: "Hello, I'm Lavanya" / "Product Designer" / "systems thinker, backend literate & stubborn about clarity".
- Top bar: `hi@lavanyaaa.com` (mailto), LinkedIn (linkedin.com/in/lavanyaaasharmaaa), X (x.com/lavanyaaasharma), both in a new tab. Section links (`SectionLink`): `[work]` #6729ae, `[about]` #46b2d7, `[play]` #ff33d0, the Figma colour variables.
- Section links: on click or tap (never hover) the brackets ease out and back (`BRACKETS`) and the section's sound motif plays. `[work]` then opens `/work`; about and play stay put until their "soon" state is designed.
- Footer: Chandigarh → Bengaluru · v1.0.0 · N notes played [sound switch] · Colophon, in #616161. On phones v1.0.0 and its dot are hidden so the switch fits on one line (up to 999 notes). The counter is live (`src/lib/sound/notes.js`, +2 per motif played).
- Blocks rise in (opacity, 14px, 4px blur) on reveal, staggered 0 to 0.55s.
- Routing is `src/router.js` (pushState, no library), so moving between pages keeps the AudioContext and returning home skips the intro. On lavanyaaa.com every path shows Coming Soon.

## Work page (`/work`)

- Desktop is Figma "Work" 290:12780 (1512 wide), phones (600px and below) "Work - full scroll" 346:9449 (402 wide). Flat `color/white/default` background, no motif (Lavanya, 2026-11-13). Figma colour variables live on `:root` in `index.css` (`--color-*`, `--shadow-card`, `--shadow-nav-bar`).
- Desktop: content column 1252 with 130 sides (`--side`, shrinking with the window), title (Desktop/H3) 131 from the top, 30 to the tiles, two columns 40 apart, rows 50 apart, 120 down to the footer (her changes to Figma's 50 / 100 / 240, 2026-11-13/14), tile then 24, title (Desktop/H7) then 16, tags (Desktop/Caption). One column between 601 and 840px. Phones: 20 sides, title 70 down, 16, tiles 24 apart, 12, 8, 120 to the footer.
- Tiles are the compositions tuned in `tiles.js` (copy lives there too) on every screen; Figma's tiles are dummies. The card: tile background, 1px tile border, and `shadow/card` only on hover. Tiles don't link yet (no case study pages).
- Nav bar (`src/components/nav/NavBar`): the Work page's own component 298:12907, all items in their default colours, fixed top right on desktop (never hides), bottom-centre on a 72px page-colour band on phones. Items are `SectionLink`s (brackets + sound), the current page gets its section highlight. The butterfly is the home page's `Butterfly` (twitch, glow and wing-flutter sound on hover or tap) and goes home without the window intro (`navigatedInSite` in `router.js`); a reload of the home page still plays it. Phones only: the bar hides once the page scrolls 50px past the last case study (`NAV_HIDE_AFTER`) and returns on scrolling back.
- Mute is site-wide (one flag in the sound engine): the home page's switch covers every page.
- Footer (`src/components/footer/PageFooter`): "Good products start with a good why." and the say-hi paragraph (links "LinkedIn", "X", "hi@lavanyaaa.com", no brackets, and silent: sound there felt like too much, 2026-11-14), then the garden band (324 tall at 1512, `21.43vw` down to 180, 150 on phones).
- Garden (`gardenScene.js`, canvas): painted in code from her brief (purple grass, light and dark purple flowers with pink petals, the logo butterfly in purple monochrome darting across in hops, side-on). Touching the butterfly (hover, tap, click) plays its wing flutter (`onTouch`, counts as a note) and it darts away from the pointer. Seeded, so the same garden every visit; animates only on screen; reduced motion shows it still with the butterfly on a flower. Tunables in `GARDEN`; `?garden` opens a live panel with "send the butterfly", "copy values" and the draw time. Keep the file name distinct from `Garden.jsx`: Windows treats `garden.js` and `Garden.jsx` as the same import.

## Coming soon (lavanyaaa.com)

- `src/site.js` exports `SOON`: true on lavanyaaa.com (or with `?soon`). The intro then lands on a screen with only "Coming Soon" (Cormorant Infant 400, #1A1A1A) and the butterfly; the vercel.app address keeps the full hero.
- Butterfly placement in soon mode is `--bs` / `--b-dy` / `--b-gap` on `.site.soon` (Hero.css), centred on the caps of the 108px type. `--u` divides by the line's real width so phones keep 16px gutters; re-measure if the type changes.

## Motif hover (`src/components/motif`)

- `MotifField` is a fixed canvas: near the pointer the background motif turns from #E8DBFF to the hover colour, as a soft blob with a wake (water-like). Reusable on any page whose host has the motif as its CSS background. Tunables in `motifConfig.js`; `?motif` shows a live panel.
- The dark tile is rasterised at device pixel size with a thin same-colour outline (`weight`), because the motif's strokes are ~0.3px and read as dotted otherwise.
- Elements marked `data-no-motif` switch it off while hovered. On the home page that is every bit of text (top bar links, hello, Product / Designer, tagline, section links, the footer row) and the butterfly; the empty space between them keeps the hover.

## Butterfly (`src/components/home/Butterfly`)

- Hover or tap: wings flinch (the image is split down the body and each half rotates in 3D), body scrunches and jolts away from the pointer, and it glows from within: slight brighten plus a faded pale-purple holographic shimmer masked to its shape, no halo. Tunables in `TWITCH`; `?tune` shows a live panel with a "twitch it" button.
- `bflyRef` stays on the outer box; the intro's flight lands on it.
- Sound: its own, unlike any button and used nowhere else (`SOUND.butterfly`, wing flutter: a quick run of four high harp notes; glass shimmer and wind chime are synthesised alternatives in ?sound). Plays whenever it twitches, so on hover too (her call: the twitch and shine are hover), via `onTwitch`; home page only (not Coming Soon); counts as 1 note; 450ms retrigger guard.

## Sound

- The piano and music interaction is **staying** (decided 5 Oct 2026). "0 notes played" in the footer counts it.
- Source: Lavanya's own sound package (handoff in `public/sound tryout/SOUND.md`), now in `src/lib/sound/` and `public/sounds/`. **Where sound lives (decided 12 Nov 2026), on press only, never hover:** [work] [about] [play], email, LinkedIn, X (each its own note), the butterfly (its own sound, on hover too), the nav bar on every page, and a "next" button at the end of a case study. The about and play pages' own content stay silent. Any link gets it with `{...pressSound(name)}` from `notes.js`. Wired so far: the home section links and top bar, the nav bar (items and butterfly), the footer garden's butterfly; the work page footer's links stay silent (her call); `armUnlockOnFirstGesture` runs in App, never on the Coming Soon face. Each press plays one note: folk harp with the grand piano under it at 50%, G major pentatonic, middle register (her bench settings of 12 Nov 2026, final take). The 3 Oct version was two notes, folk harp over piano, in D. `?sound` opens a live panel mirroring her bench, in plain words with a hint under each control (she is not a musician) (voice, layer, key, scale, register, notes per press, tone, reverb, compressor); changes apply to the next note, persist on that device, and "copy settings" gives her bench's JSON. The engine's `retune()` / `loadVoices()` exist for that panel. Plain Web Audio engine (`engine.js`), settings in `config.js`.
- No Tone.js, Howler or other audio library. One `AudioContext`, owned by the engine. Change sounds in `config.js` only.
- Browsers block audio until the visitor clicks, taps or presses a key. Dragging the window open, "skip" and Enter all count; scrolling in does not. Audio (~660 KB) loads after that first gesture, never blocking first paint.
- Decided: "0 notes played" counts every note (+1 per press now, +2 if a motif has two notes). The mute control is a lucide speaker icon (Volume2 / VolumeX, lucide-react pinned at 1.63.0) right after the counter, in the footer grey at the text's size. Sound starts on; muting lasts for the visit.
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
- Instagram (her poems and photography) goes on the play page, not the top bar (decided 2026-11-12).
- Colophon (footer link): a dialog that opens on click / tap / Enter (decided 2026-11-12, not hover, so it works everywhere). Lavanya is designing it in Figma. Its content is ready in `src/components/home/colophon.js`: piano (Salamander, CC BY 3.0, required), harp (VCSL, CC0), the pencil shader (Florian Berger, CC BY-NC-SA 3.0, required), fonts and Lucide.
- Sound: how the piano interaction plays, where it lives, and how it drives the "0 notes played" counter. See **Sound** above.

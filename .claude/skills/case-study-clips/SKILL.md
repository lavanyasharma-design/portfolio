---
name: case-study-clips
description: Lavanya's rules and pipeline for the prototype clips in her case studies (phone UI clips built in Remotion from her Figma frames, in clips/). Use when planning, scripting, building, retiming, rendering or placing a case study clip or a static UI screen beside one (Bolt, FCI, any next study). Triggers on clip, prototype clip, case study video, Remotion, pace, timing, T table, render, poster, phone panel, edge case screen.
---

# Case study clips

Short phone clips that show a product being used, one interaction each, looping in the case study's panels. Built from Lavanya's Figma frames in the Remotion project `clips/`. Bolt's nine clips (`clips/src/bolt/`) are the reference set.

Every rule here is hers. Each one says why, so you can judge the cases it doesn't name.

## Workflow

- **The process for a new case study:**
  1. Read her notes in the Figma "clip: ..." sections of the product file. She writes 2 or 3 in full; follow their style for the rest.
  2. Write a timed script for each clip: a plain list of moments (time → what happens).
  3. She edits the scripts until every one is locked.
  4. Build all of them at once.
  5. Wire them into the case study page so she sees it finished.

  Ask before building whenever a frame or a step is unclear.
  Why: she judges clips in place, on the finished page, not one by one.
  <!-- 2026-11-19: "you give me an order… i'll read and/or make changes to it and then you build. all scripts locked first and then you can build everything at once and link with the case study page" -->

- **Never send her to Remotion Studio's panels or timeline.** She gives changes as numbers in chat ("tap the car at 2.5s", "cut 1s from the sheet"). After each change, reply with the clip's timeline as a plain list (time → what happens) so she can answer in numbers. Studio (`cd clips && npm run dev`, :3000) and `http://localhost:5173/clips/pace.html` (every clip with a speed slider) are only for watching.
  Why: she found Studio's panels hard. An edit she made there landed on the shared `Stage` and broke the menu clip.
  <!-- 2026-11-19: "im finding this very difficult to use… i'll just say what i want with quantitative numbers… this isnt working for me bro" -->

## Pace

- **Pace every clip to the geofence slider clip** (`GeofenceSlider` in `clips/src/bolt/Decisions.tsx`). Moves take about 1.5s. Holds take about 1s, up to 1.5s only where there's text to read, never 2 to 3s. Each action lands before the next starts. Bolt's clips run 6 to 15s. When a first cut feels rushed, slow it with `stretch(T, k)` (`engine.ts`), k 1.6 to 1.75: it spaces the actions out without putting the motion itself into slow motion.
  Why: "it gives breathing space and enough time to look at the UI and understand what action is happening". She got here in steps: the first cut was too fast, a GIF-like cut with 1s pauses was still too fast, and this pace is where she landed.
  <!-- 2026-11-19: "too fast… i couldnt understand where you tapped despite me knowing the flow" → "GIFs rather than videos" → "too fast" → "the pace of the 1st video, geofence slider is perfect to me. lets do this pace for videos" -->

- **No screen or sheet stays still for more than about 2s.** End a clip about 1s after its last action, then loop.
  Why: a long hold reads as a frozen or broken video.
  <!-- 2026-11-21 (fleet sheet held 3.3s): "it gives off the feeling that the video has stuck"; 2026-11-19: "Do not wait on some sheets for too long" -->

## Interaction

- **Taps use the light press only:** `pressed()` from `engine.ts` (12% shade, 0.22s) on a `Press` layer. Never add tap rings, cursors, touch dots or darker highlights. If taps are hard to follow, slow the pace instead.
  Why: when she couldn't see where taps happened, pacing was the fix, not a heavier highlight.
  <!-- 2026-11-19: "you didnt have to darken the selection, just slow it down" -->

## Framing

- **Zoom only when it earns it.** The default is no camera: `Stage` shows the phone whole, still and centred. Before adding a zoom in and out, answer these questions:
  1. Does the zoomed phone stay inside its panel? It must never cut the panel or crop the phone.
  2. Does it stay as sharp as the other clips? A zoom enlarges the render's pixels, so if it softens the UI, don't zoom.
  3. Is it showing a delight (a success tick, a playful transition)?
  4. Is it a micro-interaction too small to read at full view (a toggle, a slider thumb, a checkbox)?

  Zoom only if 1 and 2 are yes and at least one of 3 or 4 is yes; otherwise don't. A zoom is slight (just enough to point the eye) and centred on the action. It never moves the phone sideways. It eases in and out in a single smooth scale with no jitter.
  Why: in Bolt, zooms on every tap read as a wobble to her friends and the clips stuttered, so they all came out (2026-11-21). The phone is clear in its 2:3 panel without them. A zoom is kept for moments that need it.
  <!-- 2026-11-21: "the phone is like wobbly… No zoom in at all"; 2026-11-23: "zoom in happens to highlight a tap or an interaction. judge it yourself… is it a delight we're trying to show with a zoom?, is it a micro-interaction that requires the zoom?"; 2026-11-19: "the phone shouldnt move left side at all" -->

- **Every phone clip sits in one 2:3 tall panel** (variant `tall`, after Mavis Lo's single panels on mavislo.com/trace). The phone is never cropped. Two clips that belong together go side by side on desktop and in a swipe row on phones, both at the same panel size. Static UI screens (edge cases) are JPEG stills in the same 2:3 panel, rendered as Remotion stills.
  Why: in small 2:1 panels the UI couldn't be read. Single tall panels made it clear on desktop and phones alike.
  <!-- 2026-11-19: "mavis's videos are so clear and they are in the same size as us, singular panels"; "upon zooming in, the phone gets cut, i dont want that" -->

- **All panels use one background, `#faf7ff`** (the clip panels', also the Details table header). Never a pink-leaning lilac.
  Why: two panel colours on one page read as a mistake. Lilac 1 (`#f4eaf1`) read pink, and pink belongs to [play].
  <!-- 2026-11-19: "why am i seeing 2 colors for panel backgrounds? menu clip is pinkish" -->

- **Use the product's own platform frame:** iOS (`SCREEN` 393 × 852 in `engine.ts`) for an iOS product, an Android frame for an Android one.
  Why: the clip should look like the product's real platform.
  <!-- 2026-11-15: "its all ios design so use such mockup only for videos"; 2026-11-23: match the platform for later studies -->

## Fidelity

- **A clip is a believable real session.**
  - UI state carries over between frames: nothing appears before the user adds it.
  - User actions look real: in Bolt's menu clip Reports is unticked, then POI is ticked.
  - Floating buttons float above the content, and they appear only when the app would show them (Save Changes rises once something has changed).
  - The status bar and header sit identically on every frame.
  - Edited text never overlaps other UI.
  - Only one sheet moves at a time.

  Check every clip frame by frame before showing it to her: `sh tools/peek.sh <clip> tall 0.5 <scratch dir>` tiles a frame every half second.
  Why: "so it looks like an actual interaction done by a user". In Bolt each of these got through once and she caught it.
  <!-- 2026-11-19/21: POI "can't show before"; "untick the reports and then tick the POI"; Save Changes "does not appear until you make changes"; status bar "different than what shows up on the second frame"; "device names overlapped with the tags"; "a sheet that opens a second before it, looks very glitchy" -->

- **Replace repeated or placeholder names in frames with plausible local data**: Indian vehicle numbers, company names like "ABC Corp", "XYZ shop". Draw them with `Retext`.
  Why: the clip should read as a real product in use, not a template.
  <!-- 2026-11-19: "write the any hypothetical vehicle numbers running in India… I think the same vehicle number is being repeated" -->

- **Clips loop with a plain cut.** No fade or crossfade at the loop point.
  Why: a fade looked off next to the other clips.
  <!-- 2026-11-21: "remove the fade that we applied on this video because that looks really bad… keep it a normal loop as all the clips" -->

## Export

- **Render at 1.2x scale, CRF 20, H.264**: a tall clip is 1056 × 1584, inside level 4.1, about 1 Mbps. `render.mjs` holds these settings, so never pass other values or go back to 1.6x / CRF 16. After every render run `node tools/check-render.mjs <study>`, which fails on any clip that breaks this.
  Why: clear on a retina screen, yet every phone decodes it in hardware and a slow connection streams it. The old 1.6x clips (4 to 5.7 MB at 4.4 Mbps) stuttered for her friends.
  <!-- 2026-11-19: "maintain the high quality of the UI"; 2026-11-21: "optimize these clips even on a low internet bandwidth. I don't want the clips to glitch for people" -->

## Pipeline (how it works, not taste)

- **Project:** `clips/` has its own package.json; nothing from it enters the site bundle. Each study gets a folder `clips/src/<study>/`, one composition per clip registered in `src/Root.tsx`, with its frames under `clips/public/<study>/`. Output goes to `public/work/<study>/<clip>-tall.mp4` plus a `.jpg` poster (first frame): the render command's first word is the study (`npm run render -- fci <clip>`). `render-all.ps1` is Bolt's list of clips (`$study = 'bolt'`); a new study gets its own list.
- **Timings:** each clip's `T` table (or schema props) sits at the top of its file, in seconds. Helpers in `src/phone/engine.ts`: `seg`, `keys`, `pressed`, `stretch`, eases (`ios` for sheets).
- **Layers** (`src/phone/layers.tsx`):
  - `Stage` (panel + phone), `Screen` (a whole frame; `dy` moves its content down when a frame was exported with a different status bar), `Pic`, `Crop`, `Patch`, `Press`, `ScrollScreen`.
  - `push` / `pop` (screen slides), `Veil`, `Retext` (redrawn text), `SuccessTick` (the GPay-style tick).
- **Frames:** export from Figma at 2x. The MCP export flattens transparent layers onto the canvas grey `#f3f4f5`; `useKeyed` keys that grey out. Find positions for patches and retext with `node tools/measure.mjs <png> x y w h`.
- **Render from PowerShell, never from Claude's bash shell**: there, the headless Chrome crashes on launch.
  - `npm run render -- <study> <clip>` renders one clip (tall by default); `npm run render:all` renders all of Bolt's.
  - Close browser tabs showing the case study first: Windows locks an mp4 a page has played, and the final rename fails. The `.remotion-in-progress` file is then the finished clip; check it plays and move it into place.
  - Concurrency stays at 2 (the machine ran out of memory once).
- **On the page:** `<Media src poster />` in the case study's blocks. The poster also sits behind the video, because iOS drops it while a clip starts. Each clip starts loading a screen ahead. It plays once about 90% of it is on screen and pauses when less than a quarter is left (`caseMotion.js`, hers 2026-11-21: at 35% a clip began before she reached it). Muted, looping, MP4, never GIF.
- **Bolt specifics worth knowing:** the devices clip's frames had an Android status bar and a header 20 higher, both moved down 20 with `Screen dy`. Menu's floating Save Changes rises from behind the tab bar, with the band behind it taken from `edit.png`. Fleet holds the full sheet about 2.3s.

---
name: site-checks
description: Lavanya's site health checks for lavanyasharma.vercel.app (performance, loading on slow lines, the footer garden's sharpness, the About layout, blank pages). Use after adding a page, a case study, pictures, clips, fonts or anything that loads, before a launch, or when she or a friend reports the site slow, stuttering, blurry, blank or laid out wrong. Triggers on run the checks, site checks, health check, performance check, is the site still fast, slow internet, lag, stutter, blurry garden, blank page, layout broken, ?perf readout.
---

# Site checks

Everything that broke on the live site in November 2026 is re-checked by two scripts, against a real browser.
Run them after adding anything that loads, and before every launch. Fix what fails before merging; never
loosen a check to make it pass without telling her why.

## Run

```
node scripts/checks/site.mjs                        # the live site
npm run build && npm run preview                    # then, in another shell:
node scripts/checks/site.mjs http://localhost:4173  # a build, before it goes live
node scripts/checks/site.mjs <url> about-box        # only the named checks
node scripts/checks/garden-pace.mjs                 # the garden's sharpness logic (no browser)
```

`site.mjs` uses the installed Google Chrome through Playwright (a devDependency) and takes about two minutes.
It exits 1 if anything failed. When the shared folder is on another session's branch, run it from a worktree
of main (see CLAUDE.md, and the junction to `node_modules`).

## What each check guards

| check | passes when | why it exists |
| --- | --- | --- |
| `pages` | every page in `PAGES` renders, no script errors | 2026-11-25: her Work page was blank ("Failed to fetch dynamically imported module") |
| `missing-file` | a missing file is a 404 with no long cache (live only) | the cause of that blank page: a missing file came back as the home page, kept for a year |
| `nav-click` | a nav click changes page in under 150 ms; About's words are laid out on its first frame | 2026-11-23: clicks waited ~0.4 s for the bracket animation ("it felt like it was waiting for the sound") |
| `about-fonts` | with two fonts blocked, About's words still flow (under 5 s) and `?perf` names them | 2026-11-26: a friend's Dia always showed the stand-in layout, the intro in Times |
| `about-box` | no words touch the Experience box at any width, 964 to 1728 | 2026-11-27: at 1247 its top corner sat in the intro's last line (50 widths affected) |
| `slow-bolt` | at 1 Mbps, all 9 Bolt posters in by 15 s after the click, sound after the first poster, no other pages' pictures | 2026-11-26: a friend's slow line, posters 15 to 19 s after the click |
| `home-sound` | the first key press loads all 23 sound samples within 6 s | the slow-line fix holds the samples back; home must still get them |
| `garden-pace.mjs` | good devices (and hers at 30/s on battery) end fully sharp; his laptop ends at 1x | 2026-11-23: the garden blurred on her laptop on vercel ("make no mistake"); a friend's RTX 4080 laptop stuttered |

Results on 2026-11-27 (live, all passing): click to page change 15 ms, About words flow 0.8 s with fonts
blocked, posters in by 8.5 s and sound from 3.7 s on the slow line, 23 samples, garden 12 of 12. Much worse
than these numbers is worth a look even when it passes.

## Extend it when the site grows

- **A new page** (FCI, the play page): add its path to `PAGES` in `site.mjs`. Add the pictures it opens on to
  `src/pages/pageImages.js`, so clicks wait for them and they're fetched ahead.
- **A new case study with clips:** copy `slow-bolt` for it (its poster folder and count), so its posters keep
  arriving before the sound on a slow line.
- **A new font, or a page that waits for fonts:** a check like `about-fonts` that blocks it and confirms the
  page still lays out.
- **A layout that places things around flowing text:** a width sweep like `about-box`.
- **A change to how the garden watches its pace:** run `garden-pace.mjs`; add a case for any new kind of
  machine someone reports (from their `?perf` readout).

## What the scripts can't see

- **Real devices.** The garden's stutter lives in a graphics chip; headless Chrome can't feel it. Ask the
  person to open the page with `?perf` (any page; the garden's numbers show once it's on screen), tap
  **copy** and send the text. Lines: `garden ... stepped down N times` (0 on a good device), `fonts ... FAILED:`
  (a font that browser can't load), `about words laid out` or `still in the stand-in layout`, `refresh about
  N Hz`, `frames slowest 5%`.
- **Looks.** Check by eye at the widths that changed, on desktop and phone (her rule: recheck layout after
  every change). A check passing doesn't mean it looks right.
- **Safari.** Playwright's WebKit isn't installed (about 70 MB from Microsoft's Playwright download server;
  ask before installing).

## Rules learned (don't undo these)

- Never a long or `immutable` Cache-Control on `/assets/`, and never a rewrite that sends a missing `/assets/`
  file to `index.html`. Vercel attaches header rules by path, missing files included. If a browser is ever
  stuck on a bad copy again, bump `assetsDir` in `vite.config.js` (now `assets/v2`).
- Never guess the garden's sharpness before it's on screen, or remember a guess. Only how it runs on screen
  may step it down, and every step down is a trial.
- Nothing waits on a font for good: a failed font must never leave a page in its stand-in layout.
- On a slow line, the page being read gets the line first: the sound samples wait for its pictures
  (`src/lib/pageSettled.js`), and other pages' pictures aren't fetched ahead.

## Still open (2026-11-27)

- Why the two About fonts (Cormorant 500, DM Sans italic) failed in a friend's Dia. His `/about?perf`
  readout will say if they still do; the cache fix of 2026-11-25 may already have cured it.
- Bolt's clips are about 1.2 MB each (9.6 MB), so on a slow line each takes about 10 s to start when reached.
  A lighter encode would help, at some cost in sharpness: her call, by eye, from a side-by-side.

## History (all on main)

- 2026-11-23: performance pass (pages as their own files, preloads); garden layers and frame cap; garden
  sharpness fixed to judge only on screen (9195252), crisp under the cursor and when scrolled to (d47d10f,
  108c6bc); About laid out before first paint (d47d10f); instant nav clicks (05273c0); Bolt posters WebP (23e6865).
- 2026-11-25: blank Work page from a poisoned cache fixed (a45ed28, 09a490d).
- 2026-11-26: About flows when a font fails, `?perf` fonts line (0f09ae7); slow lines: pictures before sound
  and other pages (8d24d9a).
- 2026-11-27: Experience box never in the words (0269ce1); these checks.

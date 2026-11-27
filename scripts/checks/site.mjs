/* Site checks (2026-11-27): everything that broke on the live site in November 2026, re-run in one go against
   a real browser (the installed Chrome, through Playwright). What each check guards and the history behind it:
   .claude/skills/site-checks/SKILL.md.

     node scripts/checks/site.mjs                          the live site (lavanyasharma.vercel.app)
     node scripts/checks/site.mjs http://localhost:4173    a build: npm run build, then npm run preview
     node scripts/checks/site.mjs <url> about-box slow-bolt    only the named checks

   Prints PASS / FAIL per check with its numbers; exits 1 if any failed. About two minutes. */
import { chromium } from 'playwright'

const args = process.argv.slice(2)
const BASE = (args.find((a) => /^https?:/.test(a)) ?? 'https://lavanyasharma.vercel.app').replace(/\/$/, '')
const ONLY = args.filter((a) => !/^https?:/.test(a))
const LIVE = BASE.startsWith('https://')

// every page on the site; add new ones here (a case study, the play page) so they're checked too
const PAGES = ['/', '/work', '/work/bolt', '/about']
const DESKTOP = { width: 1512, height: 982 }
// a slow line: about 1 Mbps down with 300 ms round trips (a friend's connection, 2026-11-26)
const SLOW = { offline: false, latency: 300, downloadThroughput: (1000 * 1024) / 8, uploadThroughput: (300 * 1024) / 8 }

const browser = await chromium.launch({ channel: 'chrome' })
const newPage = async (viewport = DESKTOP, opts = {}) => (await browser.newContext({ viewport, ...opts })).newPage()
const sec = (ms) => `${(ms / 1000).toFixed(1)} s`

const checks = {
  // every page renders, with no script errors (2026-11-25: the Work page was blank, a file the browser had
  // stored wrongly; "Failed to fetch dynamically imported module")
  async pages() {
    const bad = []
    for (const path of PAGES) {
      const page = await newPage()
      const errors = []
      page.on('pageerror', (e) => errors.push(e.message))
      page.on('console', (m) => { if (m.type() === 'error' && !/favicon/.test(m.text())) errors.push(m.text()) })
      await page.goto(BASE + path, { waitUntil: 'load' })
      await page.waitForTimeout(2500)
      const kids = await page.evaluate(() => document.getElementById('root')?.children.length ?? 0)
      if (!kids || errors.length) bad.push(`${path}: ${kids ? '' : 'blank page '}${errors.slice(0, 2).join('; ')}`)
      await page.context().close()
    }
    return { ok: !bad.length, detail: bad.length ? bad.join(' | ') : `${PAGES.length} pages render, no errors` }
  },

  // a missing file is a plain 404 that no browser keeps (2026-11-25: it used to come back as the home page,
  // cached for a year, and blanked pages). Live only: the local preview server answers differently.
  async 'missing-file'() {
    if (!LIVE) return { skip: 'live site only' }
    const r = await fetch(`${BASE}/assets/v2/Nope-Ab12Cd34.js`)
    const cache = r.headers.get('cache-control') ?? ''
    const ok = r.status === 404 && !/immutable|31536000/.test(cache)
    return { ok, detail: `${r.status}, cache-control "${cache}" (want 404, no immutable or year-long cache)` }
  },

  // a nav click opens the page at once, and About's words are laid out on its first frame (2026-11-23: the
  // click waited ~0.4 s for the bracket animation; the stand-in layout used to flash first)
  async 'nav-click'() {
    const page = await newPage()
    await page.goto(BASE + '/work', { waitUntil: 'load' })
    await page.waitForTimeout(4000)   // the other pages download in the background meanwhile
    await page.evaluate(() => {
      window.__nav = {}
      addEventListener('click', () => { window.__nav.click = performance.now() }, true)
      const push = history.pushState.bind(history)
      history.pushState = (...a) => { window.__nav.push = performance.now(); return push(...a) }
    })
    await page.locator('a[href="/about"]').first().click()
    await page.waitForFunction(() => location.pathname === '/about')
    const firstFrame = await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => r(!!document.querySelector('.ab-flow.flowing')))))
    const ms = await page.evaluate(() => Math.round(window.__nav.push - window.__nav.click))
    await page.context().close()
    return { ok: ms < 150 && firstFrame, detail: `click to page change ${ms} ms (want under 150; live was 38), About words laid out on the first frame: ${firstFrame}` }
  },

  // About's words flow even when a font can't load (2026-11-26: a friend's Dia showed the stand-in layout on
  // every visit, the intro in Times); ?perf names the failed fonts
  async 'about-fonts'() {
    const page = await newPage({ width: 1728, height: 1117 })
    await page.route(/cormorant-infant-latin-500|opsz-italic/, (r) => r.abort())
    const t0 = Date.now()
    await page.goto(BASE + '/about?perf', { waitUntil: 'commit' })
    let at = null
    while (at === null && Date.now() - t0 < 8000) {
      if (await page.evaluate(() => !!document.querySelector('.ab-flow.flowing')).catch(() => false)) at = Date.now() - t0
      else await page.waitForTimeout(100)
    }
    await page.waitForTimeout(1200)
    const fonts = await page.evaluate(() => document.querySelector('.tune-panel')?.innerText.split('\n').find((l) => l.startsWith('fonts')) ?? '')
    await page.context().close()
    return { ok: at !== null && at < 5000 && /FAILED/.test(fonts), detail: `two fonts blocked: words laid out after ${at === null ? 'never' : sec(at)} (want under 5 s); ?perf: "${fonts.replace(/\s+/g, ' ')}"` }
  },

  // the Experience box never sits in the words, at any desktop width (2026-11-27: at 1247 its top corner sat
  // in the intro's last line; 50 widths between 964 and 1344 were affected)
  async 'about-box'() {
    const page = await newPage({ width: 1247, height: 1000 })
    await page.goto(BASE + '/about', { waitUntil: 'load' })
    await page.waitForFunction(() => document.querySelector('.ab-flow.flowing'))
    const bad = []
    for (let w = 964; w <= 1728; w += 4) {
      await page.setViewportSize({ width: w, height: 1000 })
      await page.waitForTimeout(120)
      const hit = await page.evaluate(() => {
        const box = document.querySelector('.ab-resume-box')
        if (getComputedStyle(box).position !== 'absolute') return 0   // below the words at this width
        const b = box.getBoundingClientRect()
        return [...document.querySelectorAll('.ab-flow .ab-line:not(.ab-probe)')].map((l) => l.getBoundingClientRect())
          .filter((l) => l.width > 0 && l.right > b.left - 8 && l.left < b.right && l.bottom - 3 > b.top - 8 && l.top + 3 < b.bottom).length
      })
      if (hit) bad.push(w)
    }
    await page.context().close()
    return { ok: !bad.length, detail: bad.length ? `words touch the box at ${bad.length} widths: ${bad.join(' ')}` : 'no words touch the box, 964 to 1728 wide' }
  },

  // on a slow line, a page's pictures come before the sound samples and other pages' pictures (2026-11-26:
  // Bolt's posters came 15 to 19 s after a friend's click; now 2.5 to 9.4 s)
  async 'slow-bolt'() {
    const ctx = await browser.newContext({ viewport: { width: 1728, height: 1117 } })
    // the browser's own speed estimate, as Chrome would report it on that line
    await ctx.addInitScript(() => Object.defineProperty(navigator, 'connection', { value: { effectiveType: '4g', downlink: 1, saveData: false } }))
    const page = await ctx.newPage()
    const cdp = await ctx.newCDPSession(page)
    await cdp.send('Network.enable')
    await cdp.send('Network.emulateNetworkConditions', SLOW)
    let tc = 0
    const ev = []
    const T = () => Date.now() - tc
    page.on('request', (r) => { if (tc && /\/sounds\//.test(r.url())) ev.push({ t: T(), kind: 'sound start' }) })
    page.on('requestfinished', (r) => { if (tc) ev.push({ t: T(), kind: 'done', url: r.url() }) })
    await page.goto(BASE + '/work', { waitUntil: 'commit' })
    await page.waitForSelector('a[href="/work/bolt"]', { timeout: 60000 })
    await page.waitForTimeout(10000)   // the page goes quiet; background downloads happen here
    tc = Date.now()
    await page.locator('a[href="/work/bolt"]').first().click()
    await page.waitForFunction(() => location.pathname === '/work/bolt', null, { timeout: 30000 })
    await page.waitForTimeout(25000)
    await ctx.close()
    const posters = ev.filter((e) => /\/work\/bolt\/.*\.webp/.test(e.url ?? ''))
    const sound = ev.find((e) => e.kind === 'sound start')
    const others = ev.filter((e) => /\/work\/mockups\/|\/about\//.test(e.url ?? '')).length
    const ok = posters.length >= 9 && posters.at(-1).t < 15000 && !others && (!sound || sound.t >= posters[0].t)
    return { ok, detail: `posters ${posters.length} in by ${posters.length ? sec(posters.at(-1).t) : '-'} (want all by 15 s; was 19 s), sound starts ${sound ? sec(sound.t) : 'later'} (after the first poster), other pages' pictures: ${others} (want 0)` }
  },

  // the first key press or click wakes the sound and its samples load (2026-11-26: they now wait for the
  // page's pictures; home has none pending, so they come straight away)
  async 'home-sound'() {
    const page = await newPage()
    let n = 0
    page.on('requestfinished', (r) => { if (/\/sounds\//.test(r.url())) n++ })
    await page.goto(BASE + '/', { waitUntil: 'load' })
    await page.waitForTimeout(2000)
    await page.keyboard.press('Tab')
    await page.keyboard.press('Enter')
    await page.waitForTimeout(6000)
    await page.context().close()
    return { ok: n >= 20, detail: `${n} sound samples in within 6 s of the first key press (want 23)` }
  },
}

console.log(`site checks on ${BASE}\n`)
let failed = 0
for (const [name, run] of Object.entries(checks)) {
  if (ONLY.length && !ONLY.includes(name)) continue
  let r
  try { r = await run() } catch (e) { r = { ok: false, detail: `the check itself broke: ${e.message.split('\n')[0]}` } }
  if (r.skip) { console.log(`SKIP  ${name.padEnd(13)} ${r.skip}`); continue }
  if (!r.ok) failed++
  console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${name.padEnd(13)} ${r.detail}`)
}
await browser.close()
console.log(failed ? `\n${failed} failed: see .claude/skills/site-checks/SKILL.md for what each guards` : '\nall passed')
process.exit(failed ? 1 : 0)

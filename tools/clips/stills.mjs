/**
 * Stills from a clip at given times, for checking before recording:
 *   node tools/clips/stills.mjs <clip> <variant> <outDir> t1 t2 ...
 */
import { chromium } from 'playwright'
const [clip, v, out, ...ts] = process.argv.slice(2)
const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ viewport: { width: 1800, height: 1400 } })
page.on('pageerror', e => console.error('page error:', e.message))
await page.goto(`http://localhost:5199/tools/clips/${clip}.html?record&v=${v}`)
await page.waitForFunction(() => window.clipReady === true, null, { timeout: 30000 })
for (const t of ts) {
  await page.evaluate(t => window.renderAt(t), +t)
  await page.locator('#stage').screenshot({ path: `${out}/${clip}-${v}-${t}.png` })
}
await browser.close()

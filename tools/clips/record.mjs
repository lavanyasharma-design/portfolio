/**
 * Records a clip to MP4, frame by frame (smooth whatever the machine's speed).
 *   node tools/clips/record.mjs <clip> [variant ...]      e.g. node tools/clips/record.mjs menu wide tall
 * Needs the dev server on :5199 (npx vite --port 5199). Writes public/work/bolt/<clip>-<variant>.mp4
 * and a poster .jpg (the first frame). Uses the installed Chrome (playwright, channel 'chrome')
 * and ffmpeg-static.
 */
import { chromium } from 'playwright'
import ffmpeg from 'ffmpeg-static'
import { execFileSync } from 'node:child_process'
import { mkdirSync, rmSync, copyFileSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

const [clip, ...variants] = process.argv.slice(2)
const FPS = 30
const OUT = 'public/work/bolt'
mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch({ channel: 'chrome' })
for (const v of variants.length ? variants : ['wide']) {
  // 1.2x: sharper UI on retina screens, and even pixel sizes for every variant (1920x960, 1056x1320, 1200x1200)
  const page = await browser.newPage({ viewport: { width: 1800, height: 1400 }, deviceScaleFactor: 1.2 })
  page.on('pageerror', e => console.error('page error:', e.message))
  await page.goto(`http://localhost:5199/tools/clips/${clip}.html?record&v=${v}`)
  await page.waitForFunction(() => window.clipReady === true, null, { timeout: 30000 })
  const [w, h] = await page.evaluate(() => window.clipSize)
  const dur = await page.evaluate(() => window.clipDuration)
  const dir = join(tmpdir(), `clip-${clip}-${v}`)
  rmSync(dir, { recursive: true, force: true }); mkdirSync(dir, { recursive: true })
  const n = Math.round(dur * FPS)
  const stage = page.locator('#stage')
  for (let i = 0; i < n; i++) {
    await page.evaluate(t => window.renderAt(t), i / FPS)
    await stage.screenshot({ path: join(dir, `f${String(i).padStart(4, '0')}.png`) })
  }
  const out = join(OUT, `${clip}-${v}.mp4`)
  execFileSync(ffmpeg, ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', join(dir, 'f%04d.png'),
    '-vf', 'scale=out_color_matrix=bt709:out_range=tv,format=yuv420p',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-tune', 'animation', '-profile:v', 'high',
    '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709',
    '-movflags', '+faststart', '-an', out])
  execFileSync(ffmpeg, ['-y', '-loglevel', 'error', '-i', join(dir, 'f0000.png'), '-q:v', '3', join(OUT, `${clip}-${v}.jpg`)])
  copyFileSync(join(dir, `f${String(Math.round(n * 0.5)).padStart(4, '0')}.png`), join(tmpdir(), `clip-${clip}-${v}-mid.png`))
  console.log(`${out}: ${w}x${h}, ${n} frames`)
  await page.close()
}
await browser.close()

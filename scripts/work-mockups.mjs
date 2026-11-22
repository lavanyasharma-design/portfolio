// Makes the Work page's mockup WebPs (public/work/mockups/) from her full-size exports in art/work-mockups/,
// sized for how big they ever show (2026-11-23, the performance pass): a phone is at most 288 wide on a tile
// (243 on most) and the laptop 700, so twice that covers every 2x screen. The files were 1000 / 2000 wide,
// about 790 KB for the page; they now come to less than half that and the tiles paint sooner.
// Transparency is kept (the devices sit on the tile's colour). Run again if she swaps a mockup:
//   node scripts/work-mockups.mjs
import { spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { readdirSync, statSync } from 'node:fs'
import path from 'node:path'

const require = createRequire(import.meta.url)
const FF = require('ffmpeg-static')
const SRC = 'art/work-mockups'
const OUT = 'public/work/mockups'

// output width per file; a phone otherwise
const WIDTH = { 'fci-1': 1600, 'fci-2': 1140 }
const PHONE = 640

for (const file of readdirSync(SRC).filter((f) => f.endsWith('.webp'))) {
  const id = path.basename(file, '.webp')
  const w = WIDTH[id] ?? PHONE
  const out = path.join(OUT, file)
  const r = spawnSync(FF, ['-hide_banner', '-loglevel', 'error', '-y', '-i', path.join(SRC, file),
    '-vf', `scale='min(${w},iw)':-1:flags=lanczos`, '-c:v', 'libwebp', '-pix_fmt', 'yuva420p',
    '-quality', '88', '-compression_level', '6', out])
  if (r.status) { console.error(file, r.stderr.toString()); process.exit(1) }
  const kb = (p) => Math.round(statSync(p).size / 1024)
  console.log(`${file}: ${kb(path.join(SRC, file))} KB -> ${kb(out)} KB, ${w} wide`)
}

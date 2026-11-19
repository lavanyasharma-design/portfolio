/**
 * Finds where things sit in an exported frame (2x PNG), in design px, so patches line up.
 *   node tools/measure.mjs <png> x y w h [x y w h ...]
 * For each rect: the background colour (its top-left pixel) and the box of pixels that differ from
 * it (the "ink": text, icons), plus the ink's darkest colour. Decodes with ffmpeg-static.
 */
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ffmpeg = require('../../node_modules/ffmpeg-static');
const [file, ...nums] = process.argv.slice(2);
let W = 0;
try { execFileSync(ffmpeg, ['-hide_banner', '-i', file], { stdio: ['ignore', 'pipe', 'pipe'] }); } catch (e) {
  W = +String(e.stderr).match(/, (\d+)x(\d+)/)[1]; // ffmpeg with no output exits non-zero but prints the size
}
const px = execFileSync(ffmpeg, ['-loglevel', 'error', '-i', file, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], { maxBuffer: 1 << 28 });
const s = W / 393;
const at = (x, y) => { const i = (y * W + x) * 3; return [px[i], px[i + 1], px[i + 2]]; };
const hex = (c) => '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');
for (let i = 0; i + 3 < nums.length; i += 4) {
  const [x, y, w, h] = nums.slice(i, i + 4).map(Number);
  const X0 = Math.round(x * s), Y0 = Math.round(y * s), X1 = Math.round((x + w) * s), Y1 = Math.round((y + h) * s);
  const bg = at(X0, Y0);
  let minX = 1e9, minY = 1e9, maxX = -1, maxY = -1, dark = bg, dl = 1e9;
  for (let Y = Y0; Y < Y1; Y++) for (let X = X0; X < X1; X++) {
    const c = at(X, Y);
    if (Math.max(...c.map((v, k) => Math.abs(v - bg[k]))) > (+process.env.THRESH || 40)) {
      minX = Math.min(minX, X); maxX = Math.max(maxX, X); minY = Math.min(minY, Y); maxY = Math.max(maxY, Y);
      const l = c[0] + c[1] + c[2]; if (l < dl) { dl = l; dark = c; }
    }
  }
  const r = (v) => +(v / s).toFixed(1);
  console.log(`[${x},${y},${w},${h}] bg ${hex(bg)} ink ${maxX < 0 ? 'none' : `x ${r(minX)}..${r(maxX + 1)} y ${r(minY)}..${r(maxY + 1)} darkest ${hex(dark)}`}`);
}

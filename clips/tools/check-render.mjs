/**
 * Checks rendered case study clips against the export rule (light files that every phone decodes in
 * hardware and a slow connection can stream; hers, 2026-11-21). Run after every render:
 *   node tools/check-render.mjs [study]        (default: bolt; reads ../public/work/<study>/*.mp4)
 * Fails if a clip is not H.264, not 1056 x 1584 (the 2:3 panel at 1.2x), over H.264 level 4.1's frame
 * size (8192 macroblocks), or over 1.5 Mbps on average.
 */
import { execFileSync } from 'node:child_process';
import { readdirSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';

const require = createRequire(import.meta.url);
const ffmpeg = require('../../node_modules/ffmpeg-static');
const study = process.argv[2] || 'bolt';
const dir = join(import.meta.dirname, '../../public/work', study);
const SIZE = [1056, 1584], MAX_MB = 8192, MAX_KBPS = 1500;

let bad = 0;
const files = readdirSync(dir).filter((f) => f.endsWith('.mp4'));
if (!files.length) throw new Error(`no clips in ${dir}`);
for (const f of files) {
  let info = '';
  try { execFileSync(ffmpeg, ['-hide_banner', '-i', join(dir, f)], { stdio: ['ignore', 'pipe', 'pipe'] }); }
  catch (e) { info = String(e.stderr); } // ffmpeg with no output exits non-zero but prints the stream info
  const codec = info.match(/Video: (\w+)/)?.[1];
  const [, w, h] = info.match(/, (\d{2,5})x(\d{2,5})/) || [];
  const [, hh, mm, ss] = info.match(/Duration: (\d+):(\d+):([\d.]+)/) || [];
  const secs = +hh * 3600 + +mm * 60 + +ss;
  const kbps = Math.round((statSync(join(dir, f)).size * 8) / 1000 / secs);
  const mbs = Math.ceil(w / 16) * Math.ceil(h / 16);
  const problems = [
    codec !== 'h264' && `codec ${codec}`,
    (+w !== SIZE[0] || +h !== SIZE[1]) && `${w}x${h}, not ${SIZE.join('x')}`,
    mbs > MAX_MB && `${mbs} macroblocks, over level 4.1`,
    kbps > MAX_KBPS && `${kbps} kbps, over ${MAX_KBPS}`,
  ].filter(Boolean);
  if (problems.length) bad++;
  console.log(`${problems.length ? 'FAIL' : 'ok  '} ${f}: ${w}x${h}, ${kbps} kbps, ${secs.toFixed(1)}s${problems.length ? ' (' + problems.join('; ') + ')' : ''}`);
}
if (bad) { console.log(`${bad} of ${files.length} clips break the export rule`); process.exit(1); }
console.log(`all ${files.length} clips pass`);

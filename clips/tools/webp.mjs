/**
 * Turns a rendered still (a poster or an edge-case screen) into the WebP the case study shows, then deletes
 * the still: node tools/webp.mjs <in.png> <out.webp>
 * WebP at quality 90 is about half a JPEG's size with no difference you can see in the UI text
 * (2026-11-23, the performance pass: Bolt's eleven went from 1.15 MB to 0.59 MB). Remotion can write WebP
 * itself but without a quality setting, so the still comes out as PNG and is converted here.
 */
import { execFileSync } from 'node:child_process';
import { rmSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ffmpeg = require('../../node_modules/ffmpeg-static');

export function toWebp(src, out) {
  execFileSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', '-i', src,
    '-c:v', 'libwebp', '-quality', '90', '-compression_level', '6', out], { stdio: 'inherit' });
  rmSync(src);
}

// run directly (render-all.ps1); render.mjs imports toWebp instead
if (process.argv[1]?.endsWith('webp.mjs')) {
  const [src, out] = process.argv.slice(2);
  if (!src || !out) throw new Error('usage: node tools/webp.mjs <in.png> <out.webp>');
  toWebp(src, out);
}

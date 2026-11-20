/**
 * Renders a clip in every shape the case study uses, plus a poster (first frame) for each:
 *   npm run render -- menu            (wide + tall)
 *   npm run render -- fleet wide      (one shape)
 * Writes ../public/work/bolt/<clip>-<shape>.mp4 and .jpg. 1.2x for sharp UI on retina screens,
 * CRF 18, and low concurrency (the machine ran out of memory once at full tilt).
 */
import { execFileSync } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const [clip, ...shapes] = process.argv.slice(2);
if (!clip) throw new Error('which clip? e.g. npm run render -- menu');
const OUT = '../public/work/bolt';
mkdirSync(OUT, { recursive: true });
// the poster's frame: 0 unless the clip fades in (the menu, 2026-11-20)
const POSTER_FRAME = { menu: 15 };

for (const variant of shapes.length ? shapes : ['wide', 'tall']) {
  const props = join(tmpdir(), `clip-props-${variant}.json`);
  writeFileSync(props, JSON.stringify({ variant }));
  const run = (...args) => execFileSync('npx', ['remotion', ...args], { stdio: 'inherit', shell: true });
  run('render', clip, `${OUT}/${clip}-${variant}.mp4`, `--props=${props}`, '--scale=1.6', '--codec=h264',
    '--crf=16', '--x264-preset=slow', '--color-space=bt709', '--concurrency=2');
  run('still', clip, `${OUT}/${clip}-${variant}.jpg`, `--props=${props}`, '--scale=1.6', `--frame=${POSTER_FRAME[clip] ?? 0}`,
    '--image-format=jpeg', '--jpeg-quality=85');
}

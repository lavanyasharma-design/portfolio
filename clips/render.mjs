/**
 * Renders a clip in every shape the case study uses, plus a poster (first frame) for each:
 *   npm run render -- menu            (wide + tall)
 *   npm run render -- fleet wide      (one shape)
 * Writes ../public/work/bolt/<clip>-<shape>.mp4 and .jpg, and low concurrency (the machine ran out of memory
 * once at full tilt).
 * Light for slow connections and phones (2026-11-21, friends saw clips stutter): 1.2x, so a tall clip is
 * 1056 x 1584, still sharper than its panel on a retina screen (393 css px wide, 786 device px) and inside
 * H.264 level 4.1 (8192 macroblocks), which every phone decodes in hardware; at 1.6x (1408 x 2112) it
 * needed level 5 and some phones fell back to software decoding. CRF 20. The moov atom sits at the front
 * (Remotion's default), so a clip starts before it has fully loaded.
 */
import { execFileSync } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const [clip, ...shapes] = process.argv.slice(2);
if (!clip) throw new Error('which clip? e.g. npm run render -- menu');
const OUT = '../public/work/bolt';
mkdirSync(OUT, { recursive: true });

for (const variant of shapes.length ? shapes : ['wide', 'tall']) {
  const props = join(tmpdir(), `clip-props-${variant}.json`);
  writeFileSync(props, JSON.stringify({ variant }));
  const run = (...args) => execFileSync('npx', ['remotion', ...args], { stdio: 'inherit', shell: true });
  run('render', clip, `${OUT}/${clip}-${variant}.mp4`, `--props=${props}`, '--scale=1.2', '--codec=h264',
    '--crf=20', '--x264-preset=slow', '--color-space=bt709', '--concurrency=2');
  run('still', clip, `${OUT}/${clip}-${variant}.jpg`, `--props=${props}`, '--scale=1.2', '--frame=0',
    '--image-format=jpeg', '--jpeg-quality=85');
}

/**
 * The four case studies: copy (title, tags) from the Work page in Figma (290:12780), and
 * tile compositions, in design pixels on the 606x396 Figma tile (node 298:12978).
 * Each layer is one finished mockup from /work/mockups, placed as-is: x, y and w set its
 * box (height follows the image), rot turns it, z stacks it. Layers may run off the tile.
 * `lift` is how far a layer drifts on hover (0 for now). Tune in dev with ?tune.
 */

export const TILE_W = 606
export const TILE_H = 396

/**
 * Shared by every tile: the mockups' shadow and the card border, chosen by Lavanya on
 * 2026-11-11. Shadow lengths are design px. It is two drop-shadows that follow the
 * device's own shape: a soft one (x, y, blur, opacity) and a tight contact one under it
 * (contact scales its strength).
 */
export const LOOK = {
  shadow: { on: true, x: 1, y: 5, blur: 4, opacity: 0.2, contact: 0.45, color: '#454545' },
  border: { on: true, color: '#dddddd' },
}

/**
 * Each tile's own background. mode: solid (c1), linear (c1 to c2 at angle), radial (c1 at
 * the top fading to c2), motif (the home page motif over c1). Tune with ?tune.
 */
export const DEFAULT_BG = { mode: 'solid', c1: '#f6f0ff', c2: '#e8dbff', angle: 360 } // chosen 2026-11-11, every tile

const M = '/work/mockups/'
const layer = (id, x, y, w, rest = {}) => ({ id, src: `${M}${id}.webp`, x, y, w, rot: 0, z: 1, lift: { x: 0, y: 0 }, on: true, ...rest })

/**
 * One margin for every tile: the space between a device's visible edge and the tile's edge,
 * wherever the device doesn't run off. Change PAD and every layout follows.
 * Phones that run off the bottom sit TOP from the top edge instead.
 */
export const PAD = 46
const TOP = 22
// Measured from the webp files: height per unit of width, and transparent space before
// the device's visible left edge (the Android files carry 4px of 1000; the MacBook's lid
// starts 33px in of 2000, the base is wider than the lid)
const IPHONE_H = 2069 / 1000
const ANDROID_IN = 4 / 1000
const LID_IN = 33 / 2000
const R = TILE_W - PAD // right edge of the content box

export const TILES = [
  {
    id: 'bolt',
    label: 'Bolt, fleet management',
    title: 'Mobile friendly fleet management SaaS that gives users flexibility',
    tags: ['cross platform', 'prioritisation'],
    // one phone rising from the bottom, one hanging from the top: PAD on all four sides,
    // the same width, 28 between them
    layers: [
      layer('bolt-1', PAD, PAD, 243),
      layer('bolt-2', R - 243, TILE_H - PAD - 243 * IPHONE_H, 243),
    ],
  },
  {
    id: 'fci',
    label: 'FCI, release order dashboard',
    title: 'Role based supply chain for Gujarat government’s food grain distribution',
    tags: ['offline to digital', 'systems thinking'],
    // laptop running off the right and bottom, lid PAD from the top and left
    layers: [
      layer('fci-1', PAD - 700 * LID_IN, PAD, 700),
    ],
  },
  {
    id: 'emi',
    label: 'BharatPe, EMI credit card',
    title: 'End to end experience of BharatPe’s EMI Card for first time credit users',
    tags: ['0 to 1 launch', 'edge case mapping'],
    // two phones side by side, top-aligned, running off the bottom; the gap between
    // them comes out at PAD too
    layers: [
      layer('emi-1', PAD - 235 * ANDROID_IN, TOP, 235),
      layer('emi-2', R - 235, TOP, 235),
    ],
  },
  {
    id: 'bbps',
    label: 'BharatPe, bill payments',
    title: 'Audit and redesign of bill payments on BharatPe’s UPI app for consistency',
    tags: ['legacy revamp', 'journey optimisation'],
    // scale: the recharge plans large behind, bill payments smaller in front, overlapping 15
    layers: [
      layer('bbps-2', R - 288, TOP, 288),
      layer('bbps-1', PAD - 243 * ANDROID_IN, 115, 243, { z: 2 }),
    ],
  },
]

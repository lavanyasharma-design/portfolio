/**
 * Tile compositions, in design pixels on the 606x396 Figma tile (node 298:12978).
 * Each layer is one finished mockup from /work/mockups, placed as-is: x, y and w set its
 * box (height follows the image), rot turns it, z stacks it. Layers may run off the tile.
 * `lift` is how far a layer drifts on hover (0 for now). Tune in dev with ?tune.
 */

export const TILE_W = 606
export const TILE_H = 396

const M = '/work/mockups/'
const layer = (id, x, y, w, rest = {}) => ({ id, src: `${M}${id}.webp`, x, y, w, rot: 0, z: 1, lift: { x: 0, y: 0 }, on: true, ...rest })

export const TILES = [
  {
    id: 'bolt',
    label: 'Bolt, fleet management',
    // one phone rising from the bottom, one hanging from the top
    layers: [
      layer('bolt-1', 42, 62, 248),
      layer('bolt-2', 318, -140, 243),
    ],
  },
  {
    id: 'fci',
    label: 'FCI, release order dashboard',
    // laptop running off the right and bottom
    layers: [
      layer('fci-1', 29, 52, 700),
    ],
  },
  {
    id: 'emi',
    label: 'BharatPe, EMI credit card',
    // two phones side by side, top-aligned, running off the bottom
    layers: [
      layer('emi-1', 45, 39, 235),
      layer('emi-2', 322, 38, 235),
    ],
  },
  {
    id: 'bbps',
    label: 'BharatPe, bill payments',
    // scale: the recharge plans large behind, bill payments smaller in front
    layers: [
      layer('bbps-2', 268, 38, 282),
      layer('bbps-1', 44, 131, 240, { z: 2 }),
    ],
  },
]

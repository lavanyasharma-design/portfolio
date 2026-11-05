// Tunables for MotifField. Settle values with ?motif on the URL (live panel), then copy them here.
// Current values chosen by Lavanya by eye on 2026-11-05.
export const MOTIF = {
  hover: '#B58FF7',       // idle colour (#E8DBFF) lives in /motif.svg; this replaces it under the pointer
  weight: 0.15,           // outline added to the dark motif (SVG units, tile is 48). 0 = the raw SVG, which reads dotted
  tile: { x: -57, y: -39, w: 46.4, h: 46 }, // must match the CSS background position / size
  mode: 'soft',           // 'soft': fluid blob with a wake · 'tiles': whole motifs darken and ripple
  radius: 57,             // px. 70 ≈ a 2x2 block of motifs; 5cm on a 96dpi screen ≈ 189
  soft: 0.75,             // share of the radius that feathers out (soft mode)
  follow: 0.5,           // 0-1, how fast the blob catches the pointer each frame; lower = more drag
  trail: 0.7,            // s, how long the wake / a darkened motif takes to settle back
  wobble: 0.16,           // share of the radius the blob's edge breathes by
}

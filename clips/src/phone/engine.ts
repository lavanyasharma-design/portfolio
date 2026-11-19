/**
 * Timing helpers for the case study clips, ported from tools/clips/engine.js (2026-11-16).
 * Everything works in seconds (t = frame / fps) so the props in Studio read as seconds.
 * Positions are Figma design px on the 393 x 852 iOS screen.
 */

export const SCREEN = { w: 393, h: 852, r: 47 };
export const BEZEL = 12;

export const ease = {
  inOut: (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2),
  out: (t: number) => 1 - (1 - t) ** 3,
  in: (t: number) => t * t * t,
  // iOS-like: quick start, long soft landing
  ios: (t: number) => 1 - (1 - t) ** 4,
  linear: (t: number) => t,
};
type Ease = (t: number) => number;

/** 0 before a, 1 after b, eased in between */
export function seg(t: number, a: number, b: number, e: Ease = ease.inOut) {
  if (t <= a) return 0;
  if (t >= b) return 1;
  return e((t - a) / (b - a));
}

type Val = number | number[];
/** a value from keyframes [[time, value], ...], held before the first and after the last */
export function keys<V extends Val>(t: number, list: [number, V][], e: Ease = ease.inOut): V {
  if (t <= list[0][0]) return list[0][1];
  for (let i = 1; i < list.length; i++) {
    const [t1, v1] = list[i];
    if (t <= t1) {
      const [t0, v0] = list[i - 1];
      const k = t1 === t0 ? 1 : e((t - t0) / (t1 - t0));
      return (Array.isArray(v0)
        ? v0.map((v, j) => v + ((v1 as number[])[j] - v) * k)
        : (v0 as number) + ((v1 as number) - (v0 as number)) * k) as V;
    }
  }
  return list[list.length - 1][1];
}

/** a light press that comes and goes around time `at` (0..1) */
export const pressed = (t: number, at: number, len = 0.22) =>
  t < at || t > at + len ? 0 : Math.sin(((t - at) / len) * Math.PI);

/** the panel shapes on the case study page */
export const VARIANTS = {
  wide: { w: 1600, h: 800, fill: 0.84 }, // 2:1 (no longer on the page: phone clips are all 4:5 now)
  tall: { w: 880, h: 1320, fill: 0.92 }, // 2:3: every phone clip's panel, taller so the UI reads (hers, 2026-11-19)
  square: { w: 1000, h: 1000, fill: 0.87 },
  phone: { w: 900, h: 1860, fill: 0.95 }, // just the phone, no panel: the edge-case screens
};

/**
 * Slows a clip's timeline by k (her pace, 2026-11-19: the geofence slider's, with time to see the UI
 * between actions): every time is multiplied by k, but a [start, end] pair (a screen slide, a sheet)
 * stretches its length by at most 1.25 so the motion itself doesn't go slow-motion. Longer lists (the
 * slider's moves) stretch fully. The camera is slowed by evaluating its keyframes at t / k.
 */
export function stretch<T extends Record<string, number | number[]>>(T: T, k: number): T {
  const out: Record<string, number | number[]> = {};
  for (const [key, v] of Object.entries(T)) {
    out[key] = typeof v === 'number' ? v * k
      : v.length === 2 ? [v[0] * k, v[0] * k + (v[1] - v[0]) * Math.min(k, 1.25)]
      : v.map((x) => x * k);
  }
  return out as T;
}
export type Variant = keyof typeof VARIANTS;

/** the camera's rest: whole phone, centred */
export const REST: [number, number] = [1, SCREEN.h / 2];

/**
 * The camera as plain keyframes: [time, zoom, screen height to centre on], eased between, held
 * outside. Zooms are slight (1.15) unless a clip says otherwise; 1 is the whole phone.
 */
export function cam(t: number, list: [number, number, number][]): [number, number] {
  return keys(t, list.map(([at, z, fy]) => [at, [z, fy]] as [number, number[]])) as [number, number];
}

/**
 * Camera keyframes from a list of taps. For each tap the camera goes in on `fy` (the screen height to
 * centre on), arriving `before` s ahead of the tap after `inFor` s, holds `hold` s past the tap, then
 * eases back out to the whole phone over `outFor` s. Her pacing: gentle in, slow out, never sideways.
 */
export function tapCamera(
  taps: { at: number; fy: number; hold: number }[],
  o: { zoom: number; inFor: number; before: number; outFor: number },
) {
  const list: [number, number[]][] = [];
  for (const tap of [...taps].sort((a, b) => a.at - b.at)) {
    const arrive = tap.at - o.before;
    const leave = tap.at + tap.hold;
    list.push([arrive - o.inFor, REST], [arrive, [o.zoom, tap.fy]], [leave, [o.zoom, tap.fy]], [leave + o.outFor, REST]);
  }
  return list.length ? list : [[0, REST] as [number, number[]]];
}

import React, { useEffect, useState } from 'react';
import { AbsoluteFill, Img, cancelRender, continueRender, delayRender, staticFile } from 'remotion';
import { BEZEL, SCREEN, VARIANTS, type Variant } from './engine';

/** an exported Figma frame (at 2x): its path under public/ and its design height */
export type Frame = { src: string; h: number };
export const frame = (path: string, h: number): Frame => ({ src: staticFile(path), h });

/**
 * The stage: the panel background and the iPhone (393 x 852 screen, 12px bezel, island), whole and still,
 * centred in the frame at the variant's fill. No camera: the zooms were dropped (hers, 2026-11-21), they read
 * as a wobble and the phone is clear enough in its panel without them.
 */
export const Stage: React.FC<{
  variant: Variant;
  background: string;
  children: React.ReactNode;
}> = ({ variant, background, children }) => {
  useFonts();
  const v = VARIANTS[variant];
  const dw = SCREEN.w + 2 * BEZEL;
  const dh = SCREEN.h + 2 * BEZEL;
  const S = (v.h * v.fill) / dh;

  return (
    <AbsoluteFill style={{ background, overflow: 'hidden' }}>
      <div
        style={{
          position: 'absolute', left: 0, top: 0, transformOrigin: '0 0',
          transform: `translate(${(v.w - dw * S) / 2}px, ${(v.h - dh * S) / 2}px) scale(${S})`,
        }}
      >
        <div
          style={{
            position: 'absolute', left: 0, top: 0, width: dw, height: dh,
            borderRadius: SCREEN.r + BEZEL, background: '#121212',
            boxShadow: '0 0 0 1.5px #3b3b3b inset, 0 1px 2px #4545452e, 0 18px 44px #45454530',
          }}
        >
          <div
            style={{
              position: 'absolute', left: BEZEL, top: BEZEL, width: SCREEN.w, height: SCREEN.h,
              borderRadius: SCREEN.r, overflow: 'hidden', background: '#fff', isolation: 'isolate',
            }}
          >
            {children}
          </div>
          {/* dynamic island, over the screen's own status bar */}
          <div
            style={{
              position: 'absolute', left: BEZEL + (SCREEN.w - 122) / 2, top: BEZEL + 11,
              width: 122, height: 35, borderRadius: 18, background: '#000', zIndex: 10,
            }}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** a positioned box (design px) */
export const Box: React.FC<{
  x?: number; y?: number; w?: number | string; h?: number | string; z?: number;
  style?: React.CSSProperties; children?: React.ReactNode;
}> = ({ x = 0, y = 0, w = '100%', h = '100%', z, style, children }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, zIndex: z, ...style }}>{children}</div>
);

/** a crop of a frame: the design-px rect (x, y, w, h) of the image, placed at `at` */
export const Crop: React.FC<{
  img: Frame; x: number; y: number; w: number; h: number; at?: [number, number]; style?: React.CSSProperties;
}> = ({ img, x, y, w, h, at = [x, y], style }) => (
  <div style={{ position: 'absolute', left: at[0], top: at[1], width: w, height: h, overflow: 'hidden', ...style }}>
    <Img src={img.src} style={{ position: 'absolute', left: -x, top: -y, width: SCREEN.w, height: img.h, maxWidth: 'none' }} />
  </div>
);

/** a picture at design size */
export const Pic: React.FC<{
  src: string; x: number; y: number; w: number; h: number; z?: number; style?: React.CSSProperties;
}> = ({ src, x, y, w, h, z, style }) => (
  <Img src={src} style={{ position: 'absolute', left: x, top: y, width: w, height: h, zIndex: z, maxWidth: 'none', ...style }} />
);

/** a solid patch, to cover something in a frame */
export const Patch: React.FC<{ x: number; y: number; w: number; h: number; color: string }> = ({ x, y, w, h, color }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, background: color }} />
);

/** a pressed state: a soft dark wash over a rect; k 0..1 (light: 12% at most) */
export const Press: React.FC<{ x: number; y: number; w: number; h: number; r?: number; k: number }> = ({ x, y, w, h, r = 8, k }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: r, background: '#000', opacity: 0.12 * k }} />
);

/**
 * A whole screen from a tall frame, scrolled by `y`, between fixed chrome: `top` design px (status
 * and app bar) stay at the top, `bottom` px (tab bar, home indicator) at the bottom. `children`
 * scroll with the content. `cut` [from, to] lifts a band out of the frame (a row that shouldn't be
 * there) and closes the gap. `style` is for the push (transform, filter, visibility).
 */
export const ScrollScreen: React.FC<{
  img: Frame; y: number; top?: number; bottom?: number; cut?: [number, number];
  style?: React.CSSProperties; children?: React.ReactNode;
}> = ({ img, y, top = 54, bottom = 80, cut, style, children }) => {
  const gap = cut ? cut[1] - cut[0] : 0;
  const max = img.h - gap - SCREEN.h;
  const s = Math.max(0, Math.min(max, y));
  return (
    <AbsoluteFill style={{ overflow: 'hidden', background: '#fff', ...style }}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: SCREEN.w, height: SCREEN.h - bottom, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, width: SCREEN.w, height: img.h - gap, transform: `translateY(${-s}px)` }}>
          {cut ? (
            <>
              <Crop img={img} x={0} y={0} w={SCREEN.w} h={cut[0]} />
              <Crop img={img} x={0} y={cut[1]} w={SCREEN.w} h={img.h - cut[1]} at={[0, cut[0]]} />
            </>
          ) : (
            <Img src={img.src} style={{ position: 'absolute', inset: 0, width: SCREEN.w, height: img.h, maxWidth: 'none' }} />
          )}
          {children}
        </div>
      </div>
      <Crop img={img} x={0} y={0} w={SCREEN.w} h={top} />
      <Crop img={img} x={0} y={img.h - bottom} w={SCREEN.w} h={bottom} at={[0, SCREEN.h - bottom]} />
    </AbsoluteFill>
  );
};

/** iOS push: `to` slides in from the right over `from`, which drifts left and dims; k 0..1 */
export function push(k: number): { from: React.CSSProperties; to: React.CSSProperties } {
  return {
    to: {
      transform: `translateX(${(1 - k) * 100}%)`,
      boxShadow: k > 0 && k < 1 ? '-8px 0 24px #0000001f' : 'none',
      visibility: k > 0 ? 'visible' : 'hidden',
    },
    from: {
      transform: `translateX(${-30 * k}%)`,
      filter: `brightness(${1 - 0.08 * k})`,
      visibility: k < 1 ? 'visible' : 'hidden',
    },
  };
}

/** iOS back: `from` slides out to the right, `to` comes back from 30% left; k 0..1 */
export function pop(k: number): { from: React.CSSProperties; to: React.CSSProperties } {
  return {
    from: {
      transform: `translateX(${k * 100}%)`,
      boxShadow: k > 0 && k < 1 ? '-8px 0 24px #0000001f' : 'none',
      visibility: k < 1 ? 'visible' : 'hidden',
      zIndex: 2,
    },
    to: {
      transform: `translateX(${-30 * (1 - k)}%)`,
      filter: `brightness(${0.92 + 0.08 * k})`,
      visibility: k > 0 ? 'visible' : 'hidden',
    },
  };
}

/** a whole frame as a screen layer (frames may export a few px wider than 393: `w`) */
export const Screen: React.FC<{ img: Frame; w?: number; style?: React.CSSProperties; children?: React.ReactNode }> = ({ img, w = SCREEN.w, style, children }) => (
  <AbsoluteFill style={{ overflow: 'hidden', ...style }}>
    <Img src={img.src} style={{ position: 'absolute', left: (SCREEN.w - w) / 2, top: 0, width: w, height: img.h, maxWidth: 'none' }} />
    {children}
  </AbsoluteFill>
);

/**
 * New words over a frame's text: covers the old text with its background and sets the new in Inter,
 * lined up on the old text's cap height. (x, capTop) is the old glyphs' left and cap top, capH their
 * cap height (from tools/measure.mjs); `cover` is the patch [x, y, w, h] when the default won't do.
 */
export const Retext: React.FC<{
  x: number; capTop: number; capH: number; text: string; color: string; bg: string;
  weight?: number; cover?: [number, number, number, number]; align?: 'left' | 'center'; width?: number;
}> = ({ x, capTop, capH, text, color, bg, weight = 600, cover, align = 'left', width }) => {
  const F = capH / 0.727; // Inter's cap height
  const [cx, cy, cw, ch] = cover ?? [x - 2, capTop - 0.35 * F, 0.68 * F * text.length + 6, 1.15 * F];
  return (
    <>
      <div style={{ position: 'absolute', left: cx, top: cy, width: cw, height: ch, background: bg }} />
      <div style={{
        position: 'absolute', left: align === 'center' ? 0 : x, width: align === 'center' ? (width ?? SCREEN.w) : undefined,
        top: capTop - 0.1363 * F, font: `${weight} ${F}px/${F}px Inter, sans-serif`, color, whiteSpace: 'nowrap',
        textAlign: align, letterSpacing: 0,
      }}>{text}</div>
    </>
  );
};

/** the dim behind a sheet; k 0..1 */
export const Veil: React.FC<{ k: number; z?: number }> = ({ k, z }) => (
  <AbsoluteFill style={{ background: '#000', opacity: 0.4 * k, zIndex: z }} />
);

/** a payment success mark: a green circle that lands with a little overshoot, then the tick draws in */
export const SuccessTick: React.FC<{ t: number; at: number; x: number; y: number; size: number; color?: string }> = ({ t, at, x, y, size, color = '#13c27f' }) => {
  const u = t - at;
  if (u < 0) return null;
  // circle: scale 0 -> 1.12 -> 1 (0.45s); tick: draws over 0.3s from 0.3s; a faint ring pulses out
  const s = u < 0.3 ? (u / 0.3) * 1.12 : u < 0.45 ? 1.12 - ((u - 0.3) / 0.15) * 0.12 : 1;
  const draw = Math.min(1, Math.max(0, (u - 0.3) / 0.3));
  const ring = Math.min(1, Math.max(0, (u - 0.25) / 0.6));
  const len = 60;
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} style={{ position: 'absolute', left: x - size / 2, top: y - size / 2, overflow: 'visible' }}>
      <circle cx="50" cy="50" r={34 + 20 * ring} fill="none" stroke={color} strokeWidth="2" opacity={0.35 * (1 - ring)} />
      <circle cx="50" cy="50" r="34" fill={color} transform={`translate(50 50) scale(${s}) translate(-50 -50)`} />
      <path d="M34 51 L45 62 L67 39" fill="none" stroke="#fff" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"
        strokeDasharray={len} strokeDashoffset={len * (1 - draw)} />
    </svg>
  );
};

/* ---------- image work that has to happen before the first frame ---------- */

/** widths of texts set in Inter (after it has loaded), so what follows a new word can move along */
export function useTextWidths(texts: string[], weight: number, size: number) {
  return useAsync(async () => {
    await document.fonts.load(`${weight} ${size}px Inter`);
    const g = document.createElement('canvas').getContext('2d')!;
    g.font = `${weight} ${size}px Inter`;
    return Object.fromEntries(texts.map((s) => [s, g.measureText(s).width])) as Record<string, number>;
  }, [], 'measuring text');
}

/** waits for Inter (the app's type, used for Retext) before the first frame */
function useFonts() {
  useAsync(async () => {
    await Promise.all(['400', '500', '600'].map((w) => document.fonts.load(`${w} 16px Inter`)));
    return true;
  }, [], 'loading Inter');
}

async function pixels(src: string) {
  const i = new Image();
  i.src = src;
  await i.decode();
  const c = document.createElement('canvas');
  c.width = i.width;
  c.height = i.height;
  const g = c.getContext('2d')!;
  g.drawImage(i, 0, 0);
  return { c, g, i };
}

function useAsync<T>(make: () => Promise<T>, deps: unknown[], label: string): T | null {
  const [value, setValue] = useState<T | null>(null);
  const [handle] = useState(() => delayRender(label));
  useEffect(() => {
    make().then((v) => { setValue(v); continueRender(handle); }).catch((e) => cancelRender(e));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return value;
}

/**
 * Figma's MCP export flattens a layer onto the canvas grey (#f3f4f5), so nothing comes out
 * transparent. This keys that grey out: within `lo` of it goes clear, fading to solid by `hi`.
 * Fine over Bolt's maps, which are nearly the same grey. Returns { name: objectURL } once ready.
 */
export function useKeyed(srcs: Record<string, string>, bg = [243, 244, 245], lo = 3, hi = 18) {
  return useAsync(async () => {
    const out: Record<string, string> = {};
    await Promise.all(Object.entries(srcs).map(async ([name, src]) => {
      const { c, g } = await pixels(src);
      const d = g.getImageData(0, 0, c.width, c.height);
      for (let p = 0; p < d.data.length; p += 4) {
        const dist = Math.max(Math.abs(d.data[p] - bg[0]), Math.abs(d.data[p + 1] - bg[1]), Math.abs(d.data[p + 2] - bg[2]));
        d.data[p + 3] = Math.round(255 * Math.min(1, Math.max(0, (dist - lo) / (hi - lo))));
      }
      g.putImageData(d, 0, 0);
      const blob = await new Promise<Blob>((r) => c.toBlob((b) => r(b!)));
      out[name] = URL.createObjectURL(blob);
    }));
    return out;
  }, [], 'keying map layers');
}

/** read pixel colours from frames, for patches that must match: { name: [frame, x, y] } in design px */
export function useSampled(points: Record<string, [Frame, number, number]>) {
  return useAsync(async () => {
    const out: Record<string, string> = {};
    for (const [name, [img, x, y]] of Object.entries(points)) {
      const { g, i } = await pixels(img.src);
      const s = i.width / SCREEN.w;
      const [r, gg, b] = g.getImageData(Math.round(x * s), Math.round(y * s), 1, 1).data;
      out[name] = `rgb(${r} ${gg} ${b})`;
    }
    return out;
  }, [], 'sampling frame colours');
}

/**
 * Device management clip (feature 3; Figma "clip:devices", script locked 2026-11-19), all in view, no
 * scrolling: tap the Maintenance card, it expands and holds for 0.5s; tap
 * the filter icon; on the filter, untick Devices only and tick Device groups;
 * Apply; the group-wise list.
 * Her edits over the frames: the filter icon beside search (from the fourth frame) on the list; only
 * the Maintenance card expands (frame 2 has Inactive open too); groups "ABC Corp" and "XYZ shop" and
 * a different Indian-style number for every device. Times in seconds in T.
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { stretch, ease, pressed, seg } from '../phone/engine';
import { Box, Crop, Press, Retext, Screen, Stage, frame, pop, push, useTextWidths, type Frame } from '../phone/layers';
import type { ClipProps } from '../phone/schema';

const K = 1.75; // slowed to her pace (2026-11-19), see stretch()
const T = stretch({
  card: 0.4, expand: [0.5, 0.9],
  filter: 2.4, toFilter: [2.55, 3.1],
  devicesOnly: 3.4, groups: 3.7,
  apply: 4.5, back: [4.65, 5.2],
}, K);
const INK = '#272838';
const TEAL = '#2c958c';
// a different number for every device (no spaces, the frames' own pattern, so the badges stay put)
// each card's badge width in the compact list (frames 1 and 2), by status
const BADGE_W = [45, 54, 84, 52, 45, 54, 84];
const PLATES = ['MH12AB4521', 'KA05MN2210', 'DL08CT7781', 'TN09BK6634', 'RJ14CD9082', 'UP32GH1457', 'HR26DK3319'];

/**
 * A device's new name with its status badge moved along after it (the numbers are wider than the
 * frames' words): covers the old name and badge, sets the name, puts the frame's badge back 7px after
 * it, as in her frames. (x, capTop, capH): the old name; badge: the frame's badge rect [x, y, w, h].
 */
const Named: React.FC<{ img: Frame; x: number; capTop: number; capH: number; text: string; badge: [number, number, number, number]; top?: number; width?: number; bg?: string }> =
  ({ img, x, capTop, capH, text, badge, top, width, bg = '#fff' }) => {
    const [bx, by, bw, bh] = badge; // where the badge is in the frame
    const y = top ?? by;            // where it goes (inside a moved box, the box's own y)
    return (
      <>
        <div style={{ position: 'absolute', left: x - 2, top: y - 1, width: bx + bw + 3 - x, height: bh + 2, background: bg }} />
        <Retext x={x} capTop={capTop + y - by} capH={capH} text={text} color={INK} bg={bg} cover={[x, 0, 0, 0]} />
        <Crop img={img} x={bx} y={by} w={bw} h={bh} at={[x + (width ?? 100) + 7, y]} />
      </>
    );
  };

/** an empty checkbox, as the app draws them */
const Box0: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: 18, height: 18, borderRadius: 2, background: '#fff', boxShadow: `inset 0 0 0 1.6px ${TEAL}` }} />
);

export const Devices: React.FC<ClipProps> = (p) => {
  const t = (useCurrentFrame() / useVideoConfig().fps) * 0.8; // her speed from the pace page (2026-11-19)
  const w17 = useTextWidths(PLATES, 600, 12.5 / 0.727) ?? {};
  const w18 = useTextWidths(PLATES, 600, 13 / 0.727) ?? {};
  const Plate: React.FC<{ y: number; i: number }> = ({ y, i }) => (
    <Named img={LIST} x={36.5} capTop={202 + 98 * i + 23} capH={12.5} text={PLATES[i]} badge={[144, 202 + 98 * i + 16, BADGE_W[i], 26]} top={y + 16} width={w17[PLATES[i]]} />
  );
  const LIST = frame('bolt/devices/1-list.png', 852);
  const OPEN = frame('bolt/devices/2-expanded.png', 852);
  const FILTER = frame('bolt/devices/3-filter.png', 852);
  const GROUPS = frame('bolt/devices/4-groups.png', 852);

  const k = seg(t, T.expand[0], T.expand[1], ease.inOut); // the Maintenance card opening, 86 -> 254 tall
  const grow = 168 * k;
  const toFilter = push(seg(t, T.toFilter[0], T.toFilter[1], ease.ios));
  const back = pop(seg(t, T.back[0], T.back[1], ease.ios));
  const devicesOnly = t < T.devicesOnly + 0.1;
  const groups = t > T.groups + 0.1;

  return (
    <Stage variant={p.variant} background={p.background}>
      {/* the list: frame 1, the Maintenance card from frame 2 opening in place, the cards below moving down */}
      <Screen img={LIST} style={toFilter.from}>
        <Plate y={202} i={0} />
        <Plate y={300} i={1} />
        <Box x={0} y={398} w={393} h={434} style={{ overflow: 'hidden' }}>
          {k > 0 ? (
            <Box x={0} y={0} w={393} h={86 + grow} style={{ overflow: 'hidden' }}>
              <Crop img={OPEN} x={0} y={476} w={393} h={254} at={[0, 0]} />
            </Box>
          ) : null}
          <Box x={0} y={0} w={393} h={434}>
            <Plate y={0} i={2} />
          </Box>
          <Box x={0} y={grow} w={393} h={434}>
            {k > 0 ? <Crop img={LIST} x={0} y={484} w={393} h={348} at={[0, 86]} /> : null}
            {[3, 4, 5, 6].map((i) => <Plate key={i} y={98 * (i - 2)} i={i} />)}
          </Box>
          <Press x={20} y={0} w={353} h={86} r={8} k={pressed(t, T.card)} />
        </Box>
        <Crop img={LIST} x={0} y={832} w={393} h={20} />
        {/* the filter icon beside search, from the group-wise frame (2px higher there) */}
        <Crop img={GROUPS} x={0} y={90} w={393} h={56} at={[0, 92]} />
        <Press x={325} y={96} w={48} h={48} r={8} k={pressed(t, T.filter)} />
      </Screen>

      {/* the filter: Devices only goes off, Device groups on */}
      <Screen img={FILTER} w={397} style={t < T.back[0] ? toFilter.to : back.from}>
        {groups ? null : <Box0 x={205} y={118} />}
        {devicesOnly ? null : <Box0 x={205} y={166} />}
        <Press x={190} y={106} w={203} h={42} r={0} k={pressed(t, T.groups)} />
        <Press x={190} y={154} w={203} h={42} r={0} k={pressed(t, T.devicesOnly)} />
        <Press x={204} y={772} w={173} h={41} r={8} k={pressed(t, T.apply)} />
      </Screen>

      {/* group-wise: her names */}
      <Screen img={GROUPS} style={back.to}>
        <Retext x={32.5} capTop={216} capH={12.3} text="ABC Corp" color={INK} bg="#ebf6f4" cover={[31, 210, 100, 25]} />
        <Retext x={32.5} capTop={554} capH={12.3} text="XYZ shop" color={INK} bg="#ebf6f4" cover={[31, 548, 100, 25]} />
        <Named img={GROUPS} x={70} capTop={262.5} capH={13} text={PLATES[0]} badge={[178, 256, 45, 26]} width={w18[PLATES[0]]} />
        <Named img={GROUPS} x={49} capTop={348.5} capH={13} text={PLATES[1]} badge={[156, 342, 54, 26]} width={w18[PLATES[1]]} />
        <Named img={GROUPS} x={36.5} capTop={459} capH={12.5} text={PLATES[2]} badge={[144, 452, 45, 26]} width={w17[PLATES[2]]} />
        <Named img={GROUPS} x={70} capTop={600.5} capH={13} text={PLATES[3]} badge={[178, 594, 45, 26]} width={w18[PLATES[3]]} />
        <Named img={GROUPS} x={49} capTop={686.5} capH={13} text={PLATES[4]} badge={[156, 680, 84, 26]} width={w18[PLATES[4]]} />
        <Named img={GROUPS} x={36.5} capTop={797} capH={12.5} text={PLATES[5]} badge={[144, 790, 52, 26]} width={w17[PLATES[5]]} />
      </Screen>
    </Stage>
  );
};

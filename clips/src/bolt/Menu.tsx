/**
 * Menu clip (Lavanya's note, Figma "clip - menu", script locked 2026-11-19): the menu scrolls to show
 * every option and back; tap Edit; on Edit Shortcuts untick Reports, tick POI (up to 3, as a real user
 * would), tap the floating Save Changes; back on the menu, POI is among the shortcuts.
 * Her changes: no POI row in the menu's Device Management list (it would give the ending away), the
 * floating Save Changes frame (Figma 40011704:29279), no scrolling on the edit screen, shorter. Save Changes
 * isn't there until there's a change: it rises from behind the tab bar as Reports is unticked (hers,
 * 2026-11-21). A plain loop, no fade (the fade read as off; hers, 2026-11-21).
 * Times in seconds in T.
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { ease, keys, pressed, seg } from '../phone/engine';
import { Crop, Patch, Press, Screen, ScrollScreen, Stage, frame, push, useSampled } from '../phone/layers';
import type { ClipProps } from '../phone/schema';

const T = {
  scrollDown: [0.3, 3.5], scrollUp: [4.0, 5.5],
  edit: 6.7, pushIn: [6.9, 7.45],
  reports: 8.6, poi: 9.1,
  save: 10.2, pushOut: [10.4, 10.95],
  saveRise: 0.45, // s Save Changes takes to rise once Reports is unticked
};
const POI_ROW: [number, number] = [486.5, 535]; // the POI row and the divider under it, lifted out

export const Menu: React.FC<ClipProps> = (p) => {
  const t = useCurrentFrame() / useVideoConfig().fps;
  const MENU = frame('bolt/menu/menu.png', 1393);
  const EDIT = frame('bolt/menu/edit-float.png', 852);
  const PLAIN = frame('bolt/menu/edit.png', 1363); // the edit screen with no Save Changes: its content sits 17 lower
  const c = useSampled({ tile: [MENU, 147, 256], teal: [EDIT, 40, 700] });

  const slide = push(seg(t, T.pushIn[0], T.pushIn[1], ease.ios) * (1 - seg(t, T.pushOut[0], T.pushOut[1], ease.ios)));
  const unticked = seg(t, T.reports + 0.1, T.reports + 0.3, ease.out); // Reports' tick goes
  const ticked = seg(t, T.poi + 0.1, T.poi + 0.35, ease.out);         // POI's comes
  const rise = seg(t, T.reports + 0.15, T.reports + 0.15 + T.saveRise, ease.ios); // Save Changes comes up

  return (
    <Stage variant={p.variant} background={p.background}>
      <ScrollScreen
        img={MENU}
        top={54}
        bottom={80}
        cut={POI_ROW}
        style={slide.from}
        y={keys(t, [[T.scrollDown[0], 0], [T.scrollDown[1], 493], [T.scrollUp[0], 493], [T.scrollUp[1], 0]])}
      >
        {/* the edited shortcut: POI takes Report's place (the middle tile), once saved */}
        {c && t > T.pushOut[0] ? (
          <div style={{ position: 'absolute', inset: 0 }}>
            <Patch x={157.7} y={204} w={78} h={54} color={c.tile} />
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke={c.teal} strokeWidth="1.6"
              strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: 184.5, top: 208 }}>
              <path d="M19 10c0 4.4-4.9 9-6.5 10.4a.8.8 0 0 1-1 0C9.9 19 5 14.4 5 10a7 7 0 0 1 14 0" />
              <circle cx="12" cy="10" r="2.6" />
            </svg>
            <span style={{
              position: 'absolute', left: 141.7, top: 238, width: 109.7, height: 16, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              font: "600 10.5px/1 Inter, sans-serif", color: '#262626',
            }}>POI</span>
          </div>
        ) : null}
        <Press x={344} y={164} w={38} h={24} r={6} k={pressed(t, T.edit)} />
      </ScrollScreen>

      <Screen img={EDIT} style={slide.to}>
        {/* Reports starts ticked (Figma), gets unticked: the empty box borrowed from Immobilize's row */}
        <Crop img={EDIT} x={322} y={250.5} w={22} h={22} at={[322, 608.5]} style={{ opacity: unticked }} />
        {/* POI gets ticked: the tick borrowed from Geofence's row */}
        <Crop img={EDIT} x={322} y={202} w={22} h={22} at={[322, 347.5]}
          style={{ opacity: ticked, transform: `scale(${0.7 + 0.3 * ticked})`, transformOrigin: '11px 11px' }} />
        {/* no Save Changes until a change: the band behind it from the plain frame (17 lower there), the button
            rising from behind the tab bar (redrawn over it); button x 16-377, y 688-728, radius 8 (measured) */}
        <Crop img={PLAIN} x={0} y={697} w={393} h={90} at={[0, 680]} />
        {/* the plain frame's boxes are drawn darker: Stream & event gets this frame's empty box (Immobilize's) */}
        <Crop img={EDIT} x={322} y={250.5} w={22} h={22} at={[322, 725.5]} />
        <div style={{
          position: 'absolute', left: 16, top: 688, width: 361, height: 40, borderRadius: 8, overflow: 'hidden',
          boxShadow: '0 2px 4px #00000012', transform: `translateY(${(1 - rise) * 100}px)`,
        }}>
          <Crop img={EDIT} x={16} y={688} w={361} h={40} at={[0, 0]} />
        </div>
        <Crop img={EDIT} x={0} y={770} w={393} h={82} />
        <Press x={0} y={595} w={393} h={48} r={0} k={pressed(t, T.reports)} />
        <Press x={0} y={334} w={393} h={48} r={0} k={pressed(t, T.poi)} />
        <Press x={16} y={688} w={361} h={40} r={8} k={pressed(t, T.save)} />
      </Screen>
    </Stage>
  );
};

/**
 * Menu clip (Lavanya's note, Figma "clip - menu", script locked 2026-11-19): the menu scrolls to show
 * every option and back; tap Edit; on Edit Shortcuts untick Reports, tick POI (up to 3, as a real user
 * would), tap the floating Save Changes; back on the menu, POI is among the shortcuts.
 * Her changes: no POI row in the menu's Device Management list (it would give the ending away), the
 * floating Save Changes frame (Figma 40011704:29279), no scrolling on the edit screen, shorter.
 * Times in seconds in T.
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { cam, ease, keys, pressed, seg } from '../phone/engine';
import { Crop, Patch, Press, Screen, ScrollScreen, Stage, frame, push, useSampled } from '../phone/layers';
import type { ClipProps } from '../phone/schema';

const T = {
  scrollDown: [0.3, 3.5], scrollUp: [4.0, 5.5],
  edit: 6.7, pushIn: [6.9, 7.45],
  reports: 8.6, poi: 9.1,
  save: 10.2, pushOut: [10.4, 10.95],
  // the loop: the phone fades out once POI has landed and back in at the start, so the restart (Report
  // back in the middle) doesn't read as the edit undoing itself (her catch, 2026-11-20)
  fadeIn: [0, 0.4], fadeOut: [12.9, 13.4],
};
const POI_ROW: [number, number] = [486.5, 535]; // the POI row and the divider under it, lifted out

export const Menu: React.FC<ClipProps> = (p) => {
  const t = useCurrentFrame() / useVideoConfig().fps;
  const MENU = frame('bolt/menu/menu.png', 1393);
  const EDIT = frame('bolt/menu/edit-float.png', 852);
  const c = useSampled({ tile: [MENU, 147, 256], teal: [EDIT, 40, 700] });

  const slide = push(seg(t, T.pushIn[0], T.pushIn[1], ease.ios) * (1 - seg(t, T.pushOut[0], T.pushOut[1], ease.ios)));
  const unticked = seg(t, T.reports + 0.1, T.reports + 0.3, ease.out); // Reports' tick goes
  const ticked = seg(t, T.poi + 0.1, T.poi + 0.35, ease.out);         // POI's comes

  const [zoom, fy] = cam(t, [
    [5.6, 1, 426],
    [6.3, 1.35, 196],     // in on Edit
    [6.9, 1.35, 196],
    [8.1, 1, 426],        // out with the push
    [8.4, 1.15, 490],     // slight, on Reports and POI together
    [9.4, 1.15, 490],
    [9.9, 1.35, 708],     // down to the floating Save Changes
    [10.4, 1.35, 708],
    [11.1, 1.15, 250],    // up to Shortcuts as the menu returns, so POI is seen arriving
    [12.3, 1, 426],
  ]);

  return (
    <Stage variant={p.variant} background={p.background} zoom={zoom} fy={fy}
      opacity={seg(t, T.fadeIn[0], T.fadeIn[1], ease.out) * (1 - seg(t, T.fadeOut[0], T.fadeOut[1]))}>
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
        <Press x={0} y={595} w={393} h={48} r={0} k={pressed(t, T.reports)} />
        <Press x={0} y={334} w={393} h={48} r={0} k={pressed(t, T.poi)} />
        <Press x={16} y={688} w={361} h={40} r={8} k={pressed(t, T.save)} />
      </Screen>
    </Stage>
  );
};

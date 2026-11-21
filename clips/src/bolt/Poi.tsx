/**
 * Points of interest clip (feature 4; Figma "clip:POI", script locked 2026-11-19): tap +;
 * the map slides in; tap the map and the pin drops, the POI Details peek rises; tap it and the form
 * rises; the form scrolls (the floating Create POI and Cancel stay put);
 * Create POI; the POI view; back to the list with the toast.
 * The map under the pin is geofence/basemap (the same map as her frames). Times in seconds in T.
 */
import React from 'react';
import { staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { stretch, ease, keys, pressed, seg } from '../phone/engine';
import { Box, Crop, Pic, Press, Retext, Screen, Stage, frame, pop, push, useSampled } from '../phone/layers';
import type { ClipProps } from '../phone/schema';

const K = 1.7; // slowed to her pace (2026-11-19), see stretch()
const T = stretch({
  plus: 0.3, toMap: [0.45, 1.0],
  map: 1.3, peek: [1.45, 1.85],
  details: 2.0, rise: [2.1, 2.6],
  scroll: [2.9, 3.5],
  create: 3.9, view: [4.0, 4.25],
  back: [4.9, 5.45], toast: 5.5,
}, K);
const SHEET = 290;  // the form's top edge once it's up
const PEEK = 735;   // the peek's top edge

export const Poi: React.FC<ClipProps> = (p) => {
  const t = (useCurrentFrame() / useVideoConfig().fps) * 0.8; // her speed from the pace page (2026-11-19)
  const LIST = frame('bolt/poi/1-list.png', 852);
  const MAP = frame('bolt/poi/2-map-click.png', 852);
  const FORM = frame('bolt/poi/3-create.png', 852);
  const LONG = frame('bolt/poi/4-create-filled.png', 972);
  const VIEW = frame('bolt/poi/5-view.png', 852);
  const DONE = frame('bolt/poi/6-list-toast.png', 852);
  const c = useSampled({ pin: [MAP, 190, 365] });

  const toMap = push(seg(t, T.toMap[0], T.toMap[1], ease.ios));
  const back = pop(seg(t, T.back[0], T.back[1], ease.ios));
  const drop = seg(t, T.map, T.map + 0.3, ease.out);
  const peek = seg(t, T.peek[0], T.peek[1], ease.ios);
  const rise = seg(t, T.rise[0], T.rise[1], ease.ios);
  const s = keys(t, [[T.scroll[0], 0], [T.scroll[1], 120]]);
  const view = seg(t, T.view[0], T.view[1]);
  const toast = seg(t, T.toast, T.toast + 0.45, ease.ios);
  const sheetTop = PEEK + (SHEET - PEEK) * rise;

  return (
    <Stage variant={p.variant} background={p.background}>
      <Screen img={LIST} style={toMap.from}>
        <Press x={321} y={716} w={48} h={48} r={8} k={pressed(t, T.plus)} />
      </Screen>

      {/* create: the map, the pin dropping in, the peek, then the form rising over it */}
      <Screen img={MAP} style={t < T.back[0] ? toMap.to : back.from}>
        <Pic src={staticFile('bolt/geofence/basemap.png')} x={0} y={0} w={393} h={852} />
        {/* her form frame's map (panned to the pin) comes in as the form rises */}
        <Crop img={FORM} x={0} y={0} w={393} h={SHEET + 20} style={{ opacity: rise }} />
        {c && drop > 0 ? (
          <div style={{ position: 'absolute', left: 176.5, top: 355.5 - 36 * (1 - drop), width: 27, height: 40, opacity: Math.min(1, drop * 2) * (1 - rise) }}>
            <div style={{ position: 'absolute', left: 0, top: 0, width: 27, height: 27, borderRadius: '50%', background: c.pin }} />
            <div style={{ position: 'absolute', left: 12.25, top: 26, width: 2.5, height: 13, borderRadius: 1, background: '#2c958c' }} />
          </div>
        ) : null}
        <Crop img={MAP} x={0} y={0} w={393} h={160} />
        <Crop img={MAP} x={340} y={170} w={45} h={85} />
        <Press x={150} y={330} w={80} h={80} r={40} k={pressed(t, T.map)} />

        {/* the peek, then the form: frame 4's long form scrolling under frame 3's floating buttons */}
        <Box x={0} y={sheetTop + (1 - peek) * 140} w={393} h={852} style={{ borderRadius: '20px 20px 0 0', overflow: 'hidden', background: '#f3f4f5' }}>
          <Crop img={MAP} x={0} y={PEEK} w={393} h={117} at={[0, 0]} style={{ opacity: 1 - rise }} />
          <Box x={0} y={0} w={393} h={852} style={{ opacity: rise }}>
            <Crop img={LONG} x={0} y={SHEET + s} w={393} h={972 - SHEET - s} at={[0, 0]} />
          </Box>
          <Press x={16} y={10} w={361} h={80} r={12} k={pressed(t, T.details)} />
        </Box>
        <Box x={0} y={0} w={393} h={852} style={{ opacity: rise }}>
          <Crop img={FORM} x={16} y={725} w={361} h={39} />
          <Crop img={FORM} x={16} y={768} w={361} h={47} />
          <Crop img={FORM} x={0} y={832} w={393} h={20} />
          <Press x={16} y={725} w={361} h={39} r={8} k={pressed(t, T.create)} />
        </Box>
        {/* created: the view, in place */}
        <Screen img={VIEW} style={{ opacity: view }} />
      </Screen>

      {/* back on the list, with the toast rising (the frame's toast lifted and put back) */}
      <Screen img={DONE} style={back.to}>
        <div style={{ position: 'absolute', left: 76, top: 734, width: 242, height: 56, background: '#f3f4f5' }} />
        <Box x={0} y={0} w={393} h={852} style={{ opacity: toast, transform: `translateY(${(1 - toast) * 40}px)` }}>
          <Crop img={DONE} x={76} y={734} w={242} h={56} />
          {/* her frame says "updated"; this flow creates one (her call, 2026-11-19) */}
          <Retext x={140} capTop={757} capH={9} text="POI created successfully" color="#3b9a00" bg="#dff9cf" weight={400} cover={[138, 752, 152, 20]} />
        </Box>
      </Screen>
    </Stage>
  );
};

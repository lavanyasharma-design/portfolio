/**
 * The decision clips and stills (decision 01's edge cases, decision 02's pair, decision 03).
 *  - GeofenceSlider (decision 02, left): the create screen held; the slider goes up and the circle grows,
 *    down and it shrinks, back to the middle; slow, ease in and out, no zoom (her note in Figma).
 *  - Terrain (decision 02, right): a very slight zoom on the map-type button, tap; the sheet rises and
 *    the camera goes in on it; tap Satellite; the sheet closes and the map turns satellite; zoom out.
 *  - Vehicle (decision 03): cars driving; zoom in on the green car, tap; the sheet rises to half; Path,
 *    then Sensors; tap the map and the sheet closes.
 *  - Still: one of her frames in the phone (low balance, grace period).
 * Times in seconds in each T.
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { z } from 'zod';
import { cam, stretch, ease, keys, pressed, seg } from '../phone/engine';
import { Box, Crop, Press, Screen, Stage, frame } from '../phone/layers';
import { clipSchema, type ClipProps } from '../phone/schema';
import { CreateScreen, f12 } from './Geofence';
import { FleetMap } from './Fleet';

/* ---------- geofence slider ---------- */
export const GeofenceSlider: React.FC<ClipProps> = (p) => {
  const t = useCurrentFrame() / useVideoConfig().fps;
  // up 1.5s, a beat, down 1.5s past the start, a beat, back to 12 km
  const f = keys(t, [[0.3, f12], [1.8, 0.86], [2.2, 0.86], [3.7, 0.3], [4.1, 0.3], [5.4, f12]]);
  return (
    <Stage variant={p.variant} background={p.background} zoom={1} fy={426}>
      <CreateScreen f={f} />
    </Stage>
  );
};

/* ---------- terrain ---------- */
const KT = 1.6; // slowed to her pace (2026-11-19), see stretch()
const TT = stretch({ button: 0.5, open: [0.6, 1.05], satellite: 1.3, close: [1.4, 1.8], fade: [1.45, 1.85] }, KT);
const SHEET = 650; // the map type sheet's top edge

export const Terrain: React.FC<ClipProps> = (p) => {
  const t = (useCurrentFrame() / useVideoConfig().fps) * 0.8; // her speed from the pace page (2026-11-19)
  const MAP = frame('bolt/terrain/1-default.png', 852);
  const SHEETF = frame('bolt/terrain/2-sheet.png', 852);
  const SAT = frame('bolt/terrain/3-satellite.png', 852);
  const open = seg(t, TT.open[0], TT.open[1], ease.ios) * (1 - seg(t, TT.close[0], TT.close[1], ease.inOut));
  const sat = seg(t, TT.fade[0], TT.fade[1]);

  const [zoom, fy] = cam(t / KT, [
    [0, 1, 426],
    [0.4, 1.08, 330],    // very slight, toward the map-type button
    [0.6, 1.08, 330],
    [1.1, 1.35, 740],    // in on the sheet
    [1.4, 1.35, 740],
    [2.9, 1, 426],
  ]);

  return (
    <Stage variant={p.variant} background={p.background} zoom={zoom} fy={fy}>
      <Screen img={MAP}>
        <Press x={347} y={219} w={30} h={30} r={6} k={pressed(t, TT.button)} />
        <Screen img={SAT} style={{ opacity: sat }} />
        {/* the dim behind the sheet: her frame's is plain black at 28% (measured), over the whole screen,
            so nothing of the sheet shows before it slides up */}
        <AbsoluteFill style={{ background: '#000', opacity: 0.276 * open }} />
        <Box x={0} y={SHEET + (1 - open) * (852 - SHEET + 20)} w={393} h={852 - SHEET} style={{ borderRadius: '24px 24px 0 0', overflow: 'hidden' }}>
          <Crop img={SHEETF} x={0} y={SHEET} w={393} h={852 - SHEET} at={[0, 0]} />
          <Press x={221} y={714 - SHEET} w={148} h={92} r={8} k={pressed(t, TT.satellite)} />
        </Box>
      </Screen>
    </Stage>
  );
};

/* ---------- vehicle tap ---------- */
const KV = 1.6; // slowed to her pace (2026-11-19), see stretch()
const VT = stretch({ car: 0.7, open: [0.8, 1.5], path: 1.8, sensors: 2.4, map: 3.2, close: [3.3, 3.9] }, KV);
const HALF = 430; // the sheet's speed band at half the screen, as in her frames

export const Vehicle: React.FC<ClipProps> = (p) => {
  const t = (useCurrentFrame() / useVideoConfig().fps) * 0.8; // her speed from the pace page (2026-11-19)
  const OVERVIEW = frame('bolt/vehicle/1-overview.png', 852);
  const PATH = frame('bolt/vehicle/2-path.png', 852);
  const SENSORS = frame('bolt/vehicle/3-sensors.png', 852);
  const MAP = frame('bolt/fleet/map-frame.png', 852);
  const sheet = seg(t, VT.open[0], VT.open[1], ease.ios) * (1 - seg(t, VT.close[0], VT.close[1], ease.inOut));
  const sheetUi = seg(t, VT.open[0], VT.open[0] + 0.35) * (1 - seg(t, VT.close[0], VT.close[0] + 0.35));
  const path = seg(t, VT.path + 0.1, VT.path + 0.25);
  const sensors = seg(t, VT.sensors + 0.1, VT.sensors + 0.25);

  const [zoom, fy] = cam(t / KV, [
    [0, 1, 426],
    [0.6, 1.35, 268],    // in on the green car
    [0.9, 1.35, 268],
    [2.1, 1, 426],
  ]);

  return (
    <Stage variant={p.variant} background={p.background} zoom={zoom} fy={fy}>
      <FleetMap t={t} speed={4} sheetUi={sheetUi} tapGreen={VT.car} />
      <Box z={3}><Press x={150} y={280} w={90} h={90} r={45} k={pressed(t, VT.map)} /></Box>
      {/* the sheet at half: her frames' lower part, one per tab (Overview's title made GJ27-V-XXXX, as the others) */}
      <Box z={4} x={0} y={HALF + (1 - sheet) * (852 - HALF + 20)} w={393} h={852 - HALF} style={{ borderRadius: '27px 27px 0 0', overflow: 'hidden', boxShadow: '0 -2px 10px #0000001a' }}>
        <Crop img={OVERVIEW} x={0} y={HALF} w={393} h={852 - HALF} at={[0, 0]} />
        <Crop img={PATH} x={16} y={500} w={200} h={30} at={[16, 500 - HALF]} />
        <Crop img={PATH} x={0} y={HALF} w={393} h={852 - HALF} at={[0, 0]} style={{ opacity: path }} />
        <Crop img={SENSORS} x={0} y={HALF} w={393} h={852 - HALF} at={[0, 0]} style={{ opacity: sensors }} />
        <Press x={140} y={562 - HALF} w={112} h={32} r={8} k={pressed(t, VT.path)} />
        <Press x={252} y={562 - HALF} w={112} h={32} r={8} k={pressed(t, VT.sensors)} />
      </Box>
      <Box z={5}><Crop img={MAP} x={0} y={0} w={393} h={55} /></Box>
    </Stage>
  );
};

/* ---------- a still: one frame in the phone ---------- */
export const stillSchema = clipSchema.extend({ src: z.string().describe('The frame, under public/') });
export const Still: React.FC<z.infer<typeof stillSchema>> = (p) => (
  <Stage variant={p.variant} background={p.background} zoom={1} fy={426}>
    <Screen img={frame(p.src, 852)} />
  </Stage>
);

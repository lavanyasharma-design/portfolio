/**
 * Fleet view clip (Lavanya's note, Figma "clip: fleet view"): cars move on the map; tap one and the
 * bottom sheet eases in to half the screen; it's a long scroll, so it's drawn up to full; a tap on its
 * top edge sends it all the way down and the map is back; it ends 1s later and loops (her timings,
 * 2026-11-19: starts as the car is tapped, no stop at half on the way down). Layers from
 * frames Mapfilter_1.0.1 [Nearby Vehicles] and GroupInfo_Overview_1.0.1, exported at 2x.
 */
import React from 'react';
import { staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { z } from 'zod';
import { keys, pressed, seg } from '../phone/engine';
import { Box, Crop, Pic, Press, Stage, frame, useKeyed } from '../phone/layers';

export const fleetSchema = z.object({
  variant: z.enum(['wide', 'tall', 'square']).describe('Shape: wide 2:1 (desktop), tall 4:5 (phones and features), square'),
  background: z.string().describe('Panel colour behind the phone'),
  duration: z.number().min(1).max(60).describe('Length of the clip (s)'),
  carSpeed: z.number().min(0).max(20).describe('How fast the cars drive (1 = as first sent, very slow)'),
  tapCar: z.number().min(0).max(60).describe('Tap on the yellow car (s)'),
  sheetInSeconds: z.number().min(0.1).max(3).describe('Sheet rising to half (s)'),
  sheetUpStart: z.number().min(0).max(60).describe('Sheet starts up to full (s)'),
  sheetUpSeconds: z.number().min(0.1).max(4).describe('Sheet up to full, length (s)'),
  tapSheet: z.number().min(0).max(60).describe('Tap on the top edge of the full sheet, which closes it (s)'),
  sheetOutSeconds: z.number().min(0.1).max(3).describe('Sheet sliding all the way down, length (s)'),
});

const A = 'bolt/fleet/';
const at = (n: string) => staticFile(`${A}${n}.png`);

export const Fleet: React.FC<z.infer<typeof fleetSchema>> = (p) => {
  const t = useCurrentFrame() / useVideoConfig().fps;
  const MAP = frame(`${A}map-frame.png`, 852);
  const open = [p.tapCar + 0.2, p.tapCar + 0.2 + p.sheetInSeconds];
  const close = [p.tapSheet + 0.1, p.tapSheet + 0.1 + p.sheetOutSeconds];
  const HIDDEN = 740, HALF = 294, FULL = 0; // sheet offsets: off screen, half the screen, full
  const sheetY = keys(t, [
    [open[0], HIDDEN], [open[1], HALF],
    [p.sheetUpStart, HALF], [p.sheetUpStart + p.sheetUpSeconds, FULL],
    [close[0], FULL], [close[1], HIDDEN],
  ]);
  // the map's search and chips give way to back and locate while the sheet is up
  const sheetUi = seg(t, open[0], open[0] + 0.35) * (1 - seg(t, close[0], close[0] + 0.35));

  return (
    <Stage variant={p.variant} background={p.background}>
      <FleetMap t={t} speed={p.carSpeed} sheetUi={sheetUi} tapYellow={p.tapCar} />

      {/* the sheet: the speed band and the white sheet over it, each clipped to its rounded top
          (the exports start 7px above the shape, and their corners are flattened on grey) */}
      <Box z={4} style={{ transform: `translateY(${sheetY}px)` }}>
        <Box x={0} y={136} w={393} h={716} style={{ borderRadius: '27px 27px 0 0', overflow: 'hidden', boxShadow: '0 -2px 10px #0000001a' }}>
          <Pic src={at('sheet-speed')} x={0} y={-7} w={393} h={723} />
          <Press x={0} y={0} w={393} h={37} r={0} k={pressed(t, p.tapSheet)} />
        </Box>
        <Box x={0} y={173} w={393} h={679} style={{ borderRadius: '27px 27px 0 0', overflow: 'hidden' }}>
          <Pic src={at('sheet-info')} x={0} y={-7} w={393} h={686} />
        </Box>
      </Box>

      {/* status bar stays on top */}
      <Box z={5}><Crop img={MAP} x={0} y={0} w={393} h={55} /></Box>
    </Stage>
  );
};

/**
 * The fleet map: the basemap, the geofence circle, the cars driving along their roads (keyed out of
 * Figma's flattening grey) and the map's chrome, which gives way to the vehicle screen's back and
 * locate buttons as `sheetUi` goes 0 -> 1. Shared by the fleet and vehicle tap clips. A car given a
 * tap time dips when it's pressed.
 */
export const FleetMap: React.FC<{ t: number; speed: number; sheetUi: number; tapYellow?: number; tapGreen?: number }> = ({ t, speed, sheetUi, tapYellow = -9, tapGreen = -9 }) => {
  const MAP = frame(`${A}map-frame.png`, 852);
  const k = useKeyed({
    carGreen: at('car-green'), carYellow: at('car-yellow'), carGrey: at('car-grey'), carRed: at('car-red'),
    labelYellow: at('label-yellow'), labelGrey: at('label-grey'), back: at('btn-back'), locate: at('btn-locate'),
  });
  // nose direction (unit vector) times speed in px/s
  const drive = (d: [number, number], v: number) => {
    const s = v * speed * t;
    return `translate(${d[0] * s}px, ${d[1] * s}px)`;
  };
  const yellowMove = drive([-0.85, -0.53], 1.3);
  const greyMove = drive([-0.84, -0.54], 1.0);
  const p = { tapCar: tapYellow };
  return (
    <>
      <Pic src={at('basemap')} x={0} y={0} w={393} h={852} z={0} />
      {/* the geofence circle, drawn: #178b81 at 18%, solved from the frame; the dot at its centre from the frame */}
      <Box x={28} y={269} w={324} h={324} z={1}
        style={{ borderRadius: '50%', background: 'rgb(23 139 129 / .18)', boxShadow: 'inset 0 0 0 1px rgb(23 139 129 / .22)' }} />
      <Box z={1}><Crop img={MAP} x={181} y={424} w={22} h={14} /></Box>

      {k ? (
        <>
          <Pic src={k.carGreen} x={249.3} y={240.7} w={47} h={54} z={2} style={{ transform: `${drive([0.55, -0.83], 1.6)} scale(${1 - 0.08 * pressed(t, tapGreen, 0.3)})`, transformOrigin: 'center' }} />
          <Pic src={k.carYellow} x={131.6} y={401} w={54} h={47.5} z={2}
            style={{ transformOrigin: 'center', transform: `${yellowMove} scale(${1 - 0.08 * pressed(t, p.tapCar, 0.3)})` }} />
          <Pic src={k.labelYellow} x={42} y={336} w={103} h={44} z={2} style={{ transform: yellowMove }} />
          <Pic src={k.carGrey} x={250} y={500.8} w={53.5} h={47} z={2} style={{ transform: greyMove }} />
          <Pic src={k.labelGrey} x={237} y={528} w={102} h={44} z={2} style={{ transform: greyMove }} />
          <Pic src={k.carRed} x={87.3} y={666.7} w={45.5} h={54} z={2} style={{ transform: drive([-0.47, -0.88], 1.2) }} />

          {/* the map screen's chrome: search and chips, the right-hand buttons */}
          <Box z={3} style={{ opacity: 1 - sheetUi }}>
            <Crop img={MAP} x={0} y={55} w={393} h={94} />
            <Crop img={MAP} x={341} y={155} w={42} h={88} />
          </Box>
          {/* the vehicle screen's: back, locate */}
          <Box z={3} style={{ opacity: sheetUi }}>
            <Pic src={k.back} x={16} y={62} w={48} h={52} />
            <Pic src={k.locate} x={335} y={68} w={38} h={38} />
          </Box>
        </>
      ) : null}

      {/* tab bar under the sheet */}
      <Box z={3}><Crop img={MAP} x={0} y={768} w={393} h={84} /></Box>
    </>
  );
};

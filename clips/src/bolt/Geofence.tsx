/**
 * Geofence clip (feature 2; Figma "clip:geofence", script locked 2026-11-19): the create screen with
 * the whole phone in view; the slider goes up and back down and the circle grows and settles; Done;
 * the details slide in and scroll to Link Groups; Link; tick two groups; a slight zoom on the floating
 * Link Vehicles button; back on the details with 2 groups linked; Create; the list, with the toast
 * rising from below. Layers for the map: geofence/basemap, pin; the slider and label are drawn.
 * Times in seconds in T.
 */
import React from 'react';
import { staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { cam, stretch, ease, keys, pressed, seg } from '../phone/engine';
import { Crop, Pic, Press, Retext, Screen, ScrollScreen, Stage, frame, pop, push } from '../phone/layers';
import type { ClipProps } from '../phone/schema';

const K = 1.65; // slowed to her pace (2026-11-19), see stretch()
const T = stretch({
  slide: [0.2, 0.6, 1.0, 1.3],          // slider: up, down, settle
  done: 1.6, toDetails: [1.75, 2.3],
  scroll: [2.55, 3.2],
  link: 3.4, toLink: [3.55, 4.1],
  tick1: 4.3, tick2: 4.6,
  linkBtn: 5.0, back: [5.15, 5.7],
  create: 6.2, toList: [6.35, 6.9],
  toast: 7.0,
}, K);
const TEAL = '#2c958c';
const G = 'bolt/geofence/';

// the slider: track x 34, from y 552 (top, biggest) to 724; the frame's thumb at 625 is 12 km, r 73.5
const TRACK = [552, 724];
export const f12 = (724 - 625) / 172;

export const Geofence: React.FC<ClipProps> = (p) => {
  const t = (useCurrentFrame() / useVideoConfig().fps) * 0.9; // her speed from the pace page (2026-11-19)
  const DETAILS = frame(`${G}2-details.png`, 1032);
  const LINK = frame(`${G}3-link.png`, 852);
  const LIST = frame(`${G}5-list.png`, 852);

  // slider position as a fraction of the track, up to 0.84 and down to 0.36, settling on 12 km
  const f = keys(t, [[T.slide[0], f12], [T.slide[1], 0.84], [T.slide[2], 0.36], [T.slide[3], f12]]);

  const toDetails = push(seg(t, ...(T.toDetails as [number, number]), ease.ios));
  const toLink = push(seg(t, ...(T.toLink as [number, number]), ease.ios));
  const back = pop(seg(t, ...(T.back as [number, number]), ease.ios));
  const toList = push(seg(t, ...(T.toList as [number, number]), ease.ios));
  const linked = t > T.back[0];
  const n = (t > T.tick1 + 0.1 ? 1 : 0) + (t > T.tick2 + 0.1 ? 1 : 0);
  const toast = seg(t, T.toast, T.toast + 0.45, ease.ios);

  const [zoom, fy] = cam(t / K, [
    [4.7, 1, 426],
    [5.0, 1.15, 700],   // slight, on the floating Link Vehicles button
    [5.3, 1.15, 700],
    [6.3, 1, 426],
  ]);

  // which screen is where: create -> details -> link -> details (linked) -> list
  const detailsStyle = t < T.toLink[0] ? toDetails.to : t < T.back[0] ? toLink.from : t < T.toList[0] ? back.to : toList.from;

  return (
    <Stage variant={p.variant} background={p.background} zoom={zoom} fy={fy}>
      {/* create: the map, the circle, the pin, the slider */}
      <CreateScreen f={f} style={toDetails.from}>
        <Press x={16} y={772} w={361} h={40} r={8} k={pressed(t, T.done)} />
      </CreateScreen>

      {/* details: scrolls to Link Groups; once linked, "0 Groups Linked" reads 2 */}
      <ScrollScreen img={DETAILS} top={102} bottom={20} y={keys(t, [[T.scroll[0], 0], [T.scroll[1], 180]])} style={detailsStyle}>
        {linked ? <Retext x={32.5} capTop={908} capH={11.3} text="2" color={TEAL} bg="#fff" weight={400} cover={[30, 903, 13, 21]} /> : null}
        <Press x={292} y={898} w={70} h={30} r={6} k={pressed(t, T.link)} />
        <Press x={16} y={965.5} w={361} h={40} r={8} k={pressed(t, T.create)} />
      </ScrollScreen>

      {/* link groups: two rows get ticked, the button counts them */}
      <Screen img={LINK} style={t < T.back[0] ? toLink.to : back.from}>
        <Crop img={LINK} x={322} y={252.5} w={22} h={22} at={[322, 365.5]} style={{ opacity: t > T.tick1 + 0.1 ? 0 : 1 }} />
        <Crop img={LINK} x={322} y={252.5} w={22} h={22} at={[322, 535]} style={{ opacity: t > T.tick2 + 0.1 ? 0 : 1 }} />
        <Press x={0} y={352} w={393} h={50} r={0} k={pressed(t, T.tick1)} />
        <Press x={0} y={521} w={393} h={50} r={0} k={pressed(t, T.tick2)} />
        <div style={{
          position: 'absolute', left: 60, top: 758, width: 273, height: 28, background: TEAL, display: 'flex',
          alignItems: 'center', justifyContent: 'center', font: '600 14px Inter, sans-serif', color: '#fff',
        }}>Link Vehicles ({n})</div>
        <Press x={16} y={752} w={361} h={40} r={8} k={pressed(t, T.linkBtn)} />
      </Screen>

      {/* the list, the toast rising from below (the frame's toast lifted, the + redrawn under it) */}
      <Screen img={LIST} style={toList.to}>
        <div style={{ position: 'absolute', left: 60, top: 734, width: 262, height: 56, background: '#f3f4f5' }} />
        <div style={{ position: 'absolute', left: 322, top: 763, width: 10, height: 27, background: '#f3f4f5' }} />
        <div style={{ position: 'absolute', left: 321, top: 716, width: 48, height: 48, borderRadius: 8, background: TEAL }}>
          <svg viewBox="0 0 24 24" width="24" height="24" style={{ position: 'absolute', left: 12, top: 12 }}>
            <path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        </div>
        <Crop img={LIST} x={60} y={734} w={272} h={56} style={{ opacity: toast, transform: `translateY(${(1 - toast) * 40}px)` }} />
      </Screen>
    </Stage>
  );
};

/**
 * The create screen at slider position `f` (a fraction of the track, 12 km at f12): the clean basemap,
 * the circle sized from the slider, the pin, the frame's own chrome cropped over them, and the slider
 * and its label drawn. Shared with the geofence slider clip (decision 02).
 */
export const CreateScreen: React.FC<{ f: number; style?: React.CSSProperties; children?: React.ReactNode }> = ({ f, style, children }) => {
  const CREATE = frame(`${G}1-create.png`, 852);
  const thumbY = TRACK[1] - f * (TRACK[1] - TRACK[0]);
  const km = Math.max(1, Math.round((f / f12) * 12));
  const r = 73.5 * (f / f12);
  return (
    <Screen img={CREATE} style={style}>
      <Pic src={staticFile(`${G}basemap.png`)} x={0} y={0} w={393} h={852} />
      <div style={{
        position: 'absolute', left: 190.5 - r, top: 411.5 - r, width: 2 * r, height: 2 * r, borderRadius: '50%',
        background: 'rgb(250 169 115 / .18)', boxShadow: 'inset 0 0 0 2px #ffb184',
      }} />
      <Pic src={staticFile(`${G}pin.png`)} x={175} y={391} w={32} h={41} />
      <Crop img={CREATE} x={0} y={0} w={393} h={160} />
      <Crop img={CREATE} x={12} y={170} w={70} h={40} />
      <Crop img={CREATE} x={340} y={168} w={45} h={88} />
      <Crop img={CREATE} x={322} y={575} w={64} h={155} />
      <Crop img={CREATE} x={0} y={760} w={393} h={92} />
      {/* the slider, drawn: grey above the thumb, teal below, and the radius label beside it */}
      <div style={{ position: 'absolute', left: 32, top: TRACK[0], width: 4, height: thumbY - TRACK[0], borderRadius: 2, background: '#c8c6c4' }} />
      <div style={{ position: 'absolute', left: 32, top: thumbY, width: 4, height: TRACK[1] - thumbY, borderRadius: 2, background: TEAL }} />
      <div style={{ position: 'absolute', left: 23, top: thumbY - 11, width: 22, height: 22, borderRadius: 11, background: '#fff', boxShadow: '0 1px 4px #0000002e' }} />
      <div style={{
        position: 'absolute', left: 53, top: thumbY - 13, width: 90, height: 34, borderRadius: 4, background: '#fff',
        border: `1px solid ${TEAL}`, boxShadow: '0 2px 6px #0000001f', display: 'flex', alignItems: 'center', justifyContent: 'center',
        font: '400 12.5px Inter, sans-serif', color: '#1a1a1a',
      }}>Radius: {km} Km</div>
      {children}
    </Screen>
  );
};

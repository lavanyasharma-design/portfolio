/**
 * Subscriptions clip (decision 01; Figma "clip:subcriptions", script locked 2026-11-19): tap Choose
 * plan (no zoom); plan details, a slight zoom on the Fuel Management System card; the payment breakup
 * sheet opens and closes within 1.4s; Continue; the summary, a slight zoom on it that moves down to
 * Pay; Pay; Payment Successful with a green tick that lands (drawn here, crisper than the GIF in her
 * frame). Times in seconds in T.
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { cam, stretch, ease, pressed, seg } from '../phone/engine';
import { Box, Crop, Press, Screen, Stage, SuccessTick, frame, push } from '../phone/layers';
import type { ClipProps } from '../phone/schema';

const K = 1.65; // slowed to her pace (2026-11-19), see stretch()
const T = stretch({
  choose: 0.3, toDetails: [0.45, 1.0],
  breakup: 1.6, open: [1.7, 2.15], shut: 2.55, close: [2.6, 3.0],
  cont: 3.3, toSummary: [3.45, 4.0],
  pay: 4.6, success: [4.75, 5.0], tick: 4.85,
}, K);
const TOP = 520; // the breakup sheet's top edge

export const Subscriptions: React.FC<ClipProps> = (p) => {
  const t = (useCurrentFrame() / useVideoConfig().fps) * 0.7; // her speed from the pace page (2026-11-19)
  const PLANS = frame('bolt/subs/1-plans.png', 852);
  const DETAILS = frame('bolt/subs/2-details.png', 852);
  const BREAKUP = frame('bolt/subs/3-breakup.png', 852);
  const SUMMARY = frame('bolt/subs/4-summary.png', 852);
  const DONE = frame('bolt/subs/5-confirm.png', 852);

  const toDetails = push(seg(t, T.toDetails[0], T.toDetails[1], ease.ios));
  const toSummary = push(seg(t, T.toSummary[0], T.toSummary[1], ease.ios));
  const sheet = seg(t, T.open[0], T.open[1], ease.ios) * (1 - seg(t, T.close[0], T.close[1], ease.inOut));
  const success = seg(t, T.success[0], T.success[1]);

  const [zoom, fy] = cam(t / K, [
    [0.75, 1, 426],
    [1.25, 1.15, 533],   // slight, on the Fuel Management System card
    [1.6, 1.15, 533],
    [2.5, 1, 426],
    [3.75, 1, 426],
    [4.15, 1.15, 270],   // slight, on the summary
    [4.25, 1.15, 270],
    [4.5, 1.25, 700],    // moving down to Pay
    [4.75, 1.25, 700],
    [5.8, 1, 426],
  ]);

  return (
    <Stage variant={p.variant} background={p.background} zoom={zoom} fy={fy}>
      <Screen img={PLANS} style={toDetails.from}>
        <Press x={32} y={575} w={298} h={46} r={8} k={pressed(t, T.choose)} />
      </Screen>

      {/* plan details, and the breakup sheet over it (her dimmed frame fades in behind the sheet) */}
      <Screen img={DETAILS} style={t < T.toSummary[0] ? toDetails.to : toSummary.from}>
        <Press x={112} y={768} w={40} h={32} r={6} k={pressed(t, T.breakup)} />
        {/* the dim: her frame's is plain black at 45% (measured), over the whole screen */}
        <AbsoluteFill style={{ background: '#000', opacity: 0.451 * sheet }} />
        <Box x={0} y={TOP + (1 - sheet) * (852 - TOP + 20)} w={393} h={852 - TOP} style={{ borderRadius: '24px 24px 0 0', overflow: 'hidden' }}>
          <Crop img={BREAKUP} x={0} y={TOP} w={393} h={852 - TOP} at={[0, 0]} />
        </Box>
        <Press x={168} y={770} w={215} h={46} r={8} k={pressed(t, T.cont)} />
      </Screen>

      <Screen img={SUMMARY} style={toSummary.to}>
        <Press x={16} y={762} w={361} h={46} r={8} k={pressed(t, T.pay)} />
        <Screen img={DONE} style={{ opacity: success }}>
          <SuccessTick t={t} at={T.tick} x={196.5} y={316.5} size={150} />
        </Screen>
      </Screen>
    </Stage>
  );
};

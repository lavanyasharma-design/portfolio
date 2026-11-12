// Motif sound engine. Plain Web Audio, no dependencies.
// Public API: unlockSound(), playMotif(name), setMuted(bool), isMuted(), onSoundReady(fn)

import { SOUND } from './config';

const NOTE = { C:0, 'C#':1, D:2, 'D#':3, E:4, F:5, 'F#':6, G:7, 'G#':8, A:9, 'A#':10, B:11 };
const toMidi = (n) => NOTE[n.slice(0, -1)] + 12 * (Number(n.slice(-1)) + 1);

let ctx = null;
let input, lp, shelf, dry, wet, predelay, conv, comp, out;
let muted = false;
let ready = false;
let loading = null;
const buffers = {};          // folder -> [[midi, AudioBuffer], ...]
const active = [];
const lastFired = {};
const readyListeners = [];

/* ---------- graph ---------- */

function makeImpulse(seconds) {
  const len = Math.floor(ctx.sampleRate * seconds);
  const ir = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = ir.getChannelData(ch);
    let z = 0;
    for (let i = 0; i < len; i++) {
      const t = i / ctx.sampleRate;
      z += ((Math.random() * 2 - 1) - z) * (0.28 + 0.5 * Math.exp(-t * 3));
      d[i] = z * Math.exp((-t * 6.9) / seconds) * (t < 0.012 ? t / 0.012 : 1);
    }
  }
  return ir;
}

function buildGraph() {
  const T = SOUND.tone;
  ctx = new (window.AudioContext || window.webkitAudioContext)();
  input = ctx.createGain();
  lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 0.4; lp.frequency.value = T.lowpassHz;
  shelf = ctx.createBiquadFilter(); shelf.type = 'lowshelf';
  shelf.frequency.value = T.lowShelf.hz; shelf.gain.value = T.lowShelf.db;
  dry = ctx.createGain(); dry.gain.value = 1 - T.reverb.wet * 0.55;
  wet = ctx.createGain(); wet.gain.value = T.reverb.wet * 1.6;
  predelay = ctx.createDelay(0.2); predelay.delayTime.value = T.reverb.predelayMs / 1000;
  conv = ctx.createConvolver(); conv.buffer = makeImpulse(T.reverb.seconds);
  comp = ctx.createDynamicsCompressor();
  Object.entries(T.compressor).forEach(([k, v]) => { comp[k].value = v; });
  out = ctx.createGain(); out.gain.value = Math.pow(10, T.outputDb / 20) * 0.9;

  input.connect(lp); lp.connect(shelf);
  shelf.connect(dry); dry.connect(comp);
  shelf.connect(predelay); predelay.connect(conv); conv.connect(wet); wet.connect(comp);
  comp.connect(out); out.connect(ctx.destination);
  impulseSeconds = T.reverb.seconds;
}

let impulseSeconds = 0;

// Re-applies SOUND.tone to the running graph, for the ?sound panel. A new reverb length builds a
// fresh convolver and swaps it in, since a convolver's impulse can't always be replaced in place.
export function retune() {
  if (!ctx) return;
  const T = SOUND.tone;
  lp.frequency.value = T.lowpassHz;
  shelf.frequency.value = T.lowShelf.hz; shelf.gain.value = T.lowShelf.db;
  dry.gain.value = 1 - T.reverb.wet * 0.55;
  wet.gain.value = T.reverb.wet * 1.6;
  predelay.delayTime.value = T.reverb.predelayMs / 1000;
  Object.entries(T.compressor).forEach(([k, v]) => { comp[k].value = v; });
  out.gain.value = Math.pow(10, T.outputDb / 20) * 0.9;
  if (T.reverb.seconds !== impulseSeconds) {
    const next = ctx.createConvolver();
    next.buffer = makeImpulse(T.reverb.seconds);
    predelay.connect(next); next.connect(wet);
    predelay.disconnect(conv); conv.disconnect();
    conv = next;
    impulseSeconds = T.reverb.seconds;
  }
}

// Loads any voice in SOUND.voices that isn't loaded yet (after the panel switches instrument).
export function loadVoices() {
  if (!ctx) return Promise.resolve();
  const { main, layer } = SOUND.voices;
  return Promise.all([main, layer].filter(Boolean).map((v) => buffers[v.folder] || loadFolder(v.folder)));
}

/* ---------- loading ---------- */

function decode(ab) {
  return new Promise((resolve, reject) => {
    const p = ctx.decodeAudioData(ab, resolve, reject);
    if (p && p.then) p.then(resolve, reject);
  });
}

const inFlight = {};
function loadFolder(folder) {
  if (inFlight[folder]) return inFlight[folder];
  const files = Object.entries(SOUND.samples[folder]);
  return inFlight[folder] = Promise.all(
    files.map(([midi, name]) =>
      fetch(`/sounds/${folder}/${name}.mp3`)
        .then((r) => r.arrayBuffer())
        .then(decode)
        .then((buf) => [Number(midi), buf])
    )
  ).then((list) => { buffers[folder] = list.sort((a, b) => a[0] - b[0]); })
    .catch((e) => { delete inFlight[folder]; throw e; });
}

function loadAll() {
  if (!loading) {
    const { main, layer } = SOUND.voices;
    // main voice first so the first hover is never silent for long
    loading = loadFolder(main.folder)
      .then(() => { ready = true; readyListeners.forEach((fn) => fn()); })
      .then(() => (layer ? loadFolder(layer.folder) : null))
      .catch(() => { loading = null; });
  }
  return loading;
}

/* ---------- playback ---------- */

function nearest(folder, midi) {
  const list = buffers[folder];
  let best = list[0];
  for (const e of list) if (Math.abs(e[0] - midi) < Math.abs(best[0] - midi)) best = e;
  return best;
}

function voice(folder, midi, level, when) {
  if (!buffers[folder]) return;
  const T = SOUND.tone;
  const [sampleMidi, buf] = nearest(folder, midi);
  const cents = (Math.random() * 2 - 1) * 5 * T.humanise;
  const vel = level * (1 - Math.random() * 0.22 * T.humanise);

  const src = ctx.createBufferSource();
  src.buffer = buf;
  src.playbackRate.value = Math.pow(2, (midi - sampleMidi) / 12 + cents / 1200);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, when);
  g.gain.linearRampToValueAtTime(vel, when + T.attackMs / 1000);
  g.gain.setTargetAtTime(0, when + 0.06, T.ringSeconds / 5);
  src.connect(g); g.connect(input);
  src.start(when);
  src.stop(when + T.ringSeconds + 0.3);

  const rec = { src, g };
  active.push(rec);
  src.onended = () => {
    const i = active.indexOf(rec);
    if (i > -1) active.splice(i, 1);
    g.disconnect();
  };
  while (active.length > SOUND.maxVoices) {
    const old = active.shift();
    const now = ctx.currentTime;
    old.g.gain.cancelScheduledValues(now);
    old.g.gain.setTargetAtTime(0, now, 0.03);
    try { old.src.stop(now + 0.15); } catch (e) { /* already stopped */ }
  }
}

function note(midi, when, level) {
  const { main, layer } = SOUND.voices;
  voice(main.folder, midi, 0.9 * level * main.level, when);
  if (layer) voice(layer.folder, midi, 0.9 * level * layer.level, when);
}

/* ---------- the butterfly's own sound ---------- */

// One synthesised tone (no samples): sine partials over a base pitch, each fading on its own clock
// (higher partials die sooner, like a struck bell), with an optional slow waver and upward glide.
function synth(baseMidi, when, level, s) {
  const base = 440 * Math.pow(2, (baseMidi - 69) / 12);
  const g = ctx.createGain();
  g.connect(input);
  let lfo = null;
  if (s.vibratoCents) {
    lfo = ctx.createOscillator(); lfo.frequency.value = 5.5;
    lfo.start(when); lfo.stop(when + s.seconds + 0.3);
  }
  for (const [ratio, gain] of s.partials) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(base * ratio, when);
    if (s.glideCents) {
      osc.detune.setValueAtTime(-s.glideCents, when);
      osc.detune.linearRampToValueAtTime(0, when + 0.35);
    }
    if (lfo) { const depth = ctx.createGain(); depth.gain.value = s.vibratoCents; lfo.connect(depth); depth.connect(osc.detune); }
    const env = ctx.createGain();
    const peak = level * gain * 0.22;
    const fade = s.seconds / (1 + (ratio - 1) * 0.6);
    env.gain.setValueAtTime(0, when);
    env.gain.linearRampToValueAtTime(peak, when + s.attackMs / 1000);
    env.gain.setTargetAtTime(0, when + s.attackMs / 1000, fade / 4);
    osc.connect(env); env.connect(g);
    osc.start(when); osc.stop(when + s.seconds + 0.3);
  }
  setTimeout(() => g.disconnect(), (s.seconds + 0.6) * 1000);
}

// Plays SOUND.butterfly in its chosen style. Same rules as playMotif: false if silent.
export function playButterfly() {
  if (!ctx || muted || !ready || ctx.state !== 'running') return false;
  const B = SOUND.butterfly, s = B.styles[B.style];
  const now = performance.now();
  if (now - (lastFired.butterfly || 0) < B.retriggerMs) return false;
  lastFired.butterfly = now;
  const t = ctx.currentTime;
  if (s.kind === 'samples') {
    s.notes.forEach((n, i) => voice(SOUND.voices.main.folder, toMidi(n), B.level * s.level * (1 - i * 0.12), t + (i * s.spacingMs) / 1000));
  } else {
    for (const [delayMs, lvl] of s.strikes) synth(toMidi(s.base), t + delayMs / 1000, B.level * lvl, s);
  }
  return true;
}

/* ---------- public API ---------- */

// Call from the first real gesture (the loader drag). Safe to call repeatedly.
export async function unlockSound() {
  if (!ctx) buildGraph();
  if (ctx.state !== 'running' && !muted) {
    try { await ctx.resume(); } catch (e) { /* retried on next gesture */ }
  }
  loadAll();
}

// Plays the two-note pair for a motif. Returns false if sound was not ready.
export function playMotif(name) {
  if (!ctx || muted || !ready || ctx.state !== 'running') return false;
  const pair = SOUND.motifNotes[name];
  if (!pair) return false;
  const now = performance.now();
  if (now - (lastFired[name] || 0) < SOUND.retriggerMs) return false;
  lastFired[name] = now;

  const t = ctx.currentTime;
  note(toMidi(pair[0]), t, 1);
  if (pair[1]) note(toMidi(pair[1]), t + SOUND.pair.gapMs / 1000, SOUND.pair.secondLevel);
  return true;
}

export async function setMuted(value) {
  muted = value;
  if (!ctx) return;
  if (muted) await ctx.suspend();
  else await ctx.resume();
}

export const isMuted = () => muted;

export function onSoundReady(fn) {
  if (ready) fn();
  else readyListeners.push(fn);
}

// Wires unlockSound to the first gesture anywhere. Call once when the app mounts.
// touchend is included because some iOS versions only unlock audio on it.
export function armUnlockOnFirstGesture() {
  const events = ['pointerdown', 'touchend', 'keydown'];
  const handler = () => {
    unlockSound().then(() => {
      if (ctx && ctx.state === 'running') events.forEach((e) => window.removeEventListener(e, handler, true));
    });
  };
  events.forEach((e) => window.addEventListener(e, handler, true));
}

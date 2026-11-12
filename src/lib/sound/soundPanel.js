import { SOUND } from './config'
import { playMotif, playButterfly, retune, loadVoices } from './engine'

/*
 * ?sound: a live panel mirroring Lavanya's sound bench. Every change applies at once (the next
 * note uses it), survives a reload on this device, and "copy settings" gives the same JSON the
 * bench exports, ready for config.js. "reset" goes back to config.js.
 * Plain DOM, outside React, like the other tuning panels.
 */

const NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const SCALES = {
  majpent: [0, 2, 4, 7, 9],
  minpent: [0, 3, 5, 7, 10],
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
}
const REGISTER = { low: 3, middle: 4, high: 5 }
const MOTIFS = [
  ['logo', 'logo'], ['work', 'work'], ['about', 'about'], ['play', 'play'],
  ['nextCaseStudy', 'next case study'], ['letsTalk', "let's talk"], ['email', 'email'],
  ['linkedin', 'linkedin'], ['x', 'x'], ['resume', 'resume'], ['centrepiece', 'centrepiece'],
]
const VOICES = { 'grand piano': 'grand-piano', 'folk harp': 'folk-harp' }
const voiceName = (folder) => Object.keys(VOICES).find((k) => VOICES[k] === folder) ?? null
const KEY = 'sound-panel-v5'   // bumped when config.js changes, so old tuning doesn't hide it

const midiName = (m) => NAMES[m % 12] + (Math.floor(m / 12) - 1)
const toMidi = (n) => NAMES.indexOf(n.slice(0, -1)) + 12 * (Number(n.slice(-1)) + 1)

// consecutive scale notes from the key, one per motif; the answering note sits a fifth above
function buildNotes({ key, scale, register, notesPerTrigger }) {
  const sc = SCALES[scale], root = 12 * (REGISTER[register] + 1) + NAMES.indexOf(key)
  const deg = (i) => root + sc[i % sc.length] + 12 * Math.floor(i / sc.length)
  const fifth = sc.length === 5 ? 3 : 4
  return Object.fromEntries(MOTIFS.map(([id], i) =>
    [id, notesPerTrigger === 2 ? [midiName(deg(i)), midiName(deg(i + fifth))] : [midiName(deg(i))]]))
}

// the bench's export format <-> SOUND
function exportSettings() {
  const T = SOUND.tone, L = SOUND.ladder, two = L.notesPerTrigger === 2
  return {
    voice: voiceName(SOUND.voices.main.folder),
    layer: SOUND.voices.layer ? { voice: voiceName(SOUND.voices.layer.folder), levelPercent: Math.round(SOUND.voices.layer.level * 100) } : null,
    scale: L.scale, key: L.key, register: L.register,
    notesPerTrigger: L.notesPerTrigger,
    secondNote: two ? 'fifth above' : null,
    gapMs: two ? SOUND.pair.gapMs : null,
    secondNoteLevelPercent: two ? Math.round(SOUND.pair.secondLevel * 100) : null,
    motifNotes: MOTIFS.map(([id, label]) => `${label}: ${SOUND.motifNotes[id].join(' + ')}`),
    lowpassHz: T.lowpassHz,
    lowShelf: { hz: T.lowShelf.hz, db: T.lowShelf.db },
    reverbWetPercent: Math.round(T.reverb.wet * 100),
    reverbSeconds: T.reverb.seconds,
    ringSeconds: T.ringSeconds,
    attackMs: T.attackMs,
    outputDb: T.outputDb,
    compressor: { threshold: T.compressor.threshold, ratio: T.compressor.ratio, knee: T.compressor.knee },
    humanisePercent: Math.round(T.humanise * 100),
    butterfly: { style: SOUND.butterfly.style, levelPercent: Math.round(SOUND.butterfly.level * 100) },
  }
}

// every slider, named in plain words with a one-line hint (the bench's name is in brackets)
const pct = { to: (v) => v / 100, from: (v) => Math.round(v * 100) }
const SLIDERS = [
  { k: 'layerLevel', label: 'its volume', min: 0, max: 100, step: 5, unit: '%', ...pct,
    hint: 'how loud the second instrument is under the first (layer level)' },
  { k: 'gapMs', label: 'pause', min: 0, max: 500, step: 10, unit: 'ms',
    hint: 'wait before the second note (gap)' },
  { k: 'secondLevel', label: '2nd note volume', min: 0, max: 100, step: 5, unit: '%', ...pct,
    hint: 'the answering note; quieter feels like an echo (second note level)' },
  { k: 'lowpassHz', label: 'brightness', min: 800, max: 12000, step: 100, unit: 'Hz',
    hint: 'low: soft and muffled, like through a wall. High: crisp and sparkly (lowpass)' },
  { k: 'shelfDb', label: 'warmth', min: 0, max: 12, step: 0.5, unit: 'dB',
    hint: 'adds body to the bottom of the sound. Too much gets boomy (low shelf dB)' },
  { k: 'shelfHz', label: 'warmth depth', min: 60, max: 400, step: 10, unit: 'Hz',
    hint: 'how deep the warmth reaches: low is a felt rumble, high is a fuller middle (low shelf Hz)' },
  { k: 'wet', label: 'room echo', min: 0, max: 80, step: 1, unit: '%', ...pct,
    hint: '0: played right next to you. Higher: in a hall (reverb wet)' },
  { k: 'seconds', label: 'room size', min: 0.5, max: 5, step: 0.1, unit: 's',
    hint: 'how long the echo hangs: small room to cathedral (reverb length)' },
  { k: 'ringSeconds', label: 'note length', min: 0.4, max: 4, step: 0.1, unit: 's',
    hint: 'how long each note keeps sounding before it fades (ring)' },
  { k: 'attackMs', label: 'soft start', min: 0, max: 60, step: 1, unit: 'ms',
    hint: '0: a crisp pluck. Higher: the note swells in gently (attack)' },
  { k: 'outputDb', label: 'volume', min: -18, max: 3, step: 0.5, unit: 'dB',
    hint: 'overall loudness. Every 6 down is about half as loud (output)' },
  { k: 'humanise', label: 'human touch', min: 0, max: 100, step: 1, unit: '%', ...pct,
    hint: 'tiny random changes in pitch and loudness, so repeats never sound robotic (humanise)' },
  { k: 'threshold', label: 'evening out', min: -40, max: 0, step: 1, unit: 'dB', group: 'advanced',
    hint: 'stops loud notes jumping out. Lower evens more (compressor threshold)' },
  { k: 'ratio', label: 'evening strength', min: 1, max: 12, step: 0.5, unit: ':1', group: 'advanced',
    hint: 'how hard loud bits get pulled back (compressor ratio)' },
  { k: 'knee', label: 'evening softness', min: 0, max: 30, step: 1, unit: 'dB', group: 'advanced',
    hint: 'how gently that kicks in (compressor knee)' },
]
const T = () => SOUND.tone
const GET = {
  layerLevel: () => SOUND.voices.layer?.level ?? 0.4, gapMs: () => SOUND.pair.gapMs, secondLevel: () => SOUND.pair.secondLevel,
  lowpassHz: () => T().lowpassHz, shelfHz: () => T().lowShelf.hz, shelfDb: () => T().lowShelf.db,
  wet: () => T().reverb.wet, seconds: () => T().reverb.seconds, ringSeconds: () => T().ringSeconds,
  attackMs: () => T().attackMs, outputDb: () => T().outputDb, threshold: () => T().compressor.threshold,
  ratio: () => T().compressor.ratio, knee: () => T().compressor.knee, humanise: () => T().humanise,
}
const SET = {
  layerLevel: (v) => { layerLevel = v; if (SOUND.voices.layer) SOUND.voices.layer.level = v },
  gapMs: (v) => { SOUND.pair.gapMs = v }, secondLevel: (v) => { SOUND.pair.secondLevel = v },
  lowpassHz: (v) => { T().lowpassHz = v }, shelfHz: (v) => { T().lowShelf.hz = v }, shelfDb: (v) => { T().lowShelf.db = v },
  wet: (v) => { T().reverb.wet = v }, seconds: (v) => { T().reverb.seconds = v }, ringSeconds: (v) => { T().ringSeconds = v },
  attackMs: (v) => { T().attackMs = v }, outputDb: (v) => { T().outputDb = v }, threshold: (v) => { T().compressor.threshold = v },
  ratio: (v) => { T().compressor.ratio = v }, knee: (v) => { T().compressor.knee = v }, humanise: (v) => { T().humanise = v },
}
let layerLevel = 0.4

// a snapshot of everything the panel can change, for saving and resetting
const snapshot = () => JSON.parse(JSON.stringify({
  voices: SOUND.voices, ladder: SOUND.ladder, motifNotes: SOUND.motifNotes, pair: SOUND.pair, tone: SOUND.tone, butterfly: SOUND.butterfly,
}))
const restore = (s) => {
  Object.assign(SOUND, JSON.parse(JSON.stringify(s)))
  retune(); loadVoices()
}

export function mountSoundPanel() {
  const fromConfig = snapshot()
  try { const saved = JSON.parse(localStorage.getItem(KEY)); if (saved) restore(saved) } catch { /* private mode */ }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(snapshot())) } catch { /* private mode */ } }

  const el = document.createElement('div')
  el.className = 'tune-panel sound-panel'
  el.dataset.noMotif = ''
  el.style.cssText = 'top:auto;bottom:12px;left:12px;right:auto;width:min(320px, calc(100vw - 24px));max-height:min(70vh, 640px);overflow:auto;touch-action:auto;overscroll-behavior:contain'

  const hint = (t) => `<small style="display:block;margin:-2px 0 4px;color:#616161;line-height:1.35">${t}</small>`
  const select = (k, label, options, h) =>
    `<div data-row="${k}"><label><span>${label}</span><select data-s="${k}" style="grid-column:2 / span 2">${options.map((o) => `<option value="${o.value ?? o}">${o.label ?? o}</option>`).join('')}</select></label>${hint(h)}</div>`
  const slider = ({ k, label, min, max, step, hint: h }) =>
    `<div data-row="${k}"><label><span>${label}</span><input type="range" data-k="${k}" min="${min}" max="${max}" step="${step}"><output></output></label>${hint(h)}</div>`
  el.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center"><b>sound</b><button type="button" data-a="fold">hide</button></div>
    <div class="sp-body" style="display:grid;gap:6px">
      <div class="sp-notes" style="display:flex;flex-wrap:wrap;gap:4px"></div>
      <small class="sp-shift" style="color:#616161"></small>
      <b style="margin-top:4px">butterfly</b>
      ${select('bflyStyle', 'its sound', [
        { value: 'glass', label: 'glass shimmer' }, { value: 'chime', label: 'wind chime' }, { value: 'flutter', label: 'wing flutter' }],
        'only the butterfly makes this. Glass: a soft glowing tone. Chime: a bell-like ting. Flutter: a quick run of high harp notes')}
      <div data-row="bflyLevel"><label><span>its volume</span><input type="range" data-b="level" min="0" max="100" step="5"><output></output></label></div>
      <button type="button" data-a="bfly">hear the butterfly</button>
      <b style="margin-top:4px">instrument</b>
      ${select('voice', 'instrument', Object.keys(VOICES), 'what plays the note (voice)')}
      ${select('layer', 'underneath', ['none', ...Object.keys(VOICES)], 'a second instrument blended under the first, for body (layer)')}
      ${slider(SLIDERS[0])}
      <b style="margin-top:4px">notes</b>
      ${select('key', 'starting note', NAMES, 'moves every note up or down together. Shifts the mood a little, never the tune (key)')}
      ${select('scale', 'note family', [
        { value: 'majpent', label: 'bright, never clashes' }, { value: 'minpent', label: 'wistful, never clashes' },
        { value: 'major', label: 'bright, full' }, { value: 'minor', label: 'moody, full' }],
        'which notes the buttons use. "Never clashes" sounds good in any order, even pressed fast (scale)')}
      ${select('register', 'pitch', ['low', 'middle', 'high'], 'deeper or higher overall (register)')}
      ${select('notesPerTrigger', 'notes per press', ['1', '2'], '2 adds a softer answering note after the first')}
      ${slider(SLIDERS[1])}${slider(SLIDERS[2])}
      <b style="margin-top:4px">tone</b>
      ${SLIDERS.slice(3).filter((x) => !x.group).map(slider).join('')}
      <details><summary style="cursor:pointer">advanced: evening out (fine to leave)</summary>
        ${SLIDERS.filter((x) => x.group).map(slider).join('')}
      </details>
      <div style="display:flex;gap:6px;flex-wrap:wrap">
        <button type="button" class="play" data-a="copy">copy settings</button>
        <button type="button" data-a="reset">reset to config</button>
      </div>
    </div>`

  const body = el.querySelector('.sp-body')
  const sliderOf = (k) => SLIDERS.find((x) => x.k === k)

  const sync = () => {
    const L = SOUND.ladder
    el.querySelector('[data-s=voice]').value = voiceName(SOUND.voices.main.folder)
    el.querySelector('[data-s=layer]').value = SOUND.voices.layer ? voiceName(SOUND.voices.layer.folder) : 'none'
    el.querySelector('[data-s=key]').value = L.key
    el.querySelector('[data-s=scale]').value = L.scale
    el.querySelector('[data-s=register]').value = L.register
    el.querySelector('[data-s=notesPerTrigger]').value = String(L.notesPerTrigger)
    el.querySelector('[data-s=bflyStyle]').value = SOUND.butterfly.style
    const bl = el.querySelector('[data-b=level]'); bl.value = Math.round(SOUND.butterfly.level * 100); bl.nextElementSibling.textContent = bl.value + '%'
    for (const { k, unit, from = (v) => v } of SLIDERS) {
      const input = el.querySelector(`[data-k=${k}]`)
      input.value = from(GET[k]())
      input.nextElementSibling.textContent = input.value + unit
    }
    // only show what applies
    el.querySelector('[data-row=layerLevel]').style.display = SOUND.voices.layer ? '' : 'none'
    for (const k of ['gapMs', 'secondLevel']) el.querySelector(`[data-row=${k}]`).style.display = L.notesPerTrigger === 2 ? '' : 'none'
    // a button per motif to hear it, and how far the furthest note is stretched from a real sample
    el.querySelector('.sp-notes').innerHTML = MOTIFS.map(([id, label]) =>
      `<button type="button" data-m="${id}" title="${label}">${label.split(' ')[0]} ${SOUND.motifNotes[id][0]}</button>`).join('')
    let worst = { by: 0, note: '' }
    for (const v of [SOUND.voices.main, SOUND.voices.layer].filter(Boolean)) {
      const have = Object.keys(SOUND.samples[v.folder]).map(Number)
      for (const n of Object.values(SOUND.motifNotes).flat()) {
        const by = Math.min(...have.map((h) => Math.abs(h - toMidi(n))))
        if (by > worst.by) worst = { by, note: `${n} on ${voiceName(v.folder)}` }
      }
    }
    el.querySelector('.sp-shift').textContent = worst.by > 2
      ? `heads up: ${worst.note} is stretched ${worst.by} steps from a real recording; past 2 it can sound dull or wobbly`
      : 'every note is close to a real recording, so all sound natural'
  }

  el.addEventListener('pointerdown', (e) => {
    const m = e.target.closest('[data-m]')
    if (m) playMotif(m.dataset.m)
  })
  el.addEventListener('click', (e) => {
    const a = e.target.closest('[data-a]')?.dataset.a
    if (a === 'fold') { const hide = body.style.display !== 'none'; body.style.display = hide ? 'none' : 'grid'; e.target.textContent = hide ? 'show' : 'hide' }
    if (a === 'bfly') playButterfly()
    if (a === 'copy') { navigator.clipboard?.writeText(JSON.stringify(exportSettings(), null, 2)); e.target.textContent = 'copied' }
    if (a === 'reset') { restore(fromConfig); try { localStorage.removeItem(KEY) } catch { /* private mode */ } sync() }
  })
  el.addEventListener('input', (e) => {
    if (e.target.dataset.b === 'level') { SOUND.butterfly.level = +e.target.value / 100; save(); sync(); return }
    const k = e.target.dataset.k
    if (!k) return
    const { to = (v) => v } = sliderOf(k)
    SET[k](to(+e.target.value))
    retune(); save(); sync()
  })
  el.addEventListener('change', (e) => {
    const s = e.target.dataset.s
    if (!s) return
    const v = e.target.value, L = SOUND.ladder
    if (s === 'bflyStyle') { SOUND.butterfly.style = v; save(); sync(); playButterfly(); return }
    if (s === 'voice') SOUND.voices.main = { folder: VOICES[v], level: 1 }
    if (s === 'layer') SOUND.voices.layer = v === 'none' ? null : { folder: VOICES[v], level: layerLevel }
    if (s === 'key' || s === 'scale' || s === 'register') L[s] = v
    if (s === 'notesPerTrigger') L.notesPerTrigger = +v
    SOUND.motifNotes = buildNotes(L)
    loadVoices(); save(); sync()
  })

  sync()
  document.body.append(el)
  return el
}

// Sound settings locked on the sound bench, 3 Oct 2026.
// Change values here, never inside engine.js.

export const SOUND = {
  // Main voice and the quiet layer underneath it
  voices: {
    main:  { folder: 'folk-harp',   level: 1.0 },
    layer: { folder: 'grand-piano', level: 0.4 },
  },

  // Samples that exist on disk (midi number -> file). Anything in between is pitch-shifted
  // from the nearest file, never by more than one semitone.
  samples: {
    'folk-harp':   { 62:'D4', 64:'E4', 66:'Fs4', 68:'Gs4', 70:'As4', 74:'D5', 76:'E5', 78:'Fs5', 80:'Gs5', 82:'As5', 86:'D6', 88:'E6', 90:'Fs6' },
    'grand-piano': { 63:'Ds4', 66:'Fs4', 69:'A4', 72:'C5', 75:'Ds5', 78:'Fs5', 81:'A5', 84:'C6', 87:'Ds6', 90:'Fs6' },
  },

  // Two notes per hover or tap: D major pentatonic, second note a fifth above (+3 scale steps)
  motifNotes: {
    logo:          ['D4', 'A4'],
    work:          ['E4', 'B4'],
    about:         ['F#4', 'D5'],
    play:          ['A4', 'E5'],
    nextCaseStudy: ['B4', 'F#5'],
    letsTalk:      ['D5', 'A5'],
    email:         ['E5', 'B5'],
    linkedin:      ['F#5', 'D6'],
    resume:        ['A5', 'E6'],
    centrepiece:   ['B5', 'F#6'],
  },

  pair: { gapMs: 270, secondLevel: 0.45 },

  tone: {
    lowpassHz: 9500,
    lowShelf: { hz: 180, db: 4 },
    reverb: { wet: 0.44, seconds: 2.6, predelayMs: 22 },
    ringSeconds: 1.5,
    attackMs: 8,
    outputDb: -3,
    compressor: { threshold: -20, knee: 14, ratio: 3, attack: 0.006, release: 0.25 },
    humanise: 0.52,
  },

  maxVoices: 16,
  retriggerMs: 140,
};

// For the About page or colophon
export const SOUND_CREDITS = [
  'Folk harp samples from the Versilian Community Sample Library by Versilian Studios, CC0.',
  'Grand piano samples from the Salamander Grand Piano by Alexander Holm, CC BY 3.0.',
];

// Sound settings from Lavanya's sound bench, 12 Nov 2026: a single grand piano note per press.
// (3 Oct 2026 was two notes, folk harp over piano, in D.) Change values here, never inside engine.js.
// ?sound on the site opens a live panel with every setting below; "copy settings" gives them back.

export const SOUND = {
  // Main voice and an optional quiet layer underneath it (null for none)
  voices: {
    main:  { folder: 'grand-piano', level: 1.0 },
    layer: null,
  },

  // How motifNotes below were made: consecutive notes of the scale from the key, in this register,
  // one per motif in the order listed. The ?sound panel rebuilds motifNotes from these.
  ladder: { key: 'C', scale: 'majpent', register: 'middle', notesPerTrigger: 1 },

  // Samples that exist on disk (midi number -> file). Anything in between is pitch-shifted
  // from the nearest file: within a semitone or so inside the range, more below the lowest file
  // (C4 on the piano comes from Ds4, 3 semitones down).
  samples: {
    'folk-harp':   { 62:'D4', 64:'E4', 66:'Fs4', 68:'Gs4', 70:'As4', 74:'D5', 76:'E5', 78:'Fs5', 80:'Gs5', 82:'As5', 86:'D6', 88:'E6', 90:'Fs6' },
    'grand-piano': { 63:'Ds4', 66:'Fs4', 69:'A4', 72:'C5', 75:'Ds5', 78:'Fs5', 81:'A5', 84:'C6', 87:'Ds6', 90:'Fs6' },
  },

  // One note per press: C major pentatonic, middle register. A second entry in a list would play
  // as an answering note (pair.gapMs later, at pair.secondLevel); linkedin covers X too.
  motifNotes: {
    logo:          ['C4'],
    work:          ['D4'],
    about:         ['E4'],
    play:          ['G4'],
    nextCaseStudy: ['A4'],
    letsTalk:      ['C5'],
    email:         ['D5'],
    linkedin:      ['E5'],
    resume:        ['G5'],
    centrepiece:   ['A5'],
  },

  // only used when a motif has a second note
  pair: { gapMs: 270, secondLevel: 0.45 },

  tone: {
    lowpassHz: 3800,
    lowShelf: { hz: 180, db: 6 },
    reverb: { wet: 0.30, seconds: 2.6, predelayMs: 22 },
    ringSeconds: 2,
    attackMs: 8,
    outputDb: -1,
    compressor: { threshold: -20, knee: 14, ratio: 3, attack: 0.006, release: 0.25 },
    humanise: 0.30,
  },

  maxVoices: 16,
  retriggerMs: 140,
};

// For the About page or colophon
export const SOUND_CREDITS = [
  'Folk harp samples from the Versilian Community Sample Library by Versilian Studios, CC0.',
  'Grand piano samples from the Salamander Grand Piano by Alexander Holm, CC BY 3.0.',
];

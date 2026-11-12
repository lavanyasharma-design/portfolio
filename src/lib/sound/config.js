// Sound settings from Lavanya's sound bench, 12 Nov 2026 (second take): one note per press, folk harp
// with the grand piano underneath at 55%, in D# major pentatonic.
// (3 Oct 2026 was two notes, folk harp over piano, in D.) Change values here, never inside engine.js.
// ?sound on the site opens a live panel with every setting below; "copy settings" gives them back.

export const SOUND = {
  // Main voice and an optional quiet layer underneath it (null for none)
  voices: {
    main:  { folder: 'folk-harp',   level: 1.0 },
    layer: { folder: 'grand-piano', level: 0.55 },
  },

  // How motifNotes below were made: consecutive notes of the scale from the key, in this register,
  // one per motif in the order listed. The ?sound panel rebuilds motifNotes from these.
  ladder: { key: 'D#', scale: 'majpent', register: 'middle', notesPerTrigger: 1 },

  // Samples that exist on disk (midi number -> file). Anything in between is pitch-shifted
  // from the nearest file: within a semitone or so inside the range, more below the lowest file
  // (C4 on the piano would come from Ds4, 3 semitones down).
  samples: {
    'folk-harp':   { 62:'D4', 64:'E4', 66:'Fs4', 68:'Gs4', 70:'As4', 74:'D5', 76:'E5', 78:'Fs5', 80:'Gs5', 82:'As5', 86:'D6', 88:'E6', 90:'Fs6' },
    'grand-piano': { 63:'Ds4', 66:'Fs4', 69:'A4', 72:'C5', 75:'Ds5', 78:'Fs5', 81:'A5', 84:'C6', 87:'Ds6', 90:'Fs6' },
  },

  // One note per press: D# major pentatonic, middle register. A second entry in a list would play
  // as an answering note (pair.gapMs later, at pair.secondLevel); linkedin covers X too.
  motifNotes: {
    logo:          ['D#4'],
    work:          ['F4'],
    about:         ['G4'],
    play:          ['A#4'],
    nextCaseStudy: ['C5'],
    letsTalk:      ['D#5'],
    email:         ['F5'],
    linkedin:      ['G5'],
    resume:        ['A#5'],
    centrepiece:   ['C6'],
  },

  // only used when a motif has a second note
  pair: { gapMs: 270, secondLevel: 0.45 },

  tone: {
    lowpassHz: 3800,
    lowShelf: { hz: 260, db: 7 },
    reverb: { wet: 0.47, seconds: 1.6, predelayMs: 22 },
    ringSeconds: 1.3,
    attackMs: 8,
    outputDb: -5.5,
    compressor: { threshold: -20, knee: 14, ratio: 3, attack: 0.006, release: 0.25 },
    humanise: 0.56,
  },

  maxVoices: 16,
  retriggerMs: 140,
};

// For the About page or colophon
export const SOUND_CREDITS = [
  'Folk harp samples from the Versilian Community Sample Library by Versilian Studios, CC0.',
  'Grand piano samples from the Salamander Grand Piano by Alexander Holm, CC BY 3.0.',
];

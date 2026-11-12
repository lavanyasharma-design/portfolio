// Sound settings from Lavanya's sound bench, 12 Nov 2026 (final take, "i love this"): one note per
// press, folk harp with the grand piano underneath at 50%, in G major pentatonic.
// (3 Oct 2026 was two notes, folk harp over piano, in D.) Change values here, never inside engine.js.
// ?sound on the site opens a live panel with every setting below; "copy settings" gives them back.

export const SOUND = {
  // Main voice and an optional quiet layer underneath it (null for none)
  voices: {
    main:  { folder: 'folk-harp',   level: 1.0 },
    layer: { folder: 'grand-piano', level: 0.5 },
  },

  // How motifNotes below were made: consecutive notes of the scale from the key, in this register,
  // one per motif in the order listed. The ?sound panel rebuilds motifNotes from these.
  ladder: { key: 'G', scale: 'majpent', register: 'middle', notesPerTrigger: 1 },

  // Samples that exist on disk (midi number -> file). Anything in between is pitch-shifted
  // from the nearest file: within a semitone or so inside the range, more below the lowest file
  // (C4 on the piano would come from Ds4, 3 semitones down).
  samples: {
    'folk-harp':   { 62:'D4', 64:'E4', 66:'Fs4', 68:'Gs4', 70:'As4', 74:'D5', 76:'E5', 78:'Fs5', 80:'Gs5', 82:'As5', 86:'D6', 88:'E6', 90:'Fs6' },
    'grand-piano': { 63:'Ds4', 66:'Fs4', 69:'A4', 72:'C5', 75:'Ds5', 78:'Fs5', 81:'A5', 84:'C6', 87:'Ds6', 90:'Fs6' },
  },

  // One note per press: G major pentatonic, middle register. A second entry in a list would play
  // as an answering note (pair.gapMs later, at pair.secondLevel). X got its own note on 12 Nov
  // (it shared LinkedIn's before), which moved resume and centrepiece up one.
  // Where sound lives (decided 12 Nov 2026): [work] [about] [play], email, LinkedIn, X, the nav bar
  // on every page, and a "next" button at the end of a case study. Nothing else (the about and
  // play pages' own content stay silent). logo, letsTalk, resume and centrepiece are spare.
  motifNotes: {
    logo:          ['G4'],
    work:          ['A4'],
    about:         ['B4'],
    play:          ['D5'],
    nextCaseStudy: ['E5'],
    letsTalk:      ['G5'],
    email:         ['A5'],
    linkedin:      ['B5'],
    x:             ['D6'],
    resume:        ['E6'],
    centrepiece:   ['G6'],
  },

  // The butterfly's own sound, deliberately unlike the buttons' harp and used nowhere else.
  // Plays on click or tap (it still twitches on hover). Pick a style with ?sound.
  //   flutter: a quick, quiet run of high harp notes, like wings
  //   glass:   a soft synthesised glow (root, fifth and octave) with a slight waver
  //   chime:   a bell-like ting and a softer echo, synthesised
  butterfly: {
    style: 'glass',
    level: 0.6,
    retriggerMs: 450,
    styles: {
      flutter: { kind: 'samples', notes: ['B5', 'D6', 'E6', 'G6'], spacingMs: 45, level: 0.45 },
      glass:   { kind: 'synth', base: 'G5', partials: [[1, 1], [1.5, 0.55], [2, 0.3]], attackMs: 60, seconds: 1.8, vibratoCents: 5, glideCents: 14, strikes: [[0, 1]] },
      chime:   { kind: 'synth', base: 'B5', partials: [[1, 1], [2, 0.45], [2.76, 0.3], [5.4, 0.12]], attackMs: 2, seconds: 2.4, vibratoCents: 0, glideCents: 0, strikes: [[0, 1], [130, 0.4]] },
    },
  },

  // only used when a motif has a second note
  pair: { gapMs: 270, secondLevel: 0.45 },

  tone: {
    lowpassHz: 5000,
    lowShelf: { hz: 260, db: 8 },
    reverb: { wet: 0.47, seconds: 1.6, predelayMs: 22 },
    ringSeconds: 1.3,
    attackMs: 12,
    outputDb: -6,
    compressor: { threshold: -20, knee: 14, ratio: 3, attack: 0.006, release: 0.25 },
    humanise: 0.70,
  },

  maxVoices: 16,
  retriggerMs: 140,
};

// For the About page or colophon
export const SOUND_CREDITS = [
  'Folk harp samples from the Versilian Community Sample Library by Versilian Studios, CC0.',
  'Grand piano samples from the Salamander Grand Piano by Alexander Holm, CC BY 3.0.',
];

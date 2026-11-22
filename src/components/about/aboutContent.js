/**
 * The About page's words and photos, kept in one place so copy changes don't touch the layout.
 * Copy: hers, from the Figma rough layout (Portfolio-Design 419:14, 2026-11-22): "Hi!" over the intro,
 * a new end to the third paragraph and a fourth (Rick Rubin). Wavy teal underlines where she drew them.
 * A paragraph is a list of runs: a plain string, or { t, u } (wavy underline) / { t, i } (italic).
 * Experience: from her resume, "Role @Company / dates", as she set it in Figma.
 * Photos: her originals live in public/about page photos/ (not committed); the page uses web-sized
 * WebP copies in public/about/ (800 wide, quality 80), made with ffmpeg-static.
 */

export const HELLO = 'Hi!'
export const INTRO = ['I’m ', { t: 'Lavanya', u: true }, ' and I’m a product designer.']

export const PARAGRAPHS = [
  ['I have always instinctively approached design with understanding the “Why”. What’s working, how and why are my initial questions, the ones I look for answers to in the first minute.'],
  ['In the past year and a half I’ve had the opportunity to work in fintech and closely see the factors dictating design decisions. I’ve designed a SaaS for mobile (yes! every complex action simplified for a mobile screen), designed packaging for an NFC device that disables 2AM doom scrolling, picked up on an identity resolution system of a client that didn’t work out, but', { t: ' I was curious', u: true }, '!'],
  [{ t: 'I love design', u: true }, '. Hayao Miyazaki, Alberto Mielgo, Charles Dickens, Jane Austen, Kanye West, Fred again.., Jonathan Anderson; all these people speak to my admiration for design, art, and the sheer joy of creating <3. I seek inspiration in the smallest of things that hold the ability to solve, ease or simply invoke a feeling. I’m more of an architect who likes building systems that sustain.'],
  ['The words of Rick Rubin in his book ', { t: 'The Creative Act: A Way of Being', i: true }, ' ~ “', { t: 'Do what you can with what you have. Nothing more is needed.”', u: true }, ' I build through this philosophy and somehow, I always end up figuring the best possible way out. I’m quite relentless this way.'],
]

/** a run list as plain text (for screen readers and the fallback) */
export const plain = (runs) => runs.map(r => (typeof r === 'string' ? r : r.t)).join('')

export const EXPERIENCE = [
  { role: 'Freelance Product Designer', dates: 'Sep 2025 - Present' },
  { role: 'Product Designer', at: 'Roadcast', dates: 'Mar 2025 - Jul 2025' },
  { role: 'Product Design Intern', at: 'BharatPe', dates: 'Oct 2024 - Feb 2025' },
]

// her Google Drive link (still to come); until then the link has no address
export const RESUME_URL = ''

export const GALLERY_TITLE = '{visuals from my journey so far}'

// {visuals from my journey so far}: her arrangement from the rough layout (419:14). Each photo sits in a
// frame of the size she drew (w x h, in her 1252-wide column) and fills it, zoomed and centred as set in
// ?about (PHOTO_FIT in aboutLayout.js). A row holds one or two groups, each with its heading over its photos;
// `gap` is the space she left between photos, `rowGap` between the two groups.
const photo = (src, caption, w, h) => ({ src: `/about/${src}.webp`, id: src, caption, w, h })

export const GALLERY = [
  { id: 'teams', rowGap: 60, groups: [
    { label: 'People I enjoyed working with', gap: 28, photos: [
      photo('roadcast-1', 'product & business team', 294, 180),
      photo('roadcast-2', 'launched a campaign with this team', 295, 197),
    ] },
    { label: 'People I learnt ample from', gap: 24, photos: [
      photo('bharatpe-1', 'the design team', 275, 225),
      photo('bharatpe-2', 'PMs I worked with', 275, 215),
    ] },
  ] },
  { id: 'grad', groups: [
    { label: 'Design Grad', gap: 24, photos: [
      photo('design-grad-1', 'loved leading teams', 295, 210),
      photo('design-grad-2', 'where I learnt about “user” & “context”', 295, 221),
      photo('design-grad-3', 'love talking to people', 295, 166),
      photo('design-grad-4', 'can write without looking', 295, 221),
    ] },
  ] },
  { id: 'adventures', groups: [
    { label: 'Adventures', gap: 24, photos: [
      photo('adventure-1', 'music video marketing', 295, 221),
      photo('adventure-2', 'study at rural Punjab', 295, 222),
      photo('adventure-4', 'business workshop', 295, 219),
      photo('adventure-5', 'presenting my work', 295, 292),
    ] },
  ] },
]

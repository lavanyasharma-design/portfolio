/**
 * The About page's words and photos, kept in one place so copy changes don't touch the layout.
 * Copy: Lavanya's (2026-11-21), with the fixes she approved (SaaS, Alberto Mielgo, grammar); it goes through a Figma frame for her edits, as Bolt's did.
 * Experience: from her resume (Sep 2025), in the "Role @ Company / dates" shape of her reference
 * (Rachel Chen's about page).
 * Photos: her originals live in public/about page photos/ (not committed); the page uses web-sized
 * WebP copies in public/about/ (800 wide, quality 80), made with ffmpeg-static.
 */

export const INTRO = 'I’m Lavanya and I’m a product designer.'

export const PARAGRAPHS = [
  'I have always instinctively approached design with understanding the “Why”. What’s working, how and why are my initial questions, the ones I look for answers to in the first minute.',
  'In the past year and a half I’ve had the opportunity to work in fintech and closely see the factors dictating design decisions. I’ve designed a SaaS for mobile (yes! every complex action simplified for a mobile screen), designed packaging for an NFC device that disables 2AM doom scrolling, picked up on an identity resolution system of a client that didn’t work out, but I was curious!',
  'I love design. Hayao Miyazaki, Alberto Mielgo, Charles Dickens, Jane Austen, Kanye West, Fred again.., Jonathan Anderson; all these people speak to my admiration for design, art, and the sheer joy of creating <3',
]

export const EXPERIENCE = [
  { role: 'Freelance Product Designer', dates: 'Sep 2025 - Present' },
  { role: 'Product Designer', at: 'Roadcast', dates: 'Mar 2025 - Jul 2025' },
  { role: 'Product Design Intern', at: 'BharatPe', dates: 'Oct 2024 - Feb 2025' },
]

// her Google Drive link (coming 2026-11-22); until then the link is marked as a draft
export const RESUME_URL = ''

// {a visual throwback}: her groups and captions from the Figma frame (415:11136), in her words and case.
// Upright photos at their own shape, nothing cropped, four to a row on desktop, as on Rachel Chen's page
// (hers, 2026-11-21: the tilted, overlapping prints cut people out of the group photos and felt chaotic).
// Waiting on her rough layout sketch for the final arrangement.
//   ratio  the photo's own width / height (from the originals)
//   group  which {label} it sits under, where a row holds two groups (the teams)
const photo = (src, caption, ratio, group = 0) => ({ src: `/about/${src}.webp`, caption, ratio, group })

export const COLLAGES = [
  // the two teams share a row, each label over its pair (her layout, 414:7014)
  { id: 'teams', labels: ['team at Roadcast', 'team at Bharatpe'], photos: [
    photo('roadcast-1', 'product & business team', 1280 / 853),
    photo('roadcast-2', 'launched a campaign with this team', 1280 / 853),
    photo('bharatpe-1', 'the design team', 1280 / 1076, 1),
    photo('bharatpe-2', 'PMs I worked with', 1280 / 960, 1),
  ] },
  { id: 'grad', labels: ['Design Grad'], photos: [
    photo('design-grad-1', 'loved leading in teams', 1216 / 865),
    photo('design-grad-2', 'where I learnt about “user” & “context”', 1160 / 868),
    photo('design-grad-3', 'love talking to people', 1280 / 720),
    photo('design-grad-4', 'can write without looking', 1216 / 913),
  ] },
  // the design hackathon photo is out (hers, 2026-11-21)
  { id: 'adventures', labels: ['Adventures'], photos: [
    photo('adventure-1', 'music video marketing', 1216 / 913),
    photo('adventure-2', 'study at rural Punjab', 1213 / 913),
    photo('adventure-4', 'business workshop', 1056 / 784),
    photo('adventure-5', 'presenting my work', 514 / 509),
  ] },
]

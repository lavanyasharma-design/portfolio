// What the colophon says. Content only: the dialog's design comes from Lavanya's Figma later.
// It opens on click / tap / Enter from "Colophon" in the footer (decided 12 Nov 2026), so every
// credit is reachable on a phone and from a keyboard too.
//
// `required` marks credits a licence asks for; keep those, whatever the design leaves out.

export const COLOPHON = [
  {
    heading: 'Sound',
    items: [
      {
        what: 'Piano',
        work: 'Salamander Grand Piano',
        by: 'Alexander Holm',
        licence: 'CC BY 3.0',
        licenceUrl: 'https://creativecommons.org/licenses/by/3.0/',
        source: 'https://sfzinstruments.github.io/pianos/salamander',
        note: 'Sampled, pitch-shifted and played through reverb',
        required: true,
      },
      {
        what: 'Harp',
        work: 'Versilian Community Sample Library',
        by: 'Versilian Studios',
        licence: 'CC0',
        licenceUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
        source: 'https://versilian-studios.com/vcsl/',
        note: 'Folk harp samples',
        required: false,
      },
    ],
  },
  {
    heading: 'Window intro',
    items: [
      {
        what: 'Pencil effect',
        work: 'notebook drawings',
        by: 'Florian Berger',
        licence: 'CC BY-NC-SA 3.0',
        licenceUrl: 'https://creativecommons.org/licenses/by-nc-sa/3.0/',
        source: 'https://www.shadertoy.com/view/XtVGD1',
        note: 'Adapted for the window artwork',
        required: true,
      },
    ],
  },
  {
    heading: 'Type and icons',
    items: [
      { what: 'Serif', work: 'Cormorant Infant', by: 'Christian Thalmann', licence: 'SIL Open Font License', source: 'https://fonts.google.com/specimen/Cormorant+Infant', required: false },
      { what: 'Sans', work: 'DM Sans', by: 'Colophon Foundry, Jonny Pinhorn and Indian Type Foundry', licence: 'SIL Open Font License', source: 'https://fonts.google.com/specimen/DM+Sans', required: false },
      { what: 'Icons', work: 'Lucide', by: 'Lucide contributors', licence: 'ISC', source: 'https://lucide.dev', required: false },
    ],
  },
]

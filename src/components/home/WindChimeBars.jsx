const GRADIENT =
  'linear-gradient(180deg, var(--color-rain-violet) 0%, var(--color-rain-magenta) 50%, var(--color-rain-teal) 100%)'

// Small deterministic PRNG so bar lengths/tilts look randomised but stay
// stable across renders (no layout jitter on re-render).
function mulberry32(seed) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rand = mulberry32(2026)
const randBetween = (min, max) => min + rand() * (max - min)

// Anchor points, confined to a 200px band off each edge, touching the top
// and side edges of the viewport, leaving the centred text column clear.
const POSITIONS = [
  { edge: 'left', offset: 0, top: '0%' },
  { edge: 'left', offset: 14, top: '12%' },
  { edge: 'left', offset: 28, top: '0%' },
  { edge: 'left', offset: 45, top: '22%' },
  { edge: 'left', offset: 60, top: '5%' },
  { edge: 'left', offset: 80, top: '35%' },
  { edge: 'left', offset: 100, top: '0%' },
  { edge: 'left', offset: 120, top: '48%' },
  { edge: 'left', offset: 140, top: '18%' },
  { edge: 'left', offset: 160, top: '60%' },
  { edge: 'left', offset: 180, top: '0%' },
  { edge: 'left', offset: 200, top: '30%' },
  { edge: 'left', offset: 35, top: '70%' },
  { edge: 'left', offset: 90, top: '80%' },
  { edge: 'left', offset: 150, top: '90%' },
  { edge: 'left', offset: 10, top: '55%' },
  { edge: 'right', offset: 0, top: '0%' },
  { edge: 'right', offset: 14, top: '15%' },
  { edge: 'right', offset: 28, top: '0%' },
  { edge: 'right', offset: 45, top: '25%' },
  { edge: 'right', offset: 60, top: '8%' },
  { edge: 'right', offset: 80, top: '38%' },
  { edge: 'right', offset: 100, top: '0%' },
  { edge: 'right', offset: 120, top: '52%' },
  { edge: 'right', offset: 140, top: '20%' },
  { edge: 'right', offset: 160, top: '65%' },
  { edge: 'right', offset: 180, top: '0%' },
  { edge: 'right', offset: 200, top: '32%' },
  { edge: 'right', offset: 40, top: '75%' },
  { edge: 'right', offset: 95, top: '85%' },
  { edge: 'right', offset: 155, top: '92%' },
  { edge: 'right', offset: 12, top: '58%' },
]

// Piano-roll-style note lengths: bars snap to one of a fixed set of
// discrete sizes, like grid-quantised note durations, instead of a
// smooth continuous random height.
const NOTE_LENGTHS = [40, 55, 70, 85, 100, 115, 130]

const CHIMES = POSITIONS.map((pos) => ({
  ...pos,
  height: NOTE_LENGTHS[Math.floor(rand() * NOTE_LENGTHS.length)],
  rotate: randBetween(-4, 4),
}))

function WindChimeBars() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      {CHIMES.map((chime, i) => (
        <span
          key={i}
          className={`absolute flex flex-col items-center ${i % 3 === 0 ? 'hidden md:flex' : ''}`}
          style={{
            [chime.edge]: `min(${chime.offset}px, ${(chime.offset / 200) * 40}%)`,
            top: chime.top,
            // Pivot at the hanging point so a future swing animation
            // rotates the whole chime like a pendulum, not around its centre.
            transformOrigin: 'top center',
            transform: `rotate(${chime.rotate}deg)`,
          }}
        >
          {/* eyelet cap where the thread meets the tube */}
          <span
            className="h-[6px] w-[6px] rounded-full"
            style={{
              background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.9), var(--color-rain-violet) 70%)',
              boxShadow: '1px 1px 2px rgba(0,0,0,0.3)',
            }}
          />

          {/* the chime tube itself: gradient colour + layered shading for a rounded, 3D look */}
          <span
            className="w-[5px] rounded-full"
            style={{
              height: `${chime.height}px`,
              backgroundImage: `linear-gradient(90deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 30%, rgba(0,0,0,0) 70%, rgba(0,0,0,0.3) 100%), ${GRADIENT}`,
              backgroundBlendMode: 'overlay',
              boxShadow:
                '2px 2px 4px rgba(0,0,0,0.25), inset 1px 0 1px rgba(255,255,255,0.35), inset -1px 0 1px rgba(0,0,0,0.25)',
            }}
          />
        </span>
      ))}
    </div>
  )
}

export default WindChimeBars

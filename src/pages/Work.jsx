import { useEffect, useState } from 'react'
import CaseTile from '../components/work/CaseTile'
import Tuner from '../components/work/Tuner'
import LookTuner from '../components/work/LookTuner'
import MotifField from '../components/motif/MotifField'
import { TILES, LOOK, DEFAULT_BG, TILE_W } from '../components/work/tiles'
import './Work.css'

// In dev, ?tune opens the tile background panel; ?tune=layout also makes the mockups
// draggable and opens the position panel. Tuned values survive reloads in localStorage.
const PARAM = import.meta.env.DEV ? new URLSearchParams(location.search).get('tune') : null
const BG_TUNE = PARAM !== null
const TUNE = PARAM === 'layout'
const KEY = 'work-tiles-tuning-v7' // bumped whenever tiles.js changes shape or values
const BG_KEY = 'work-tiles-bg-v2'

const BGS = Object.fromEntries(TILES.map(t => [t.id, t.bg ?? DEFAULT_BG]))

function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) || fallback } catch { return fallback }
}

const rgb = hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16)).join(' ')

// LOOK as CSS variables on the grid; CaseTile.css composes them per tile
function lookVars({ shadow: s, border }) {
  return {
    '--tile-border': border.on ? border.color : 'transparent',
    '--sh-x': s.x, '--sh-y': s.y, '--sh-blur': s.blur, '--sh-rgb': rgb(s.color),
    '--sh-a': s.opacity, '--sh-ca': Math.min(1, s.opacity * s.contact * 2),
  }
}

/** "selected work", Figma frame 290:12780 */
function Work() {
  const [tiles, setTiles] = useState(TUNE ? () => load(KEY, TILES) : TILES)
  const [bgs, setBgs] = useState(BG_TUNE ? () => ({ ...BGS, ...load(BG_KEY, {}) }) : BGS)
  const [active, setActive] = useState({ tile: 'bolt', layer: 'bolt-1' })

  useEffect(() => {
    try {
      if (TUNE) localStorage.setItem(KEY, JSON.stringify(tiles))
      if (BG_TUNE) localStorage.setItem(BG_KEY, JSON.stringify(bgs))
    } catch { /* private mode */ }
  }, [tiles, bgs])

  const change = (tileId, layerId, patch) => setTiles(ts => ts.map(t => t.id !== tileId ? t : {
    ...t, layers: t.layers.map(l => l.id === layerId ? { ...l, ...patch } : l),
  }))

  const drag = tileId => (e, layerId) => {
    e.preventDefault()
    setActive({ tile: tileId, layer: layerId })
    const u = e.currentTarget.closest('.case-tile').getBoundingClientRect().width / TILE_W
    const l = tiles.find(t => t.id === tileId).layers.find(l => l.id === layerId)
    const start = { px: e.clientX, py: e.clientY, x: l.x, y: l.y }
    const move = ev => change(tileId, layerId, {
      x: Math.round(start.x + (ev.clientX - start.px) / u),
      y: Math.round(start.y + (ev.clientY - start.py) / u),
    })
    const up = () => { removeEventListener('pointermove', move); removeEventListener('pointerup', up) }
    addEventListener('pointermove', move)
    addEventListener('pointerup', up)
  }

  const tunedTile = tiles.find(t => t.id === active.tile)

  return (
    <>
    <main className="work-page">
      <MotifField />
      <h1 className="serif">selected work</h1>
      <div className="tiles" style={lookVars(LOOK)} onClickCapture={TUNE ? e => e.preventDefault() : undefined}>
        {tiles.map(t => (
          <CaseTile
            key={t.id}
            tile={t}
            look={LOOK}
            bg={bgs[t.id] ?? DEFAULT_BG}
            tuning={TUNE}
            selected={TUNE && active.tile === t.id ? active.layer : null}
            onLayerPointerDown={TUNE ? drag(t.id) : undefined}
          />
        ))}
      </div>
    </main>
    {/* panels sit outside main: MotifField makes main's other children position: relative */}
      {TUNE && (
        <Tuner
          tile={tunedTile}
          selected={active.layer}
          onSelect={layer => setActive(a => ({ ...a, layer }))}
          onChange={(layerId, patch) => change(active.tile, layerId, patch)}
          onReset={() => setTiles(TILES)}
        />
      )}
      {BG_TUNE && (
        <LookTuner
          tiles={TILES}
          bgs={bgs}
          onChange={(id, bg) => setBgs(b => ({ ...b, [id]: bg }))}
          onReset={id => setBgs(b => ({ ...b, [id]: BGS[id] }))}
        />
      )}
    </>
  )
}

export default Work

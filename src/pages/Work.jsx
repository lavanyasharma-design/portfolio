import { useEffect, useState } from 'react'
import CaseTile from '../components/work/CaseTile'
import Tuner from '../components/work/Tuner'
import { TILES, TILE_W } from '../components/work/tiles'
import './Work.css'

// ?tune in dev opens the tile tuner; tuned values survive reloads in localStorage
const TUNE = import.meta.env.DEV && new URLSearchParams(location.search).has('tune')
const KEY = 'work-tiles-tuning-v5' // bumped whenever tiles.js changes shape or values

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || TILES } catch { return TILES }
}

/** "selected work", Figma frame 290:12780 */
function Work() {
  const [tiles, setTiles] = useState(TUNE ? load : TILES)
  const [active, setActive] = useState({ tile: 'bolt', layer: 'bolt-1' })

  useEffect(() => {
    if (!TUNE) return
    try { localStorage.setItem(KEY, JSON.stringify(tiles)) } catch { /* private mode */ }
  }, [tiles])

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
    <main className="work-page">
      <h1 className="serif">selected work</h1>
      <div className="tiles" onClickCapture={TUNE ? e => e.preventDefault() : undefined}>
        {tiles.map(t => (
          <CaseTile
            key={t.id}
            tile={t}
            tuning={TUNE}
            selected={TUNE && active.tile === t.id ? active.layer : null}
            onLayerPointerDown={TUNE ? drag(t.id) : undefined}
          />
        ))}
      </div>
      {TUNE && (
        <Tuner
          tile={tunedTile}
          selected={active.layer}
          onSelect={layer => setActive(a => ({ ...a, layer }))}
          onChange={(layerId, patch) => change(active.tile, layerId, patch)}
          onReset={() => setTiles(TILES)}
        />
      )}
    </main>
  )
}

export default Work

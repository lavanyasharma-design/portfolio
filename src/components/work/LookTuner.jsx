import { useState } from 'react'
import './Tuner.css'

const MODES = ['solid', 'linear', 'radial', 'motif']

/**
 * Dev-only panel for one tile's background at a time. Pick the tile, then the mode and
 * colours. "Copy values" puts that tile's bg line on the clipboard to paste into tiles.js.
 */
function LookTuner({ tiles, bgs, onChange, onReset }) {
  const [id, setId] = useState(tiles[0].id)
  const [copied, setCopied] = useState(false)
  const bg = bgs[id]
  const set = patch => onChange(id, { ...bg, ...patch })

  const copy = () => {
    const text = 'bg: ' + JSON.stringify(bg).replace(/"(\w+)":/g, '$1: ').replace(/,(?=\w)/g, ', ').replace(/"/g, "'") + ','
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1400) })
  }

  const colour = (k, name) => (
    <label key={k} className="colour">
      <span>{name}</span>
      <input type="color" value={bg[k]} onChange={e => set({ [k]: e.target.value })} />
      <code>{bg[k]}</code>
    </label>
  )

  return (
    <aside className="tuner look" aria-label="Tile background tuner">
      <header><strong>tile background</strong><span>one tile at a time</span></header>

      <div className="modes">
        {tiles.map(t => (
          <button key={t.id} type="button" className={t.id === id ? 'on' : ''} onClick={() => setId(t.id)}>{t.id}</button>
        ))}
      </div>

      <div className="fields">
        <div className="modes">
          {MODES.map(m => (
            <button key={m} type="button" className={bg.mode === m ? 'on' : ''} onClick={() => set({ mode: m })}>{m}</button>
          ))}
        </div>
        {colour('c1', bg.mode === 'motif' ? 'base' : bg.mode === 'solid' ? 'colour' : 'from')}
        {(bg.mode === 'linear' || bg.mode === 'radial') && colour('c2', 'to')}
        {bg.mode === 'linear' && (
          <label>
            <span>angle</span>
            <input type="range" min="0" max="360" step="1" value={bg.angle} onChange={e => set({ angle: +e.target.value })} />
            <input type="number" value={bg.angle} onChange={e => set({ angle: +e.target.value })} />
          </label>
        )}
      </div>

      <footer>
        <button type="button" onClick={copy}>{copied ? 'copied' : 'copy values'}</button>
        <button type="button" onClick={() => onReset(id)}>reset</button>
      </footer>
    </aside>
  )
}

export default LookTuner

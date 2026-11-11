import { useState } from 'react'
import './Tuner.css'

const FIELDS = [
  ['x', -300, 800, 1], ['y', -400, 700, 1], ['w', 40, 1000, 1], ['rot', -45, 45, 0.5], ['z', 1, 9, 1],
]

/**
 * Dev-only panel for composing tiles by eye. Drag layers on the tile to move them;
 * fine-tune here. "Copy values" puts the tile's layers on the clipboard in the
 * shape tiles.js uses.
 */
function Tuner({ tile, selected, onSelect, onChange, onReset }) {
  const [copied, setCopied] = useState(false)
  const layer = tile.layers.find(l => l.id === selected)
  const set = patch => onChange(selected, patch)

  const copy = () => {
    const text = '    layers: [\n' + tile.layers.map(l => '      ' + JSON.stringify(l).replace(/"(\w+)":/g, '$1: ').replace(/,(?=\w)/g, ', ').replace(/"/g, "'")).join(',\n') + ',\n    ],'
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1400) })
  }

  return (
    <aside className="tuner" aria-label="Tile tuner">
      <header>
        <strong>{tile.label}</strong>
        <span>drag layers on the tile</span>
      </header>

      <div className="layers">
        {tile.layers.map(l => (
          <div key={l.id} className={`row${l.id === selected ? ' on' : ''}`}>
            <input type="checkbox" checked={l.on} onChange={e => onChange(l.id, { on: e.target.checked })} aria-label={`show ${l.id}`} />
            <button type="button" onClick={() => onSelect(l.id)}>{l.id}</button>
          </div>
        ))}
      </div>

      {layer && (
        <div className="fields">
          {FIELDS.map(([k, min, max, step]) => (
            <label key={k}>
              <span>{k}</span>
              <input type="range" min={min} max={max} step={step} value={layer[k]} onChange={e => set({ [k]: +e.target.value })} />
              <input type="number" step={step} value={layer[k]} onChange={e => set({ [k]: +e.target.value })} />
            </label>
          ))}
          {['x', 'y'].map(k => (
            <label key={k}>
              <span>hover {k}</span>
              <input type="range" min="-30" max="30" step="1" value={layer.lift[k]} onChange={e => set({ lift: { ...layer.lift, [k]: +e.target.value } })} />
              <input type="number" value={layer.lift[k]} onChange={e => set({ lift: { ...layer.lift, [k]: +e.target.value } })} />
            </label>
          ))}
        </div>
      )}

      <footer>
        <button type="button" onClick={copy}>{copied ? 'copied' : 'copy values'}</button>
        <button type="button" onClick={onReset}>reset</button>
      </footer>
    </aside>
  )
}

export default Tuner

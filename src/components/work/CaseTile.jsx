import './CaseTile.css'

/**
 * One case study tile: the Figma card with finished mockups layered on it.
 * Everything inside scales with the tile width (see --u in CaseTile.css).
 * `tuning` hands pointer events to the dev tuner so layers can be dragged.
 */
function CaseTile({ tile, href = '#', tuning, selected, onLayerPointerDown }) {
  return (
    <a className={`case-tile${tuning ? ' tuning' : ''}`} href={href} aria-label={tile.label}>
      <div className="stage">
        {tile.layers.filter(l => l.on).map(l => (
          <div
            key={l.id}
            className={`layer${selected === l.id ? ' selected' : ''}`}
            style={{ '--x': l.x, '--y': l.y, '--w': l.w, '--rot': l.rot, '--lx': l.lift.x, '--ly': l.lift.y, zIndex: l.z }}
            onPointerDown={onLayerPointerDown && (e => onLayerPointerDown(e, l.id))}
          >
            <img src={l.src} alt="" draggable="false" decoding="async" />
          </div>
        ))}
      </div>
    </a>
  )
}

export default CaseTile

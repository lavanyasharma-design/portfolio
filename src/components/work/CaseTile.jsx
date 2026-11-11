import './CaseTile.css'

/**
 * One case study tile: the Figma card with finished mockups layered on it.
 * Everything inside scales with the tile width (see --u in CaseTile.css).
 * `tuning` hands pointer events to the dev tuner so layers can be dragged.
 */
const fill = bg => bg.mode === 'linear' ? `linear-gradient(${bg.angle}deg, ${bg.c1}, ${bg.c2})`
  : bg.mode === 'radial' ? `radial-gradient(120% 100% at 50% 0%, ${bg.c1}, ${bg.c2})`
  : bg.c1

function CaseTile({ tile, look, bg, href = '#', tuning, selected, onLayerPointerDown }) {
  return (
    <a className={`case-tile${tuning ? ' tuning' : ''}${look.shadow.on ? ' shadow' : ''}`} href={href} aria-label={tile.label} style={{ '--tile-bg': fill(bg) }}>
      {/* not "stage": the window intro's global .stage rule would shift it up */}
      <div className={`tile-stage${bg.mode === 'motif' ? ' motif' : ''}`}>
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

import { useEffect, useRef } from 'react'
import { mountGarden } from './gardenScene'
import { playButterflySound } from '../../lib/sound/notes'

/**
 * The footer visual: a purple garden with the butterfly flying across it (see gardenScene.js).
 * Touch the butterfly (hover, tap or click) and it plays its wing flutter and darts away.
 */
function Garden() {
  const ref = useRef(null)
  useEffect(() => {
    const g = mountGarden(ref.current, { onTouch: playButterflySound })
    return () => g.destroy()
  }, [])
  return <canvas ref={ref} className="pf-garden" aria-hidden="true" />
}

export default Garden

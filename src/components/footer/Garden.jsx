import { useEffect, useRef } from 'react'
import { mountGarden } from './gardenScene'

/**
 * The footer visual: the pencil garden where the butterfly from the window intro ends up
 * (see gardenScene.js). Silent; on desktop the butterfly darts from the cursor, and the grass and flowers
 * bend and twitch to it (Lavanya, 2026-11-14).
 */
function Garden() {
  const ref = useRef(null)
  useEffect(() => {
    const g = mountGarden(ref.current)
    return () => g.destroy()
  }, [])
  return <canvas ref={ref} className="pf-garden" aria-hidden="true" />
}

export default Garden

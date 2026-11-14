import { useEffect, useRef, useState } from 'react'
import CaseTile from '../components/work/CaseTile'
import Tuner from '../components/work/Tuner'
import LookTuner from '../components/work/LookTuner'
import NavBar from '../components/nav/NavBar'
import PageFooter from '../components/footer/PageFooter'
import MotifField from '../components/motif/MotifField'
import { FX, applyFx, mountFxPanel } from '../components/work/tileFx'
import { TILES, LOOK, DEFAULT_BG, TILE_W } from '../components/work/tiles'
import './Work.css'

/**
 * When the nav bar steps aside for the footer.
 * Both hide while scrolling down near the footer and come back, in place, the moment you scroll up
 * (Lavanya, 2026-11-14). Where "near" starts:
 * - phones (Figma note beside "Work - full scroll"): once the page has scrolled 50px into the gap
 *   between the last case study and the footer, so the bottom bar never sits over the footer;
 * - desktop: once the footer comes into view.
 */
/**
 * The motif reveal, on test (Lavanya, 2026-11-14): the page stays plain, and only under a mouse
 * pointer in the empty space does the home page motif show, in its hover purple (MotifField draws
 * just that part). Desktop only; tiles, text, the garden and the nav switch it off (data-no-motif).
 * Set to false to drop it.
 */
const MOTIF_REVEAL = true
const FINE_POINTER = '(hover: hover) and (pointer: fine)'

const NAV_HIDE_AFTER = 50   // px into that gap
const PHONE = '(max-width: 600px)'

function useNavHidden(lineRef) {
  const [hidden, setHidden] = useState(false)
  useEffect(() => {
    const phone = matchMedia(PHONE)
    let raf = 0, lastY = scrollY, hid = false
    const check = () => {
      raf = 0
      const line = lineRef.current
      const dock = document.querySelector('.nav-dock')
      const foot = document.querySelector('.page-foot')
      // clamped, so iOS's bounce past the bottom doesn't read as scrolling up
      const y = Math.min(scrollY, document.documentElement.scrollHeight - innerHeight)
      const up = y < lastY - 1, down = y > lastY + 1
      if (up || down) lastY = y
      const near = !line || !dock || !foot ? false
        // phones: the line has risen above the band the bar sits on
        : phone.matches ? line.getBoundingClientRect().top <= innerHeight - dock.offsetHeight
        // desktop: the footer is in view
        : foot.getBoundingClientRect().top < innerHeight
      if (!near || up) hid = false
      else if (down) hid = true
      setHidden(hid)
    }
    const queue = () => { if (!raf) raf = requestAnimationFrame(check) }
    addEventListener('scroll', queue, { passive: true })
    addEventListener('resize', queue)
    phone.addEventListener('change', queue)
    check()
    return () => {
      cancelAnimationFrame(raf)
      removeEventListener('scroll', queue)
      removeEventListener('resize', queue)
      phone.removeEventListener('change', queue)
    }
  }, [lineRef])
  return hidden
}

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

/** The Work page: Figma "Work" (290:12780, desktop 1512) and "Work - full scroll" (346:9449, phone 402) */
function Work() {
  const hideLine = useRef(null)
  const navHidden = useNavHidden(hideLine)
  const [tiles, setTiles] = useState(TUNE ? () => load(KEY, TILES) : TILES)
  const [bgs, setBgs] = useState(BG_TUNE ? () => ({ ...BGS, ...load(BG_KEY, {}) }) : BGS)
  const [active, setActive] = useState({ tile: 'bolt', layer: 'bolt-1' })
  const [motif] = useState(() => MOTIF_REVEAL && matchMedia(FINE_POINTER).matches)

  // the tiles' hover look (tileFx.js); ?hover opens its panel
  useEffect(() => {
    applyFx()
    const panel = new URLSearchParams(location.search).has('hover') ? mountFxPanel() : null
    return () => panel?.remove()
  }, [])
  // hover on desktop; phones have no hover, so a tap gives the zoom and glow for a moment
  const press = (e) => {
    if (TUNE || matchMedia('(hover: hover)').matches) return
    const wrap = e.currentTarget
    wrap.classList.add('tapped')
    clearTimeout(wrap._tap)
    wrap._tap = setTimeout(() => wrap.classList.remove('tapped'), FX.tapHold)
  }

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
    <NavBar active="work" hidden={navHidden} />
    <main className="work-page">
      {motif && <MotifField />}
      <section className="work-section" aria-labelledby="work-title">
        <h1 id="work-title"><span data-no-motif>Work</span></h1>
        <div className="cases" style={lookVars(LOOK)} onClickCapture={TUNE ? e => e.preventDefault() : undefined}>
          {tiles.map(t => (
            <article className="case" key={t.id} data-no-motif>
              <div className="tile-fx" onClick={press}>
              <CaseTile
                tile={t}
                look={LOOK}
                bg={bgs[t.id] ?? DEFAULT_BG}
                tuning={TUNE}
                selected={TUNE && active.tile === t.id ? active.layer : null}
                onLayerPointerDown={TUNE ? drag(t.id) : undefined}
              />
              </div>
              <div className="case-copy">
                <h2>{t.title}</h2>
                <ul className="case-tags">
                  {t.tags.map(tag => <li key={tag}>{`{${tag}}`}</li>)}
                </ul>
              </div>
            </article>
          ))}
        </div>
        {/* the line the phone nav bar hides at: NAV_HIDE_AFTER below the last case study */}
        <div ref={hideLine} className="nav-hide-line" style={{ '--after': `${NAV_HIDE_AFTER}px` }} aria-hidden="true" />
      </section>
      <PageFooter />
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

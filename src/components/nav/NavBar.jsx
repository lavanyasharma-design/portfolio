import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { animate } from 'motion'
import { DUR, EASE } from '../../lib/motion'
import { applyNavLook, mountNavPanel } from './navLook'
import SectionLink from '../home/SectionLink'
import Butterfly from '../home/Butterfly'
import { navigate } from '../../router'
import { playButterflySound } from '../../lib/sound/notes'
import './NavBar.css'

/**
 * The floating navigation bar on every page but home. Figma: the Work page's own component
 * "navigation bar/desktop" (298:12907, instance 298:12910), and its phone version in
 * "Work - port view" (346:9412), which sits at the bottom of the screen on a page-coloured band.
 *
 * The butterfly goes home, and is the home page's butterfly: hover or tap and it twitches, glows
 * and plays its wing flutter. [work] [about] [play] are the home page's section links (same press
 * animation and sound), with the current page highlighted.
 * `hidden` slides it away (phones, near the footer: see Work.jsx).
 *
 * Moving between pages (hers, 2026-11-22: "smart animate", soft rather than a plain tap): the highlight
 * is one pill that remembers where it sat on the page you came from and glides sideways to the new
 * page's item, easing out and turning from that section's colour to this one's, while the bar's outline
 * fades over to the new section's colours. Reduced motion: it's simply there.
 */
const SLIDE = {
  duration: DUR.slow,            // s, the glide (the site's slow timing)
  ease: EASE,                    // the site's ease out
}

// the section the bar shows (or showed), and when it went away (null while it's still up), so the next
// page's bar can start there. The next page renders before this bar's cleanup runs, so it's kept
// while the bar is up, not written as it goes
let last = null

const HIGHLIGHT = { work: '--color-purple-highlight', about: '--color-teal-highlight', play: '--color-pink-highlight' }
const colourOf = (name) => getComputedStyle(document.documentElement).getPropertyValue(HIGHLIGHT[name]).trim()

function NavBar({ active, hidden = false }) {
  const bflyRef = useRef(null)
  const navRef = useRef(null)
  const pillRef = useRef(null)
  // where the glide starts: the page you came from, if you came from one a moment ago
  const from = useRef(
    last && last.section !== active && (last.at === null || performance.now() - last.at < 600)
      && !matchMedia('(prefers-reduced-motion: reduce)').matches ? last.section : null,
  )
  // the outline shows the old section for a frame, then fades to this one (NavBar.css transition)
  const [section, setSection] = useState(from.current ?? active)

  // the outline and float (navLook.js); ?nav opens its panel
  useEffect(() => {
    applyNavLook()
    const panel = new URLSearchParams(location.search).has('nav') ? mountNavPanel() : null
    return () => panel?.remove()
  }, [])

  useLayoutEffect(() => {
    const nav = navRef.current, pill = pillRef.current
    const at = (name) => {
      const el = name && nav.querySelector(`.sec.${name}`)
      return el ? { x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight } : null
    }
    const place = (p, name) => {
      pill.style.transform = `translate(${p.x}px, ${p.y}px)`
      pill.style.width = `${p.w}px`; pill.style.height = `${p.h}px`
      pill.style.background = colourOf(name)
    }
    const to = at(active)
    pill.style.opacity = to ? '1' : '0'
    if (!to) return undefined
    let glide = null
    place(to, active)
    const start = at(from.current)
    if (start) {
      // only what the compositor moves on its own (transform, opacity), so the glide stays smooth while
      // the new page is still setting itself up: the pill slides and stretches from the old item to the
      // new one, and the old section's colour, on a layer inside it, fades away
      const old = pill.firstElementChild
      old.style.background = colourOf(from.current)
      glide = Promise.all([
        animate(pill, {
          transform: [`translate(${start.x}px, ${start.y}px) scaleX(${start.w / to.w})`, `translate(${to.x}px, ${to.y}px) scaleX(1)`],
        }, SLIDE),
        animate(old, { opacity: [1, 0] }, SLIDE),
      ])
      const raf = requestAnimationFrame(() => setSection(active))
      glide.then(() => { glide = null })
      return () => { cancelAnimationFrame(raf); old.getAnimations().concat(pill.getAnimations()).forEach(a => a.cancel()); old.style.opacity = '0' }
    }
    setSection(active)
    // the items can change size (fonts arriving, a phone turning): follow them
    const ro = new ResizeObserver(() => { const p = at(active); if (p) place(p, active) })
    ro.observe(nav)
    return () => ro.disconnect()
  }, [active])

  // remember this section while the bar is up, and when it went (a page without the bar, home, in between: no glide)
  useLayoutEffect(() => {
    const mine = { section: active, at: null }
    last = mine
    return () => { mine.at = performance.now() }
  }, [active])

  const home = (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button > 0) return
    e.preventDefault()
    navigate('/')
  }
  return (
    <div className={`nav-dock${hidden ? ' hidden' : ''}`}>
      <nav ref={navRef} className="navbar" aria-label="Sections" data-section={section} data-no-motif>
        <span ref={pillRef} className="nav-pill" aria-hidden="true"><span className="nav-pill-from" /></span>
        <a className="nav-logo" href="/" onClick={home} aria-label="Home">
          <span className="nav-logo-turn">
            <Butterfly bflyRef={bflyRef} onTwitch={playButterflySound} />
          </span>
        </a>
        <SectionLink name="work" to="/work" current={active === 'work'} />
        <SectionLink name="about" to="/about" current={active === 'about'} />
        <SectionLink name="play" current={active === 'play'} />
      </nav>
    </div>
  )
}

export default NavBar

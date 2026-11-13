import { useRef } from 'react'
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
 */
function NavBar({ active, hidden = false }) {
  const bflyRef = useRef(null)
  const home = (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button > 0) return
    e.preventDefault()
    navigate('/')
  }
  return (
    <div className={`nav-dock${hidden ? ' hidden' : ''}`}>
      <nav className="navbar" aria-label="Sections">
        <a className="nav-logo" href="/" onClick={home} aria-label="Home">
          <span className="nav-logo-turn">
            <Butterfly bflyRef={bflyRef} onTwitch={playButterflySound} />
          </span>
        </a>
        <SectionLink name="work" to="/work" current={active === 'work'} />
        <SectionLink name="about" current={active === 'about'} />
        <SectionLink name="play" current={active === 'play'} />
      </nav>
    </div>
  )
}

export default NavBar

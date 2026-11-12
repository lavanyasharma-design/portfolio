import { useEffect, useRef } from 'react'
import './Hero.css'
import MotifField from '../motif/MotifField'
import Butterfly from './Butterfly'
import SectionLink from './SectionLink'
import { Volume2, VolumeX } from 'lucide-react'
import { useNotesPlayed, useMuted, toggleMute, pressSound, playButterflySound } from '../../lib/sound/notes'
import { mountSoundPanel } from '../../lib/sound/soundPanel'
import { SOON } from '../../site'

const Dot = ({ className }) => <img className={className} src="/assets/dot.svg" alt="" />
const Bfly = Butterfly

// sound on / off, beside the count of notes it drives. Starts on; muting lasts for the visit
function SoundSwitch() {
  const muted = useMuted()
  const Icon = muted ? VolumeX : Volume2
  return (
    <button type="button" className="sound-switch" onClick={toggleMute}
      aria-pressed={muted} aria-label={muted ? 'Turn sound on' : 'Turn sound off'} title={muted ? 'Sound off' : 'Sound on'}>
      <Icon aria-hidden="true" strokeWidth={1.75} />
    </button>
  )
}

/**
 * The single-screen home page from Figma: desktop "home page" (90:13) and "home page - mobile"
 * (21:2). Stays hidden until `revealed`, then fades in with each block rising in turn.
 * heroRef / bflyRef are the flight target for WindowIntro.
 * On lavanyaaa.com (or ?soon) it shows the "coming soon" face instead: one line, butterfly beside it.
 */
function Hero({ revealed, heroRef, bflyRef }) {
  const notes = useNotesPlayed()
  const siteRef = useRef(null)
  useEffect(() => {
    const q = new URLSearchParams(location.search)
    if (SOON) return
    const panels = []
    if (q.has('spacing')) panels.push(mountSpacingPanel(siteRef.current))
    if (q.has('sound')) panels.push(mountSoundPanel())
    return () => panels.forEach((p) => p.remove())
  }, [])
  return (
    <main ref={siteRef} className={`site${revealed ? ' in' : ''}${SOON ? ' soon' : ''}`}>
      <MotifField />
      {!SOON && <header className="top serif rise">
        <a href="mailto:hi@lavanyaaa.com" data-no-motif="" {...pressSound('email')}>hi@lavanyaaa.com</a>
        <nav className="social" aria-label="Social" data-no-motif="">
          <a href="https://www.linkedin.com/in/lavanyaaasharmaaa/" target="_blank" rel="noopener noreferrer" {...pressSound('linkedin')}>LinkedIn</a>
          <a href="https://x.com/lavanyaaasharma" target="_blank" rel="noopener noreferrer" {...pressSound('x')}>X</a>
        </nav>
      </header>}

      <div className="center">
        {SOON ? (
          <section ref={heroRef} className="hero-soon">
            <h1 className="serif rise" style={{ animationDelay: '.1s' }}>Coming Soon</h1>
            <Bfly bflyRef={bflyRef} />
          </section>
        ) : <>
        <section ref={heroRef} className="hero">
          <p className="hi sans rise" data-no-motif="" style={{ animationDelay: '.1s' }}>Hello, I’m Lavanya</p>
          <h1 className="serif rise" style={{ animationDelay: '.2s' }}><span className="l1" data-no-motif="">Product</span> <span className="l2" data-no-motif="">Designer</span></h1>
          <Bfly bflyRef={bflyRef} onTwitch={playButterflySound} />
          <p className="tag sans rise" data-no-motif="" style={{ animationDelay: '.3s' }}>systems thinker, backend literate &amp; stubborn about clarity</p>
        </section>
        <nav className="links sans rise" style={{ animationDelay: '.45s' }} aria-label="Sections">
          <SectionLink name="work" to="/work" />
          <SectionLink name="about" />
          <SectionLink name="play" />
        </nav>
        </>}
      </div>

      {!SOON && <footer className="foot serif rise" style={{ animationDelay: '.55s' }}>
        {/* the row hugs its text, so the motif stays off over the words and the gaps between them only */}
        <div className="foot-row" data-no-motif="">
          <span>Chandigarh → Bengaluru</span><Dot />
          <span className="ver">v1.0.0</span><Dot className="ver" />
          <span className="notes">{notes} {notes === 1 ? 'note' : 'notes'} played<SoundSwitch /></span><Dot />
          <span>Colophon</span>
        </div>
      </footer>}
    </main>
  )
}

/* ?spacing: on a phone, slide the gap above the top bar and below the footer (design px) */
function mountSpacingPanel(site) {
  const css = getComputedStyle(site)
  const read = (k, fallback) => parseFloat(css.getPropertyValue(k)) || fallback
  const vals = { '--top-pad': read('--top-pad', 20), '--foot-pad': read('--foot-pad', 20) }
  const el = document.createElement('div')
  el.className = 'tune-panel'
  el.style.cssText = 'top:56px;left:12px;right:12px;width:auto'
  const slider = (k, label) =>
    `<label><span>${label}</span><input type="range" data-k="${k}" min="0" max="60" step="1" value="${vals[k]}"><output>${vals[k]}px</output></label>`
  el.innerHTML = `<b>phone spacing</b>${slider('--top-pad', 'top gap')}${slider('--foot-pad', 'bottom gap')}`
  el.addEventListener('input', (e) => {
    const k = e.target.dataset.k
    site.style.setProperty(k, e.target.value)
    e.target.nextElementSibling.textContent = e.target.value + 'px'
  })
  // the page swallows touches for the motif; let the panel's sliders have theirs
  el.style.touchAction = 'auto'
  document.body.append(el)
  return el
}

export default Hero

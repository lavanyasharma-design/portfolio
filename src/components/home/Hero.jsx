import { useEffect, useRef } from 'react'
import './Hero.css'
import MotifField from '../motif/MotifField'
import Butterfly from './Butterfly'
import SectionLink from './SectionLink'
import { useNotesPlayed } from '../../lib/sound/notes'
import { SOUND } from '../../lib/sound/config'
import { SOON } from '../../site'

const Dot = () => <img src="/assets/dot.svg" alt="" />
const Bfly = Butterfly

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
        <a href="mailto:hi@lavanyaaa.com">hi@lavanyaaa.com</a>
        <nav className="social" aria-label="Social"><a href="#">LinkedIn</a><a href="#">X</a></nav>
      </header>}

      <div className="center">
        {SOON ? (
          <section ref={heroRef} className="hero-soon">
            <h1 className="serif rise" style={{ animationDelay: '.1s' }}>Coming Soon</h1>
            <Bfly bflyRef={bflyRef} />
          </section>
        ) : <>
        <section ref={heroRef} className="hero">
          <p className="hi sans rise" style={{ animationDelay: '.1s' }}>Hello, I’m Lavanya</p>
          <h1 className="serif rise" style={{ animationDelay: '.2s' }}><span className="l1">Product</span> <span className="l2">Designer</span></h1>
          <Bfly bflyRef={bflyRef} />
          <p className="tag sans rise" style={{ animationDelay: '.3s' }}>systems thinker, backend literate &amp; stubborn about clarity</p>
        </section>
        <nav className="links sans rise" style={{ animationDelay: '.45s' }} aria-label="Sections">
          <SectionLink name="work" to="/work" />
          <SectionLink name="about" />
          <SectionLink name="play" />
        </nav>
        </>}
      </div>

      {!SOON && <footer className="foot serif rise" style={{ animationDelay: '.55s' }}>
        <span>Chandigarh → Bengaluru</span><Dot />
        <span>v1.0.0</span><Dot />
        <span>{notes} notes played</span><Dot />
        <span>Colophon</span>
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

/* ?sound: the gap between a motif's two notes and how loud the second one is. Press a section
   link to hear it; "copy values" gives the numbers for config.js */
function mountSoundPanel() {
  const el = document.createElement('div')
  el.className = 'tune-panel'
  el.style.cssText = 'top:auto;bottom:70px;left:12px;right:12px;width:auto;max-width:360px'
  const p = SOUND.pair
  el.innerHTML = `<b>sound</b>
    <label><span>note gap</span><input type="range" data-k="gapMs" min="0" max="400" step="10" value="${p.gapMs}"><output>${p.gapMs}ms</output></label>
    <label><span>2nd note</span><input type="range" data-k="secondLevel" min="0" max="1" step="0.05" value="${p.secondLevel}"><output>${p.secondLevel}</output></label>
    <button type="button" class="copy">copy values</button>`
  el.addEventListener('input', (e) => {
    const k = e.target.dataset.k
    p[k] = +e.target.value
    e.target.nextElementSibling.textContent = e.target.value + (k === 'gapMs' ? 'ms' : '')
  })
  el.querySelector('.copy').addEventListener('click', (e) => {
    navigator.clipboard?.writeText(`pair: { gapMs: ${p.gapMs}, secondLevel: ${p.secondLevel} }`)
    e.target.textContent = 'copied'
  })
  document.body.append(el)
  return el
}

export default Hero

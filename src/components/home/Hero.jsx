import './Hero.css'
import MotifField from '../motif/MotifField'
import Butterfly from './Butterfly'
import { SOON } from '../../site'

const Dot = () => <img src="/assets/dot.svg" alt="" />
const Bfly = Butterfly

/**
 * The single-screen home page from Figma. Stays hidden until `revealed`, then fades in
 * with each block rising in turn. heroRef / bflyRef are the flight target for WindowIntro.
 * On lavanyaaa.com (or ?soon) it shows the "coming soon" face instead: one line, butterfly beside it.
 */
function Hero({ revealed, heroRef, bflyRef }) {
  return (
    <main className={`site${revealed ? ' in' : ''}${SOON ? ' soon' : ''}`}>
      <MotifField />
      {!SOON && <header className="top serif rise">
        <a href="mailto:hi@lavanyaaa.com">hi@lavanyaaa.com</a>
        <nav className="social" aria-label="Social"><a href="#">Linkedin</a><a href="#">X</a></nav>
      </header>}

      <div className="center">
        {SOON ? (
          <section ref={heroRef} className="hero-soon">
            <h1 className="serif rise" style={{ animationDelay: '.1s' }}>Coming Soon</h1>
            <Bfly bflyRef={bflyRef} />
          </section>
        ) : <>
        <section ref={heroRef} className="hero">
          <p className="hi sans rise" style={{ animationDelay: '.1s' }}>Hi, I’m Lavanya</p>
          <h1 className="serif rise" style={{ animationDelay: '.2s' }}><span className="l1">Product</span> <span className="l2">Designer</span></h1>
          <Bfly bflyRef={bflyRef} />
          <p className="tag sans rise" style={{ animationDelay: '.3s' }}>systems thinker, backend literate &amp; stubborn about clarity</p>
        </section>
        <nav className="links rise" style={{ animationDelay: '.45s' }} aria-label="Sections">
          <a className="work sans" href="#work">[work]</a>
          <a className="about sans" href="#about">[about]</a>
          <a className="play sans" href="#play">[play]</a>
        </nav>
        </>}
      </div>

      {!SOON && <footer className="foot serif rise" style={{ animationDelay: '.55s' }}>
        <span>chandigarh → bengaluru</span><Dot />
        <span>v1.0.0</span><Dot />
        <span>0 notes played</span><Dot />
        <span>colophon</span>
      </footer>}
    </main>
  )
}

export default Hero

import { useEffect, useRef } from 'react'
import { ArrowUpRight } from 'lucide-react'
import NavBar from '../components/nav/NavBar'
import PageFooter from '../components/footer/PageFooter'
import { mountCaseMotion } from '../components/case/caseMotion'
import { mountPhotoCaptions, mountCaptionPanel } from '../components/about/photoCaption'
import { applyLayout, mountLayoutPanel } from '../components/about/aboutLayout'
import Tape from '../components/about/Tape'
import { INTRO, PARAGRAPHS, EXPERIENCE, RESUME_URL, COLLAGES } from '../components/about/aboutContent'
import { useNavHidden } from '../lib/useNavHidden'
import './About.css'

/**
 * The About page: Figma "About" (Portfolio-Design, 414:7014, desktop 1512), her draft layout with notes,
 * reworked after her first look (2026-11-21): her photo smaller and zoomed in, the intro beside it at 36,
 * the two as wide as the words; the Experience box beside them from the top; paragraphs 16 apart; the
 * photos upright at their own shape, four to a row (aboutContent.js), each with its caption beside the pointer (photoCaption.js,
 * after Rachel Chen's about page). `?about` tunes the photo and gaps, `?caption` the caption.
 * Phones (her note): her photo and the intro, the words, the Experience box, the photos.
 */

const NAV_HIDE_AFTER = 50   // px below the last photos, where the phone nav bar steps aside (as on Work)

// one photo, upright at its own shape, its number under it
function Photo({ src, caption, n, ratio, order, step }) {
  return (
    <li className="ab-print" data-step={step || undefined} style={{ '--ratio': ratio, '--order': order }}>
      <figure className="ab-photo" tabIndex={0} data-caption={caption}>
        <div className="ab-frame">
          <img src={src} alt={caption} loading="lazy" decoding="async" />
          <span className="ab-chip" aria-hidden="true">{caption}</span>
        </div>
        <figcaption className="ab-num" aria-hidden="true">{String(n).padStart(2, '0')}</figcaption>
      </figure>
    </li>
  )
}

// a row of photos, each {label} over its own: four to a row on desktop (a label spans its photos' columns),
// two to a row on phones (flex order: label of group g at g*10, its photos after it)
function Collage({ labels, photos, from }) {
  const seen = {}
  const span = 4 / labels.length
  return (
    <ul className="ab-collage" data-rise aria-label={labels.join(', ')}>
      {labels.map((text, g) => (
        <li key={text} className="ab-collage-label" style={{ '--order': g * 10, gridColumn: `${g * span + 1} / span ${span}` }}>
          {`{${text}}`}
        </li>
      ))}
      {photos.map((p, i) => {
        const g = p.group
        seen[g] = (seen[g] ?? 0) + 1
        return <Photo key={p.src} {...p} n={from + i} order={g * 10 + seen[g]} step={seen[g] % 2 === 0} />
      })}
    </ul>
  )
}

// numbered through the whole gallery, 01 to 12
let count = 1
const GALLERY = COLLAGES.map((c) => { const from = count; count += c.photos.length; return { ...c, from } })

function About() {
  const page = useRef(null)
  const gallery = useRef(null)
  const hideLine = useRef(null)
  const navHidden = useNavHidden(hideLine)

  useEffect(() => {
    applyLayout(page.current)
    const stopMotion = mountCaseMotion(page.current)
    const stopCaptions = mountPhotoCaptions(gallery.current)
    const q = new URLSearchParams(location.search)
    const panels = [q.has('caption') && mountCaptionPanel(), q.has('about') && mountLayoutPanel(page.current)]

    // the Experience box starts level with the intro's top (hers), wherever the intro lands beside her
    // photo. offsetTop, not the bounding box, so the rise-in's movement doesn't throw it
    const top = page.current.querySelector('.ab-top')
    const intro = page.current.querySelector('.ab-head h1')
    const sync = () => top.style.setProperty('--box-top', `${intro.offsetTop}px`)
    const ro = new ResizeObserver(sync)
    ro.observe(top); ro.observe(intro); ro.observe(intro.parentElement)
    sync()

    return () => { stopMotion(); stopCaptions(); ro.disconnect(); panels.forEach(p => p && p.remove()) }
  }, [])

  return (
    <>
    <NavBar active="about" hidden={navHidden} />
    <main className="about-page" ref={page}>
      <div className="ab-wrap">

        <div className="ab-top">
          <div className="ab-left">
            {/* her photo (a square centre crop of "my photo.jpg", 800 square) and the intro beside it */}
            <header className="ab-head" data-rise>
              {/* a print stuck onto the page: white edge, tilted right, teal tape on its top left corner (hers) */}
              <div className="ab-me-print">
                <div className="ab-me"><img src="/about/me.webp" alt="Lavanya Sharma" /></div>
                <Tape className="ab-tape" />
              </div>
              <h1>{INTRO}</h1>
            </header>
            <div className="ab-words" data-rise>
              {PARAGRAPHS.map((p, i) => <p key={i} className={i === 1 ? 'ab-in' : undefined}>{p}</p>)}
            </div>
          </div>

          <aside className="ab-resume-box" aria-labelledby="ab-exp" data-rise>
            <h2 id="ab-exp">Experience</h2>
            <ol className="ab-jobs">
              {EXPERIENCE.map(j => (
                <li key={j.role + j.dates}>
                  <h3>{j.role}{j.at && <> @ {j.at}</>}</h3>
                  <p>{j.dates}</p>
                </li>
              ))}
            </ol>
            {/* her Google Drive file, in a new tab (RESUME_URL in aboutContent.js) */}
            <a className="ab-resume" href={RESUME_URL || undefined} target="_blank" rel="noreferrer">
              my resume<ArrowUpRight className="ab-resume-icon" aria-hidden="true" strokeWidth={1.75} />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </aside>
        </div>

        <section className="ab-gallery" ref={gallery} aria-labelledby="ab-throwback">
          <h2 id="ab-throwback" className="ab-label" data-rise>{'{a visual throwback}'}</h2>
          {GALLERY.map(c => <Collage key={c.id} {...c} />)}
          <div ref={hideLine} className="nav-hide-line" style={{ '--after': `${NAV_HIDE_AFTER}px` }} aria-hidden="true" />
        </section>

      </div>
      <PageFooter />
    </main>
    </>
  )
}

export default About

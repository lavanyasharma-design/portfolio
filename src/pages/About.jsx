import { useEffect, useRef } from 'react'
import { ArrowUpRight } from 'lucide-react'
import '@fontsource-variable/dm-sans/opsz-italic.css'
import NavBar from '../components/nav/NavBar'
import PageFooter from '../components/footer/PageFooter'
import { mountCaseMotion } from '../components/case/caseMotion'
import { mountPhotoCaptions, mountCaptionPanel } from '../components/about/photoCaption'
import { applyLayout, mountLayoutPanel } from '../components/about/aboutLayout'
import { mountTextFlow } from '../components/about/textFlow'
import { WobblyFrame, Corner } from '../components/about/Wobble'
import { HELLO, INTRO, PARAGRAPHS, plain, EXPERIENCE, RESUME_URL, GALLERY_TITLE, GALLERY } from '../components/about/aboutContent'
import { useNavHidden } from '../lib/useNavHidden'
import './About.css'

/**
 * The About page, from her rough layout (Figma Portfolio-Design 419:14, 2026-11-22): her photo in two
 * viewfinder brackets with "Hi!" and the intro beside it; the words flowing round the photo and the
 * Experience box, opening round the pointer (textFlow.js, with Pretext); the gallery in the frame sizes she
 * drew, each photo in a hand-drawn teal frame (Wobble.jsx), its caption beside the pointer (photoCaption.js).
 * `?about` tunes the photo, gaps, the pointer's space and each photo's fit; `?caption` the caption.
 * Phones (her note): her photo and the intro, the words, the Experience box, the photos two to a row.
 */

const NAV_HIDE_AFTER = 50   // px below the last photos, where the phone nav bar steps aside (as on Work)
const DESIGN_W = 1252       // her column, the frame sizes in aboutContent.js are on its scale

/** a run list as spans: plain words, wavy-underlined, or italic */
function Runs({ runs }) {
  return runs.map((r, i) => (typeof r === 'string' ? r : <span key={i} className={[r.u && 'u', r.i && 'i'].filter(Boolean).join(' ')}>{r.t}</span>))
}

let seed = 1
function Photo({ p, groupW }) {
  return (
    <li className="ab-print" style={{ width: `${(p.w / groupW) * 100}%` }}>
      <figure className="ab-photo" tabIndex={0} data-caption={p.caption}>
        <div className="ab-frame" data-id={p.id} style={{ aspectRatio: `${p.w} / ${p.h}` }}>
          <div className="ab-pic"><img src={p.src} alt={p.caption} loading="lazy" decoding="async" /></div>
          <WobblyFrame w={p.w} h={p.h} seed={p.seed} />
          <span className="ab-chip" aria-hidden="true">{p.caption}</span>
        </div>
      </figure>
    </li>
  )
}

// each row's groups as shares of her column; a group's photos as shares of the group
const ROWS = GALLERY.map((row) => ({
  ...row,
  groups: row.groups.map((g) => {
    const w = g.photos.reduce((a, p) => a + p.w, 0) + g.gap * (g.photos.length - 1)
    return { ...g, w, photos: g.photos.map(p => ({ ...p, seed: seed++ * 7 })) }
  }),
}))

function About() {
  const page = useRef(null)
  const flow = useRef(null)
  const box = useRef(null)
  const gallery = useRef(null)
  const hideLine = useRef(null)
  const navHidden = useNavHidden(hideLine)

  useEffect(() => {
    applyLayout(page.current)
    const stopMotion = mountCaseMotion(page.current)
    const stopCaptions = mountPhotoCaptions(gallery.current)
    const stopFlow = mountTextFlow(flow.current, box.current, PARAGRAPHS)
    const q = new URLSearchParams(location.search)
    const panels = [q.has('caption') && mountCaptionPanel(), q.has('about') && mountLayoutPanel(page.current, stopFlow.relayout)]
    return () => { stopMotion(); stopCaptions(); stopFlow(); panels.forEach(p => p && p.remove()) }
  }, [])

  return (
    <>
    <NavBar active="about" hidden={navHidden} />
    <main className="about-page" ref={page}>
      <div className="ab-wrap">

        <div className="ab-top">
          {/* the words flow round her photo and the box (textFlow.js); until the fonts are in, and for screen
              readers, the paragraphs below are the real text */}
          <div className="ab-flow" ref={flow} data-rise>
            <div className="ab-me-group">
              <div className="ab-me"><img src="/about/me.webp" alt="Lavanya Sharma" /></div>
              <Corner at="tr" seed={3} />
              <Corner at="bl" seed={5} />
            </div>
            <h1 className="ab-intro">{HELLO}<br /><Runs runs={INTRO} /></h1>
            <div className="ab-paras">
              {PARAGRAPHS.map((runs, i) => <p key={i} data-text={plain(runs)}><Runs runs={runs} /></p>)}
            </div>
            <div className="ab-lines" aria-hidden="true" />
          </div>

          <aside className="ab-resume-box" ref={box} aria-labelledby="ab-exp">
            <Corner at="tl" seed={11} /><Corner at="tr" seed={13} /><Corner at="bl" seed={17} /><Corner at="br" seed={19} />
            <h2 id="ab-exp">Experience</h2>
            <ol className="ab-jobs">
              {EXPERIENCE.map(j => (
                <li key={j.role + j.dates}>
                  <h3>{j.role}{j.at && <> @{j.at}</>}</h3>
                  <p>{j.dates}</p>
                </li>
              ))}
            </ol>
            {/* her Google Drive file, in a new tab (RESUME_URL in aboutContent.js) */}
            <a className="ab-resume" href={RESUME_URL || undefined} target="_blank" rel="noreferrer">
              my resume<ArrowUpRight className="ab-resume-icon" aria-hidden="true" strokeWidth={1.5} />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </aside>
        </div>

        <section className="ab-gallery" ref={gallery} aria-labelledby="ab-throwback">
          <h2 id="ab-throwback" className="ab-label" data-rise>{GALLERY_TITLE}</h2>
          {ROWS.map(row => (
            <div key={row.id} className="ab-row" data-rise style={{ '--row-gap': `${((row.rowGap ?? 0) / DESIGN_W) * 100}%` }}>
              {row.groups.map(g => (
                <div key={g.label} className="ab-group" style={{ '--group-w': `${(g.w / DESIGN_W) * 100}%` }}>
                  <h3 className="ab-group-label">{g.label}</h3>
                  <ul className="ab-photos" style={{ '--gap': `${(g.gap / g.w) * 100}%` }}>
                    {g.photos.map(p => <Photo key={p.id} p={p} groupW={g.w} />)}
                  </ul>
                </div>
              ))}
            </div>
          ))}
          <div ref={hideLine} className="nav-hide-line" style={{ '--after': `${NAV_HIDE_AFTER}px` }} aria-hidden="true" />
        </section>

      </div>
      <PageFooter />
    </main>
    </>
  )
}

export default About

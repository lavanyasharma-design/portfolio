/**
 * The building blocks of a case study page. Each page (src/pages/cases/) composes these with its
 * own copy, so the next case study reuses the same rhythm.
 * Type follows the Figma text styles (Portfolio-Design): see CaseStudy.css for which style each uses.
 *
 * data-rise: the block rises in when it reaches the screen (caseMotion.js).
 * data-parallax: the block drifts against the scroll inside its panel (caseMotion.js, ?parallax).
 */

import { useEffect, useState } from 'react'
import { igProps } from './infographic'

const PHONE = '(max-width:600px)'
/** true at phone width (600px and below, the site's phone breakpoint), following resizes */
function usePhone() {
  const [phone, setPhone] = useState(() => typeof matchMedia !== 'undefined' && matchMedia(PHONE).matches)
  useEffect(() => {
    const m = matchMedia(PHONE)
    const on = () => setPhone(m.matches)
    m.addEventListener('change', on)
    return () => m.removeEventListener('change', on)
  }, [])
  return phone
}

// an infographic element: tagged with its colour slot (infographic.js) so ?infographic can recolour it
const ig = slot => (slot ? igProps(slot) : {})

/**
 * Words still to be written or checked by Lavanya: highlighted while DRAFT is on, with the note
 * shown on hover. Turn DRAFT off (CaseStudy.css: .cs-draft) once the copy is final.
 */
export function Draft({ children, note }) {
  return <mark className="cs-draft" title={note}>{children}</mark>
}

/**
 * A section of the story: a small {label}, a heading, then its blocks. `id` feeds the side index.
 * `statement` sets the heading as a Statement (large, purple) rather than a plain heading.
 */
export function Section({ id, label, title, statement = false, children }) {
  return (
    <section id={id} className="cs-section" aria-labelledby={title ? `${id}-title` : undefined}>
      {(label || title) && (
        <header className="cs-head" data-rise>
          {label && <p className="cs-label">{`{${label}}`}</p>}
          {title && <h2 id={`${id}-title`} className={statement ? 'cs-statement' : undefined}>{title}</h2>}
        </header>
      )}
      {children}
    </section>
  )
}

/** Body copy: one or more short paragraphs. */
export function Copy({ children }) {
  return <div className="cs-copy" data-rise>{children}</div>
}

/** A line that carries the story on its own, set large in purple. */
export function Statement({ children, as: Tag = 'p' }) {
  return <Tag className="cs-statement" data-rise>{children}</Tag>
}

/**
 * A prototype clip, screen or picture in the case study's panel. With `src` it plays (muted, looping,
 * only while on screen); without, a labelled placeholder holds its place.
 * kind: 'phone' (a phone clip in a single 4:5 panel; its caption sits beside it, as Mavis Lo's), 'wide' (a 2:1
 * picture), 'square', 'bare' (just the phone, no panel: the edge-case screens).
 */
export function Media({ kind = 'phone', src: wideSrc, srcPhone, poster: widePoster, posterPhone, label, caption, parallax = true }) {
  // phones get the tall (4:5) recording when there is one: the 2:1 one leaves the phone tiny at 362 wide
  const phone = usePhone()
  const src = phone && srcPhone ? srcPhone : wideSrc
  const poster = phone && posterPhone ? posterPhone : widePoster
  const isVideo = src && /\.(mp4|webm)$/i.test(src)
  const inner = !src ? <Placeholder kind={kind} label={label} />
    : isVideo ? <video className={`cs-clip ${kind}`} src={src} poster={poster} muted loop playsInline preload="none" data-clip aria-label={label} />
    : <img className={`cs-clip ${kind}`} src={src} alt={label ?? ''} decoding="async" loading="lazy" />
  return (
    <figure className={`cs-media ${kind}${kind === 'phone' && caption ? ' beside' : ''}`} data-rise>
      <div className="cs-panel">
        <div className="cs-panel-in" data-parallax={parallax ? '' : undefined}>{inner}</div>
      </div>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  )
}

function Placeholder({ kind, label }) {
  return (
    <div className={`cs-ph ${kind}`} role="img" aria-label={`Placeholder: ${label}`}>
      <span className="cs-ph-label">{label}</span>
      <span className="cs-ph-note">placeholder</span>
    </div>
  )
}

/** The case study's details: role, industry and so on, in one row. */
export function Details({ items }) {
  return (
    <dl className="cs-details" data-rise>
      {items.map(([term, value]) => (
        <div key={term}><dt>{term}</dt><dd>{value}</dd></div>
      ))}
    </dl>
  )
}

/**
 * Cards side by side: { title, text, icon, ig } (ig: a colour slot, see infographic.js).
 * `numbered` puts 01, 02... at the top; with no icon and no number the card starts at its title.
 */
export function Cards({ items, numbered = true }) {
  return (
    <ol className="cs-cards" data-rise>
      {items.map(({ title, text, icon: Icon, ig: slot }, i) => (
        <li key={title} {...ig(slot)}>
          {(Icon || numbered) && (
            <span className="cs-card-top">
              {Icon && <span className="cs-icon-badge"><Icon className="cs-icon" aria-hidden="true" strokeWidth={1.5} /></span>}
              {numbered && <span className="cs-num">{String(i + 1).padStart(2, '0')}</span>}
            </span>
          )}
          <h3>{title}</h3>
          <p>{text}</p>
        </li>
      ))}
    </ol>
  )
}

/** What the research kept saying, set as callouts (not quotes: these are synthesised). */
export function Insights({ label, items }) {
  return (
    <div className="cs-insights" data-rise>
      {label && <p className="cs-label">{label}</p>}
      {items.map(({ text, source, ig: slot }) => (
        <figure key={source + text.slice(0, 12)} className="cs-insight" {...ig(slot)}>
          <blockquote>{text}</blockquote>
          <figcaption>{source}</figcaption>
        </figure>
      ))}
    </div>
  )
}

/** Two contexts set against each other: { label, title, points[], ig } twice. */
export function Compare({ left, right }) {
  const side = (s, cls) => (
    <div className={`cs-side ${cls}`} {...ig(s.ig)}>
      <p className="cs-label">{s.label}</p>
      <h3>{s.title}</h3>
      <ul>{s.points.map(p => <li key={p}>{p}</li>)}</ul>
    </div>
  )
  return <div className="cs-compare" data-rise>{side(left, 'left')}{side(right, 'right')}</div>
}

/** A feature: its clip, then a title and one line beside it (Mavis Lo's pattern). */
export function Feature({ title, children, media }) {
  return (
    <article className="cs-feature">
      <Media kind="phone" {...media} />
      <div className="cs-feature-copy" data-rise>
        <h3>{title}</h3>
        <p>{children}</p>
      </div>
    </article>
  )
}

/**
 * A design decision, numbered and set apart: the question, what was decided, the main clip, and the
 * edge cases that go with it.
 */
export function Decision({ n, question, answer, children, media, edges }) {
  return (
    <article className="cs-decision">
      <header className="cs-decision-head" data-rise>
        <h3><span className="cs-decision-n">{String(n).padStart(2, '0')}</span> {question}</h3>
        {!media && answer && <p className="cs-decision-answer">{answer}</p>}
        {!media && children}
      </header>
      {/* with a clip: the clip in a single panel, the answer beside it (Mavis Lo's pattern, hers 2026-11-19) */}
      {media && (
        <div className="cs-decision-row">
          <Media {...media} />
          <div className="cs-decision-side" data-rise>
            {answer && <p className="cs-decision-answer">{answer}</p>}
            {children}
          </div>
        </div>
      )}
      {edges && (
        <div className="cs-edges">
          {edges.map(e => (
            <div key={e.media} className="cs-edge">
              <Media kind={e.bare ? 'bare' : 'square'} label={e.media} src={e.src} poster={e.poster} parallax={false} />
              {/* an edge with no title is a second screen only (the terrain map view) */}
              {e.title && (
                <div data-rise>
                  <p className="cs-label">{'{edge case}'}</p>
                  <h4>{e.title}</h4>
                  {e.text && <p>{e.text}</p>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </article>
  )
}

/** The decision a page stands behind: a callout with the faded glow inside it. No label: the box says it (hers, 2026-11-15). */
export function Callout({ title, children, ig: slot }) {
  return (
    <aside className="cs-callout" data-rise {...ig(slot)}>
      <p className="cs-callout-title">{title}</p>
      {children && <p>{children}</p>}
    </aside>
  )
}

/** Outcome numbers: { value, title, text, ig } */
export function Stats({ items }) {
  return (
    <div className="cs-stats" data-rise>
      {items.map(s => (
        <div key={s.title} className="cs-stat" {...ig(s.ig)}>
          <span className="cs-stat-value">{s.value}</span>
          <h3>{s.title}</h3>
          <p>{s.text}</p>
        </div>
      ))}
    </div>
  )
}

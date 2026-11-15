/**
 * The building blocks of a case study page. Each page (src/pages/cases/) composes these with its
 * own copy, so the next case study reuses the same rhythm.
 * Type follows the Figma text styles (Portfolio-Design): see CaseStudy.css for which style each uses.
 *
 * data-rise: the block rises in when it reaches the screen (caseMotion.js).
 * data-parallax: the block drifts against the scroll inside its panel (caseMotion.js, ?parallax).
 */

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
 * kind: 'phone' (a phone-shaped clip), 'wide' (a 2:1 picture), 'square'.
 */
export function Media({ kind = 'phone', src, poster, label, caption, parallax = true }) {
  const isVideo = src && /\.(mp4|webm)$/i.test(src)
  const inner = !src ? <Placeholder kind={kind} label={label} />
    : isVideo ? <video className={`cs-clip ${kind}`} src={src} poster={poster} muted loop playsInline preload="none" data-clip aria-label={label} />
    : <img className={`cs-clip ${kind}`} src={src} alt={label ?? ''} decoding="async" loading="lazy" />
  return (
    <figure className={`cs-media ${kind}`} data-rise>
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

/** Numbered cards, side by side: { title, text, icon } */
export function Cards({ items }) {
  return (
    <ol className="cs-cards" data-rise>
      {items.map(({ title, text, icon: Icon }, i) => (
        <li key={title}>
          <span className="cs-card-top">
            <span className="cs-num">{String(i + 1).padStart(2, '0')}</span>
            {Icon && <Icon className="cs-icon" aria-hidden="true" strokeWidth={1.5} />}
          </span>
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
      {items.map(({ text, source }) => (
        <figure key={source + text.slice(0, 12)} className="cs-insight">
          <blockquote>{text}</blockquote>
          <figcaption>{source}</figcaption>
        </figure>
      ))}
    </div>
  )
}

/** Two contexts set against each other: { title, points[] } twice. */
export function Compare({ left, right }) {
  const side = (s, cls) => (
    <div className={`cs-side ${cls}`}>
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
        <span className="cs-decision-n" aria-hidden="true">{String(n).padStart(2, '0')}</span>
        <div>
          <h3>{question}</h3>
          {answer && <p className="cs-decision-answer">{answer}</p>}
          {children}
        </div>
      </header>
      {media && <Media {...media} />}
      {edges && (
        <div className="cs-edges">
          {edges.map(e => (
            <div key={e.title} className="cs-edge">
              <Media kind="square" label={e.media} src={e.src} parallax={false} />
              <div data-rise>
                <p className="cs-label">{'{edge case}'}</p>
                <h4>{e.title}</h4>
                {e.text && <p>{e.text}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </article>
  )
}

/** The decision a page stands behind: a callout with the faded glow inside it. */
export function Callout({ label, title, children }) {
  return (
    <aside className="cs-callout" data-rise>
      {label && <p className="cs-label">{label}</p>}
      <p className="cs-callout-title">{title}</p>
      <p>{children}</p>
    </aside>
  )
}

/** Outcome numbers: { value, title, text } */
export function Stats({ items }) {
  return (
    <div className="cs-stats" data-rise>
      {items.map(s => (
        <div key={s.title} className="cs-stat">
          <span className="cs-stat-value">{s.value}</span>
          <h3>{s.title}</h3>
          <p>{s.text}</p>
        </div>
      ))}
    </div>
  )
}

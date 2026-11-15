import { useEffect, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { navigate } from '../../router'

/**
 * The case study's side index (desktop, wide windows): a way back to all work, then the sections,
 * the one you're reading in brackets. It stays put while the story scrolls past (Mavis Lo's
 * pattern: most of what makes her page easy to skim). Click a section to glide to it.
 * Hidden below 1100px, where there's no room beside the column; phones have the bottom nav.
 */
function CaseIndex({ sections }) {
  const [current, setCurrent] = useState(sections[0]?.id)

  // the current section is the last one whose top has passed 40% of the way down the screen
  useEffect(() => {
    let raf = 0
    const check = () => {
      raf = 0
      const line = innerHeight * 0.4
      let id = sections[0]?.id
      for (const s of sections) {
        const el = document.getElementById(s.id)
        if (el && el.getBoundingClientRect().top <= line) id = s.id
      }
      setCurrent(id)
    }
    const queue = () => { if (!raf) raf = requestAnimationFrame(check) }
    addEventListener('scroll', queue, { passive: true })
    addEventListener('resize', queue)
    check()
    return () => { cancelAnimationFrame(raf); removeEventListener('scroll', queue); removeEventListener('resize', queue) }
  }, [sections])

  const go = (e, id) => {
    e.preventDefault()
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    document.getElementById(id)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
    history.replaceState(null, '', `#${id}`)
  }
  const back = (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button > 0) return
    e.preventDefault()
    navigate('/work')
  }

  return (
    <nav className="cs-index" aria-label="Case study sections">
      <a className="cs-back" href="/work" onClick={back}>
        <ArrowLeft aria-hidden="true" size={16} strokeWidth={1.5} />all work
      </a>
      <ol>
        {sections.map(s => (
          <li key={s.id}>
            <a href={`#${s.id}`} onClick={e => go(e, s.id)} aria-current={current === s.id ? 'location' : undefined}>
              <span className="br" aria-hidden="true">[</span>{s.label}<span className="br" aria-hidden="true">]</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}

export default CaseIndex

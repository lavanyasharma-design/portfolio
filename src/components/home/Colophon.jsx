import { useEffect, useId, useRef, useState } from 'react'
import { COLOPHON } from './colophonContent'
import './Colophon.css'

const HOVER = '(hover: hover) and (pointer: fine)'

/**
 * "Colophon" in the home footer and its box of credits (hers, 2026-11-23, after a reference she sent):
 * - desktop: the box shows while the pointer is over the word (CSS :hover), nothing to click;
 * - phones: a tap opens it, a tap anywhere (or on the word again) closes it;
 * - keyboard: Enter / Space toggles it, Escape or tabbing away closes it.
 * Plain text, no links, so the box never needs the pointer and takes none.
 */
export default function Colophon() {
  const [open, setOpen] = useState(false)
  const wrap = useRef(null)
  const id = useId()

  useEffect(() => {
    if (!open) return
    const away = (e) => { if (!wrap.current?.contains(e.target)) setOpen(false) }
    const esc = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('pointerdown', away, true)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('pointerdown', away, true)
      document.removeEventListener('keydown', esc)
    }
  }, [open])

  // a mouse click does nothing (hover already shows it); a keyboard "click" (detail 0) and a tap toggle it
  const onClick = (e) => {
    if (e.detail !== 0 && matchMedia(HOVER).matches) return
    setOpen((o) => !o)
  }

  return (
    <span className="colophon" ref={wrap} data-open={open || undefined}>
      <button type="button" className="colophon-btn" aria-expanded={open} aria-controls={id}
        onClick={onClick} onBlur={() => setOpen(false)}>Colophon</button>
      <span className="colophon-box" id={id} role="note">
        {COLOPHON.map((line) => <span key={line}>{line}</span>)}
      </span>
    </span>
  )
}

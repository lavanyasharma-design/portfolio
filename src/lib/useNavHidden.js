import { useEffect, useState } from 'react'

/**
 * When the nav bar steps aside (Work page and case studies).
 * Near the footer it hides while scrolling down and comes back, in place, the moment you scroll up
 * (Lavanya, 2026-11-14). Where "near" starts:
 * - phones: once the line `lineRef` marks has risen above the band the bottom bar sits on, so the
 *   bar never sits over the footer (the Work page puts it 50px below the last case study);
 * - desktop: once the footer comes into view.
 * `peek` (case studies, hers 2026-11-20: the bar sat over the clips): anywhere on the page it hides
 * while scrolling down and comes back only on a scroll up, however slight. Not when the scroll stops:
 * people stop to watch a clip.
 */
const PHONE = '(max-width: 600px)'

export function useNavHidden(lineRef, { peek = false } = {}) {
  const [hidden, setHidden] = useState(false)
  useEffect(() => {
    const phone = matchMedia(PHONE)
    let raf = 0, lastY = scrollY, hid = false
    const check = () => {
      raf = 0
      const line = lineRef.current
      const dock = document.querySelector('.nav-dock')
      const foot = document.querySelector('.page-foot')
      // clamped, so iOS's bounce past the bottom doesn't read as scrolling up
      const y = Math.min(scrollY, document.documentElement.scrollHeight - innerHeight)
      const up = y < lastY - 1, down = y > lastY + 1
      if (up || down) lastY = y
      const near = !line || !dock || !foot ? false
        // phones: the line has risen above the band the bar sits on
        : phone.matches ? line.getBoundingClientRect().top <= innerHeight - dock.offsetHeight
        // desktop: the footer is in view
        : foot.getBoundingClientRect().top < innerHeight
      if (up || (!near && !peek)) hid = false
      else if (down) hid = true
      setHidden(hid)
    }
    const queue = () => { if (!raf) raf = requestAnimationFrame(check) }
    addEventListener('scroll', queue, { passive: true })
    addEventListener('resize', queue)
    phone.addEventListener('change', queue)
    check()
    return () => {
      cancelAnimationFrame(raf)
      removeEventListener('scroll', queue)
      removeEventListener('resize', queue)
      phone.removeEventListener('change', queue)
    }
  }, [lineRef, peek])
  return hidden
}

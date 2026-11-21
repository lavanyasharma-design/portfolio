/**
 * ?type on a case study: a pink tag on every piece of text naming its Figma text style and its live
 * size, so the page can be reviewed section by section against the type scale.
 * Each row is [selector, desktop style, phone style]; the first row that matches an element wins.
 * Keep the names in step with the comments in CaseStudy.css and PageFooter.css.
 */
const STYLES = [
  ['.cs-hero h1', 'Desktop/H2', 'Mobile/h4'],
  ['.cs-tags', 'Desktop/Caption', 'Mobile/Caption'],
  ['.cs-details th', 'Desktop/Caption', 'Mobile/Caption'],
  ['.cs-details td', 'Desktop/Body', 'Mobile/Body'],
  ['.cs-index ol', 'Desktop/Caption', 'Desktop/Caption'],
  ['.cs-label', 'Desktop/H6', 'Mobile/Body'],
  ['.cs-head h2.cs-statement', 'Desktop/H7, purple', 'Mobile/h5, purple'],
  ['.cs-head h2', 'Desktop/H7', 'Mobile/h5'],
  ['.cs-statement', 'Desktop/H7, purple', 'Mobile/h5, purple'],
  ['.cs-sub', 'Desktop/H7', 'Mobile/h5'],
  ['.cs-copy > p', 'Desktop/Body', 'Mobile/Body'],
  ['.cs-media figcaption', 'Desktop/Caption', 'Mobile/Caption'],
  ['.cs-num', 'Desktop/Caption 2', 'Desktop/Caption 2'],
  ['.cs-cards h3', 'Desktop/H7', 'Mobile/h5'],
  ['.cs-cards p', 'Desktop/Caption', 'Mobile/Caption'],
  ['.cs-insight blockquote', 'Desktop/H7', 'Mobile/h5'],
  ['.cs-insight figcaption', 'Desktop/Caption', 'Mobile/Caption'],
  ['.cs-side h3', 'Desktop/H7', 'Mobile/h5'],
  ['.cs-side ul', 'Desktop/Body', 'Mobile/Body'],
  ['.cs-feature-copy h3', 'Desktop/H7', 'Mobile/h5'],
  ['.cs-feature-copy p', 'Desktop/Body', 'Mobile/Body'],
  ['.cs-callout-title', 'Desktop/H2', 'Mobile/h4'],
  ['.cs-callout > p:not(.cs-callout-title)', 'Desktop/Body', 'Mobile/Body'],
  ['.cs-decision-head h3', 'Desktop/H7, purple', 'Mobile/h5, purple'],
  ['.cs-decision-answer', 'Desktop/H6', 'Mobile/Body'],
  ['.cs-edge h4', 'Desktop/H7', 'Mobile/h5'],
  ['.cs-edge p', 'Desktop/Caption', 'Mobile/Caption'],
  ['.cs-stat-value', 'Desktop/H4', 'Mobile/h1'],
  ['.cs-stat h3', 'Desktop/H7', 'Mobile/h5'],
  ['.cs-stat p', 'Desktop/Caption', 'Mobile/Caption'],
  ['.cs-more', 'Desktop/H3, purple', 'Mobile/h3, purple'],
  ['.cs-next-card h2', 'Desktop/H7', 'Mobile/h5'],
  ['.pf-why', 'Desktop/H3', 'Mobile/h3'],
  ['.pf-hi', 'Desktop/H6', 'Mobile/Caption'],
]

export function mountTypeLabels(root) {
  const phone = matchMedia('(max-width:600px)')
  const marked = []

  const clear = () => {
    for (const el of marked) el.removeAttribute('data-ts')
    marked.length = 0
  }

  const label = () => {
    clear()
    for (const [sel, desktop, mobile] of STYLES) {
      for (const el of root.querySelectorAll(sel)) {
        if (el.hasAttribute('data-ts')) continue
        const cs = getComputedStyle(el)
        if (cs.display === 'none') continue
        el.setAttribute('data-ts', `${phone.matches ? mobile : desktop} · ${Math.round(parseFloat(cs.fontSize))}`)
        marked.push(el)
      }
    }
  }

  // sizes are read live, so relabel once the fonts are in and whenever the phone styles switch
  label()
  document.fonts?.ready.then(label)
  phone.addEventListener('change', label)
  root.classList.add('cs-types')

  return () => {
    phone.removeEventListener('change', label)
    root.classList.remove('cs-types')
    clear()
  }
}

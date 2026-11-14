import Garden from './Garden'
import './PageFooter.css'

/**
 * The closing note under a page: Figma "footer" (346:205, desktop) and "Footer" (346:9493, phone).
 * A heading and a short paragraph with the ways to say hi, then the footer visual: the garden.
 * The links stay silent (Lavanya, 2026-11-14: sound here felt like too much).
 */
function PageFooter() {
  return (
    <footer className="page-foot">
      <div className="pf-note">
        <h2 className="pf-why" data-no-motif>Good products start with a good why.</h2>
        <p className="pf-hi" data-no-motif>
          For me, context comes before canvas. I think through how every decision lands, build in systems,
          borrow ideas from anywhere, and make sure every detail earns its place. If that sounds like your kind
          of team, say hi on{' '}
          <a href="https://www.linkedin.com/in/lavanyaaasharmaaa/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          {' '}or{' '}
          <a href="https://x.com/lavanyaaasharma" target="_blank" rel="noopener noreferrer">X</a>
          , or write to me at{' '}
          <a href="mailto:hi@lavanyaaa.com">hi@lavanyaaa.com</a>
        </p>
      </div>
      <div className="pf-visual" aria-hidden="true" data-no-motif><Garden /></div>
    </footer>
  )
}

export default PageFooter

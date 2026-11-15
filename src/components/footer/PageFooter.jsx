import Garden from './Garden'
import { Link } from './sayHi'
import './PageFooter.css'

/**
 * The closing note under a page: Figma "footer" (346:205, desktop) and "Footer" (346:9493, phone).
 * A heading and a short paragraph with the ways to say hi, then the footer visual: the garden.
 * The links stay silent (Lavanya, 2026-11-14: sound here felt like too much).
 * Each page can bring its own words (`heading`, `children` for the paragraph); the garden stays.
 */
const WORK_NOTE = <>
  For me, context comes before canvas. I think through how every decision lands, build in systems,
  borrow ideas from anywhere, and make sure every detail earns its place. If that sounds like your kind
  of team, say hi on {Link.linkedin} or {Link.x}, or write to me at {Link.mail}
</>

function PageFooter({ heading = 'Good products start with a good why.', children = WORK_NOTE }) {
  return (
    <footer className="page-foot">
      <div className="pf-note">
        <h2 className="pf-why" data-no-motif>{heading}</h2>
        <p className="pf-hi" data-no-motif>{children}</p>
      </div>
      <div className="pf-visual" aria-hidden="true" data-no-motif><Garden /></div>
    </footer>
  )
}

export default PageFooter

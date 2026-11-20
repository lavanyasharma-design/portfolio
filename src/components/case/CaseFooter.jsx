import PageFooter from '../footer/PageFooter'
import { Link } from '../footer/sayHi'

/**
 * The footer under every case study: the same words for all of them, so nothing in it names one
 * (hers, 2026-11-20). The garden stays, as on Work.
 */
function CaseFooter() {
  return (
    <PageFooter heading="See us working together?">
      If context and system design is what drives your product, say hi on {Link.linkedin} or {Link.x}, or
      write to me at {Link.mail}
    </PageFooter>
  )
}

export default CaseFooter

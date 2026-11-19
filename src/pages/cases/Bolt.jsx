import { useEffect, useRef } from 'react'
import NavBar from '../../components/nav/NavBar'
import PageFooter from '../../components/footer/PageFooter'
import { Link } from '../../components/footer/sayHi'
import CaseTile from '../../components/work/CaseTile'
import CaseIndex from '../../components/case/CaseIndex'
import { mountCaseMotion, mountCaseMotionPanel } from '../../components/case/caseMotion'
import { mountTypeLabels } from '../../components/case/typeLabels'
import { mountInfographicPanel } from '../../components/case/infographic'
import { heroVars, mountHeroPanel } from '../../components/case/heroZoom'
import {
  Section, Copy, Statement, Media, Details, Cards, Insights, Compare, Feature, Decision, Callout, Stats,
} from '../../components/case/blocks'
import { TILES, LOOK, DEFAULT_BG, lookVars } from '../../components/work/tiles'
import { useNavHidden } from '../../lib/useNavHidden'
import '../../components/case/CaseStudy.css'

/**
 * Bolt case study, first draft (2026-11-15), designed in code: no Figma frame yet.
 * Story from Lavanya's FigJam "CASE STUDY STRUCTURE" (Portfolio-Planning, 59:551) in the order of her
 * outline: hero, the product, the problem, the solution, why it's a problem, the approach,
 * decisions, outcome, then the next case study and the footer.
 * Copy fixes applied: no em dashes, British spelling, names capitalised, the unfinished
 * "And i feel" dropped. No Draft markers left (2026-11-15); wrap anything still to write in <Draft>.
 * Clips are placeholders until the recordings exist: give each Media a `src` (an .mp4 in
 * /public/work/bolt/) and it plays, muted and looping, only while on screen.
 */

// the side index: one entry per {label} on the page (Lavanya, 2026-11-15)
const SECTIONS = [
  { id: 'product', label: 'product' },
  { id: 'problem', label: 'problem' },
  { id: 'solution', label: 'solution' },
  { id: 'research', label: 'research conclusions' },
  { id: 'approach', label: 'my approach' },  // as its {label} (hers, 2026-11-16)
  { id: 'design', label: 'design' },
  { id: 'decisions', label: 'decisions' },
  { id: 'outcome', label: 'outcome' },
]

const tile = id => TILES.find(t => t.id === id)
const BOLT = tile('bolt')
const NEXT = [tile('fci'), tile('emi')]   // the next case studies (no pages yet, so pictures for now)

const NAV_HIDE_AFTER = 50  // px below the next case study, where the phone nav bar steps aside

function Bolt() {
  const page = useRef(null)
  const hideLine = useRef(null)
  const heroFig = useRef(null)
  const navHidden = useNavHidden(hideLine)

  useEffect(() => {
    const stop = mountCaseMotion(page.current)
    const q = new URLSearchParams(location.search)
    const panel = q.has('parallax') ? mountCaseMotionPanel() : null
    const unlabel = q.has('type') ? mountTypeLabels(page.current) : null
    const igPanel = q.has('infographic') ? mountInfographicPanel() : null
    const heroPanel = q.has('hero') ? mountHeroPanel(heroFig.current) : null
    return () => { stop(); panel?.remove(); unlabel?.(); igPanel?.remove(); heroPanel?.remove() }
  }, [])

  return (
    <>
    <NavBar active="work" hidden={navHidden} />
    <main className="case-page" ref={page} style={lookVars(LOOK)}>
      <div className="cs-wrap">
        <CaseIndex sections={SECTIONS} />
        <article className="cs-main">

          {/* ---------- 1. hero ---------- */}
          <Section id="product">
            <header className="cs-hero" data-rise>
              <h1>Mobile friendly fleet management SaaS that gives users flexibility</h1>
            </header>
            <figure className="cs-hero-visual" data-rise ref={heroFig} style={heroVars()}>
              <CaseTile tile={BOLT} look={LOOK} bg={BOLT.bg ?? DEFAULT_BG} />
            </figure>
            <Details items={[
              ['Role', 'Primary product designer'],
              ['Industry', 'Logistics & SaaS'],
              ['Product', 'Bolt, by Roadcast'],
            ]} />

            {/* ---------- 2. the product ---------- */}
            <Copy>
              <p className="cs-label">{'{the product}'}</p>
              <p>
                Bolt is Roadcast’s fleet management SaaS, used by businesses across logistics, pharma, cab
                services, delivery, among others, to track vehicles, manage drivers and monitor operations in real time.
              </p>
              <p>
                The people using it aren’t only sitting in offices. They’re on warehouse floors, out in the field,
                sometimes at the very shop where they’re buying new GPS, camera or sensor devices for their fleet.
              </p>
            </Copy>
          </Section>

          {/* ---------- 3. the problem ---------- */}
          <Section id="problem" label="the problem" statement title="How will people answer in crisis or take simple actions when they’re away from their desks?" />

          {/* ---------- 4. the solution, first look ---------- */}
          <Section id="solution" label="the solution" title="Here’s Bolt, designed for mobile, for exactly such times">
            <Copy>
              <p>
                Bolt is an expansive SaaS that offers comprehensive admin functions along with supervision. It’s a
                software that every admin level in an organisation uses, as per their purpose.
              </p>
            </Copy>
            <Media kind="phone" label="menu clip" caption="A SaaS home page that works as an overview of the entire fleet management process" />
          </Section>

          {/* ---------- 5. why it mattered (no label, so no index entry: it reads as part of the solution) ---------- */}
          {/* INFOGRAPHIC: her palettes (2026-11-16), colours per slot in infographic.js, ?infographic to tune */}
          <Section id="why" title="Why bringing SaaS to mobile mattered">
            {/* no numbers or icons, "subscriptions" out of the third title (hers, 2026-11-16) */}
            <Cards numbered={false} items={[
              { ig: 'why1', title: 'Track vehicles live', text: 'No mobile map meant no real-time view and any negligence reported could only be accessed on a big screen. No quick reparatory actions.' },
              { ig: 'why2', title: 'Manage geofences', text: 'Creating delivery boundaries, or responding to a breach, needed a desktop session.' },
              { ig: 'why3', title: 'Handle devices', text: 'Adding a new GPS device or managing feature licences, responding promptly to device faults was a task.' },
            ]} />
          </Section>

          {/* ---------- 6. research conclusions ---------- */}
          {/* INFOGRAPHIC: her palettes (2026-11-16) */}
          <Section id="research" label="research conclusions">
            <Insights items={[
              {
                ig: 'insight1',
                text: 'Users called in for help because they couldn’t complete actions without switching back to their laptop, frustration was recorded.',
                source: 'Synthesised from customer support feedback',
              },
              {
                ig: 'insight2',
                text: 'The most common complaint wasn’t about missing features. It was about not being able to reach the features they already had.',
                source: 'Synthesised from usability sessions',
              },
            ]} />
          </Section>

          {/* ---------- 7. the approach ---------- */}
          <Section id="approach" label="my approach" title="Users and their context were paramount here.">
            <Copy>
              <p>
                The obvious move would have been to port everything from desktop to mobile. But I wanted to ease
                out the users, and hence, separating use cases was the first step.
              </p>
            </Copy>
            {/* INFOGRAPHIC: her palettes (2026-11-16) */}
            <Compare
              left={{ ig: 'desktop', label: 'on desktop', title: 'Time to configure', points: ['Time on their hands', 'Room on the screen', 'The headspace to set things up'] }}
              right={{ ig: 'mobile', label: 'on mobile', title: 'Moments to act', points: ['Check a status', 'Send a vehicle', 'See if a geofence was breached'] }}
            />
            <Copy><p>Giving them everything at once would have made both experiences worse.</p></Copy>
            {/* the design brief and how it was answered, 12 apart */}
            <div className="cs-brief">
              <Statement>
                So, my design brief was: what does a supervisor need to act on when they’re away from their desk?
              </Statement>
              <Copy>
                <p>
                  I worked closely with the customer support team throughout. They spoke to users every day about
                  what they struggled with, and their input shaped every decision about what went on mobile and
                  what stayed on web.
                </p>
              </Copy>
            </div>
          </Section>

          {/* ---------- 8. design: what made it to mobile ---------- */}
          <Section id="design" label="design" title="What made it to mobile">
            <div className="cs-features">
              <Feature title="Fleet overview" media={{ label: 'fleet overview clip' }}>
                Every vehicle and every status could be seen live on a phone
              </Feature>
              <Feature title="Geofence management" media={{ label: 'geofence clip' }}>
                Admins can create boundaries, get breach alerts and respond to them promptly.
              </Feature>
              {/* subscriptions out of this one: only devices here (hers, 2026-11-16) */}
              <Feature title="Device management" media={{ label: 'devices clip' }}>
                Admins can manage all their devices on the go, even at the shop where they’re buying them.
              </Feature>
              <Feature title="Points of interest" media={{ label: 'POI clip' }}>
                Create POI on the go during a consignment. Auto updates and goes live to the driver.
              </Feature>
            </div>
          </Section>

          {/* ---------- 9. decisions ---------- */}
          <Section id="decisions" label="decisions" title="The call that shaped it">
            {/* INFOGRAPHIC: the lilac gradient from her reference (2026-11-16) */}
            <Callout ig="callout" title="We kept deep configuration flows on desktop, on purpose." />

            <Decision
              n={1}
              question="How do users buy and manage subscriptions without running into balance roadblocks?"
              answer="Users can take up licence subscriptions the moment they receive a new device, wherever they are."
              media={{ kind: 'phone', label: 'subscriptions clip' }}
              edges={[
                { title: 'Low balance', media: 'low balance screen', text: 'Just an additional small step, in the usual flow, to renew their devices and plans.' },
                { title: 'Grace period', media: 'grace period screen', text: 'Grace period notice for ease, no abrupt endings, and user flexibility to renew in their own time.' },
              ]}
            >
              <Copy>
                <p>
                  I leaned on the mental model people already have from managing subscriptions on platforms like
                  Netflix, Hotstar and Dailyhunt.
                </p>
              </Copy>
            </Decision>

            <Decision
              n={2}
              question="How was creating geofences on mobile made flexible?"
              answer="A quick, light tap to create circular fences, a usual mobile interaction pattern. Added different views for the map, similar to other navigation apps for familiarity."
              edges={[{ media: 'geofence clip' }, { media: 'terrain map view' }]}  // two clips side by side (hers, 2026-11-15)
            />

            <Decision
              n={3}
              question="How do users see technical detail about a running vehicle?"
              answer="Tapping the vehicle on the map and its device list opens. All details are visible in real time."
              media={{ kind: 'phone', label: 'map clip: vehicle tap to device list' }}
            />
          </Section>

          {/* ---------- 10. outcome (her reflections were taken out, 2026-11-15) ---------- */}
          <Section id="outcome" label="outcome" title="What landed">
            <Stats items={[
              {
                ig: 'stats',  // a purple gradient, so they stop reading like the clip panels (hers, 2026-11-16)
                value: '12%',
                title: 'higher task completion',
                text: <>Tracked through Google Analytics after launch and validated in usability sessions with the
                  customer support team.</>,
              },
              {
                ig: 'stats',
                value: '25%',
                title: 'fewer operational calls',
                text: 'The support team noticed it too. Users were completing actions on their own, on their phones, without needing any help.',
              },
            ]} />
          </Section>

          {/* the end of the case study (hers, 2026-11-16); the side index stops here */}
          <hr className="cs-end" />
        </article>
      </div>

      {/* ---------- 11. more work: its own block below the story, no index beside it ---------- */}
      <div className="cs-wrap cs-after">
          <section className="cs-next" aria-label="More work">
            <h2 className="cs-more" data-rise>More work</h2>
            <div className="cs-next-cards">
              {NEXT.map(t => (
                <div key={t.id} className="cs-next-card" data-rise>
                  <CaseTile tile={t} look={LOOK} bg={t.bg ?? DEFAULT_BG} />
                  <h2>{t.title}</h2>
                </div>
              ))}
            </div>
            <div ref={hideLine} className="nav-hide-line" style={{ '--after': `${NAV_HIDE_AFTER}px` }} aria-hidden="true" />
          </section>
      </div>

      <PageFooter heading="Thanks for reading this far.">
        If context and system design is what drives your product or if you’d like to hear how the rest of Bolt
        came together, say hi on {Link.linkedin} or {Link.x}, or write to me at {Link.mail}
      </PageFooter>
    </main>
    </>
  )
}

export default Bolt

import { useEffect, useRef } from 'react'
import { MapPinned, Fence, Cpu } from 'lucide-react'
import NavBar from '../../components/nav/NavBar'
import PageFooter from '../../components/footer/PageFooter'
import { Link } from '../../components/footer/sayHi'
import CaseTile from '../../components/work/CaseTile'
import CaseIndex from '../../components/case/CaseIndex'
import { mountCaseMotion, mountCaseMotionPanel } from '../../components/case/caseMotion'
import {
  Section, Copy, Statement, Media, Details, Cards, Insights, Compare, Feature, Decision, Callout, Stats, Draft,
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
 * "And i feel" dropped. Anything she still has to write or check is wrapped in <Draft>.
 * Clips are placeholders until the recordings exist: give each Media a `src` (an .mp4 in
 * /public/work/bolt/) and it plays, muted and looping, only while on screen.
 */

const SECTIONS = [
  { id: 'overview', label: 'overview' },
  { id: 'problem', label: 'problem' },
  { id: 'solution', label: 'solution' },
  { id: 'why', label: 'why' },
  { id: 'approach', label: 'approach' },
  { id: 'decisions', label: 'decisions' },
  { id: 'outcome', label: 'outcome' },
]

const tile = id => TILES.find(t => t.id === id)
const BOLT = tile('bolt')
const NEXT = tile('fci')   // the next case study (no page yet, so a picture for now)

const NAV_HIDE_AFTER = 50  // px below the next case study, where the phone nav bar steps aside

function Bolt() {
  const page = useRef(null)
  const hideLine = useRef(null)
  const navHidden = useNavHidden(hideLine)

  useEffect(() => {
    const stop = mountCaseMotion(page.current)
    const panel = new URLSearchParams(location.search).has('parallax') ? mountCaseMotionPanel() : null
    return () => { stop(); panel?.remove() }
  }, [])

  return (
    <>
    <NavBar active="work" hidden={navHidden} />
    <main className="case-page" ref={page} style={lookVars(LOOK)}>
      <div className="cs-wrap">
        <CaseIndex sections={SECTIONS} />
        <article className="cs-main">

          {/* ---------- 1. hero ---------- */}
          <Section id="overview">
            <header className="cs-hero" data-rise>
              {/* hyphenated words kept whole, so phones never break "mobile-" / "friendly" */}
              <h1>Designing a consistent, <span className="nowrap">mobile-friendly</span> SaaS platform for <span className="nowrap">on-the-ground</span> fleet accessibility</h1>
              <ul className="cs-tags">{BOLT.tags.map(t => <li key={t}>{`{${t}}`}</li>)}</ul>
            </header>
            <figure className="cs-hero-visual" data-rise>
              <CaseTile tile={BOLT} look={LOOK} bg={BOLT.bg ?? DEFAULT_BG} />
            </figure>
            <Details items={[
              ['Role', 'Primary product designer'],
              ['Industry', 'Logistics & SaaS'],
              ['Product', 'Bolt, by Roadcast'],
              ['Timeline', <Draft key="t" note="How long the project ran">to add</Draft>],
              ['Team', <Draft key="m" note="Who you worked with: PM, engineers, the support team">to add</Draft>],
              ['Tools', <Draft key="o" note="e.g. Figma, Google Analytics">to add</Draft>],
            ]} />

            {/* ---------- 2. the product ---------- */}
            <Copy>
              <p className="cs-label">{'{the product}'}</p>
              <p>
                Bolt is Roadcast’s fleet management SaaS, used by businesses across logistics, pharma and cab
                services to track vehicles, manage drivers and monitor operations in real time.
              </p>
              <p>
                The people using it aren’t only sitting in offices. They’re on warehouse floors, out in the field,
                sometimes at the very shop where they’re buying new GPS, camera or sensor devices for their fleet.
                The product, however, was built entirely for a desk.
              </p>
            </Copy>
          </Section>

          {/* ---------- 3. the problem ---------- */}
          <Section id="problem" label="the problem" statement title="A fleet supervisor shouldn’t need a desktop to manage a moving fleet." />

          {/* ---------- 4. the solution, first look ---------- */}
          <Section id="solution" label="the solution" title="Here’s Bolt, designed for mobile">
            <Copy>
              <p>
                <Draft note="New line for this spot: rewrite in your words">
                  Everything a supervisor acts on away from their desk, in their pocket: live tracking, geofences,
                  devices and subscriptions, without reaching for a laptop.
                </Draft>
              </p>
            </Copy>
            <Media kind="phone" label="menu clip" caption="A SaaS home page that works as an overview of the entire fleet management process" />
          </Section>

          {/* ---------- 5. why it's a problem ---------- */}
          <Section id="why" label="why it matters" title="Why is that a problem?">
            <Copy><p>Here’s what a user couldn’t do unless they were at a desktop:</p></Copy>
            <Cards items={[
              { icon: MapPinned, title: 'Track vehicles live', text: 'No mobile map meant no real-time view of the fleet while away from the office.' },
              { icon: Fence, title: 'Manage geofences', text: 'Creating boundaries, or responding to a breach, needed a desktop session.' },
              { icon: Cpu, title: 'Handle subscriptions and devices', text: 'Adding a new GPS device or managing feature licences was desktop only.' },
            ]} />
            <Insights label="{what we kept hearing}" items={[
              {
                text: 'Users called in because they couldn’t complete basic actions without switching back to their laptop, even when they were already at the place where the action needed to happen.',
                source: 'Synthesised from customer support feedback',
              },
              {
                text: 'The most common complaint wasn’t about missing features. It was about not being able to reach the features they already had.',
                source: 'Synthesised from usability sessions',
              },
            ]} />
          </Section>

          {/* ---------- 6. the approach ---------- */}
          <Section id="approach" label="my approach" title="So my approach became about context">
            <Copy>
              <p>
                The obvious move would have been to port everything from desktop to mobile. I didn’t, because
                desktop and mobile aren’t the same context.
              </p>
            </Copy>
            <Compare
              left={{ label: 'on desktop', title: 'Time to configure', points: ['Time on their hands', 'Room on the screen', 'The headspace to set things up'] }}
              right={{ label: 'on mobile', title: 'Moments to act', points: ['Check a status', 'Send a vehicle', 'See if a geofence was breached'] }}
            />
            <Copy><p>Giving them everything at once would have made both experiences worse.</p></Copy>
            <Statement>
              So the question I designed around was: what does a supervisor need to act on when they’re away
              from their desk?
            </Statement>
            <Copy>
              <p>
                To answer it, I worked closely with the customer support team throughout. They spoke to users every
                day about what they struggled with, and their input shaped every decision about what went on
                mobile and what stayed on web.
              </p>
            </Copy>

            <h3 className="cs-sub" data-rise>What made it to mobile</h3>
            <div className="cs-features">
              <Feature title="Fleet overview" media={{ label: 'fleet overview clip' }}>
                Every vehicle and every status, live, from your phone.
              </Feature>
              <Feature title="Geofence management" media={{ label: 'geofence clip' }}>
                Create boundaries and get breach alerts without touching a laptop.
              </Feature>
              <Feature title="Devices and subscriptions" media={{ label: 'subscriptions clip' }}>
                Add devices and manage licences on the go, even at the shop where you’re buying them.
              </Feature>
              <Feature title="POI and driver actions" media={{ label: 'POI clip' }}>
                Send a vehicle from the warehouse, or call a driver straight from their vehicle’s screen.
              </Feature>
            </div>
          </Section>

          {/* ---------- 7. decisions ---------- */}
          <Section id="decisions" label="decisions" title="The calls that shaped it">
            <Callout label="{the decision I’d defend}" title="We kept deep configuration flows on desktop, on purpose.">
              Mobile users aren’t running quarterly audits. They’re making fast calls under pressure. Adding
              complexity to that context doesn’t help them; it slows them down.
            </Callout>

            <Decision
              n={1}
              question="How do users buy and manage subscriptions without running into balance roadblocks?"
              answer="Right where they are. Users can take up licence subscriptions the moment they receive a new device, wherever they are."
              media={{ kind: 'phone', label: 'subscriptions clip' }}
              edges={[
                { title: 'Low balance', media: 'low balance screen', text: <Draft note="One line on what happens here">What the user sees when their balance runs low.</Draft> },
                { title: 'Grace period', media: 'grace period screen', text: <Draft note="One line on what happens here">How the grace period keeps a device running.</Draft> },
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
              answer={<Draft note="Your FigJam has the question but no answer yet">How geofences are drawn and edited on a phone, in one or two lines.</Draft>}
              media={{ kind: 'phone', label: 'geofence clip' }}
              edges={[
                { title: 'Terrain map view', media: 'terrain map view', text: <Draft note="One line on why this view matters">Why the terrain view matters when drawing a boundary.</Draft> },
              ]}
            />

            <Decision
              n={3}
              question="How do users see technical detail about a running vehicle?"
              answer="Tap the vehicle on the map and its device list opens."
              media={{ kind: 'phone', label: 'map clip: vehicle tap to device list' }}
            />
          </Section>

          {/* ---------- 8. outcome ---------- */}
          <Section id="outcome" label="outcome" title="What landed">
            <Stats items={[
              {
                value: '12%',
                title: 'higher task completion',
                text: <>Tracked through Google Analytics after launch and validated in usability sessions with the
                  customer support team. <Draft note="A baseline and a time period make this land">From X% to Y%, over N months.</Draft></>,
              },
              {
                value: <Draft note="Add the number if you have it">N%</Draft>,
                title: 'fewer operational calls',
                text: 'The support team noticed it too. Users were completing actions on their own, on their phones, without needing to find a laptop first.',
              },
            ]} />
            <h3 className="cs-sub" data-rise>My reflections</h3>
            <Copy>
              <p>
                This one taught me that mobile parity and mobile utility are two different things. Giving users
                everything isn’t always giving them more. Sometimes it’s just giving them more to wade through.
              </p>
              <p>
                The real design work here was deciding what not to put on mobile, and being confident enough to
                defend that call :)
              </p>
            </Copy>
          </Section>

          {/* ---------- 9. next case study ---------- */}
          <section className="cs-next" aria-labelledby="next-title">
            <p className="cs-label" data-rise>{'{next case study}'}</p>
            <div className="cs-next-card" data-rise>
              <CaseTile tile={NEXT} look={LOOK} bg={NEXT.bg ?? DEFAULT_BG} />
              <h2 id="next-title">{NEXT.title}</h2>
              <ul className="cs-tags">{NEXT.tags.map(t => <li key={t}>{`{${t}}`}</li>)}</ul>
            </div>
            <div ref={hideLine} className="nav-hide-line" style={{ '--after': `${NAV_HIDE_AFTER}px` }} aria-hidden="true" />
          </section>
        </article>
      </div>

      <PageFooter heading={<Draft note="Footer heading for case studies: rewrite in your words">Thanks for reading this far.</Draft>}>
        If you’re building for people who are rarely at a desk, or you’d like to hear how the rest of Bolt came
        together, say hi on {Link.linkedin} or {Link.x}, or write to me at {Link.mail}
      </PageFooter>
    </main>
    </>
  )
}

export default Bolt

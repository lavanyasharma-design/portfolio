import { useEffect, useRef, useState } from 'react'
import WindowIntro from '../components/intro/WindowIntro'
import Hero from '../components/home/Hero'
import { SOON } from '../site'
import { navigatedInSite } from '../router'

// the window intro plays once per visit: coming back from another page (the nav bar's butterfly,
// or straight after opening /work) lands on the hero. Only a fresh load of the home page plays it
let introDone = false

function Home() {
  const heroRef = useRef(null)
  const bflyRef = useRef(null)
  const [skipIntro] = useState(() => introDone || navigatedInSite)
  const [revealed, setRevealed] = useState(skipIntro)

  useEffect(() => { if (revealed) introDone = true }, [revealed])

  // the page doesn't scroll until the intro has let you through; the coming soon screen never does
  // (one screen, nothing below it, and a still page lets a finger sweep the motif)
  useEffect(() => {
    document.body.style.overflow = revealed && !SOON ? 'auto' : 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [revealed])

  return (
    <>
      {!skipIntro && <WindowIntro heroRef={heroRef} heroBflyRef={bflyRef} onReveal={() => setRevealed(true)} />}
      <Hero revealed={revealed} heroRef={heroRef} bflyRef={bflyRef} />
    </>
  )
}

export default Home

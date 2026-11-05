import { useEffect, useRef, useState } from 'react'
import WindowIntro from '../components/intro/WindowIntro'
import Hero from '../components/home/Hero'
import { SOON } from '../site'

function Home() {
  const heroRef = useRef(null)
  const bflyRef = useRef(null)
  const [revealed, setRevealed] = useState(false)

  // the page doesn't scroll until the intro has let you through; the coming soon screen never does
  // (one screen, nothing below it, and a still page lets a finger sweep the motif)
  useEffect(() => {
    document.body.style.overflow = revealed && !SOON ? 'auto' : 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [revealed])

  return (
    <>
      <WindowIntro heroRef={heroRef} heroBflyRef={bflyRef} onReveal={() => setRevealed(true)} />
      <Hero revealed={revealed} heroRef={heroRef} bflyRef={bflyRef} />
    </>
  )
}

export default Home

import { useEffect, useRef, useState } from 'react'
import WindowIntro from '../components/intro/WindowIntro'
import Hero from '../components/home/Hero'

function Home() {
  const heroRef = useRef(null)
  const bflyRef = useRef(null)
  const [revealed, setRevealed] = useState(false)

  // the page doesn't scroll until the intro has let you through
  useEffect(() => {
    document.body.style.overflow = revealed ? 'auto' : 'hidden'
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

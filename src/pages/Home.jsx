import WindChimeBars from '../components/home/WindChimeBars'
import TaglinePills from '../components/home/TaglinePills'

function Home() {
  return (
    <main className="bg-background relative flex min-h-screen flex-col items-center justify-center gap-6 overflow-hidden px-4 md:gap-8">
      <WindChimeBars />

      <div className="relative z-10 flex flex-col items-center gap-6 text-center md:gap-8">
        <div className="flex flex-col items-center gap-3 md:gap-4">
          <h1 className="font-display text-ink text-5xl font-bold sm:text-6xl md:text-7xl lg:text-8xl">
            Lavanya Sharma
          </h1>
          <p className="font-hand text-accent-teal squiggle-underline text-2xl md:text-3xl lg:text-4xl">
            product designer
          </p>
        </div>

        <TaglinePills />
      </div>

      <p className="text-footer font-display absolute inset-x-0 bottom-6 text-center text-base md:text-lg">
        Designed by Lavanya 2026
      </p>
    </main>
  )
}

export default Home

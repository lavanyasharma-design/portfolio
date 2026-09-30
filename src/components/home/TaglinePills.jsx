function Pill({ emoji, word }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-lavender px-3 py-1 md:px-4 md:py-1.5">
      <span>{emoji}</span>
      <span>{word}</span>
    </span>
  )
}

function TaglinePills() {
  return (
    <p className="font-hand text-accent-teal flex flex-wrap items-center justify-center gap-2 text-sm md:text-base">
      <Pill emoji="🌻" word="i" />
      <span>design with</span>
      <Pill emoji="☁️" word="reason" />
      <span>sometimes with</span>
      <Pill emoji="🌊" word="wonder" />
    </p>
  )
}

export default TaglinePills

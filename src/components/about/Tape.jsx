import { useId } from 'react'

/**
 * A strip of paper tape (washi / masking tape), drawn after her reference (2026-11-21): matte and speckled,
 * torn at both ends, twisting over itself partway along so the right half lies at a slightly different angle,
 * with a soft shadow under it. Teal: the site's teal/default lifted towards white (About.css, --tape).
 * Drawn in SVG, so it stays crisp at any size; the grain is an SVG noise filter.
 */
function Tape({ className }) {
  const id = useId().replace(/:/g, '')
  return (
    <svg className={className} viewBox="0 0 200 64" aria-hidden="true">
      <defs>
        {/* light across the strip: the left half a touch darker, the right half catching the light after the twist */}
        <linearGradient id={`${id}l`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: 'var(--tape-light)' }} />
          <stop offset="1" style={{ stopColor: 'var(--tape)' }} />
        </linearGradient>
        <linearGradient id={`${id}r`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" style={{ stopColor: 'var(--tape-light)' }} />
          <stop offset=".7" style={{ stopColor: 'var(--tape)' }} />
        </linearGradient>
        {/* the fold: shadowed where it turns under, a bright lip along its edge */}
        <linearGradient id={`${id}f`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" style={{ stopColor: 'var(--tape-dark)' }} />
          <stop offset=".55" style={{ stopColor: 'var(--tape)' }} />
          <stop offset="1" style={{ stopColor: 'var(--tape-light)' }} />
        </linearGradient>
        {/* paper grain: pale specks rubbed into the colour, inside the tape only */}
        <filter id={`${id}g`} x="0" y="0" width="1" height="1">
          <feTurbulence type="fractalNoise" baseFrequency=".95" numOctaves="2" seed="7" result="n" />
          <feColorMatrix in="n" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  1.1 0 0 0 -.52" result="specks" />
          <feComposite in="specks" in2="SourceAlpha" operator="in" result="s" />
          <feMerge><feMergeNode in="SourceGraphic" /><feMergeNode in="s" /></feMerge>
        </filter>
      </defs>
      <g filter={`url(#${id}g)`}>
        {/* left half, torn at its left end */}
        <path fill={`url(#${id}l)`} d="M7 15 L94 13 L99 59 L8 57 L4 52 L9 47 L3 41 L8 35 L2 29 L7 23 L3 18 Z" />
        {/* right half, tilted up a little after the twist, torn at its right end */}
        <path fill={`url(#${id}r)`} d="M104 10 L189 4 L193 9 L188 14 L195 20 L190 26 L196 32 L191 38 L195 44 L190 48 L110 58 Z" />
        {/* the twist where the tape folds over itself */}
        <path fill={`url(#${id}f)`} d="M92 13 L106 9 L112 57 L97 60 Z" />
        <path d="M105.5 10.5 L111 56" stroke="var(--tape-light)" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity=".9" />
        <path d="M93.5 14 L98 58.5" stroke="var(--tape-dark)" strokeWidth="1" strokeLinecap="round" fill="none" opacity=".5" />
      </g>
    </svg>
  )
}

export default Tape

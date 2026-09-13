// Decorative SVG illustration used across the hero and empty sections.
// Kept abstract/ornamental (diya, marigold, arch) rather than a literal deity depiction.
export default function FestiveMotif({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 400" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="glow" cx="50%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#F0A05A" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#F0A05A" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="archGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7A2130" />
          <stop offset="100%" stopColor="#571622" />
        </linearGradient>
      </defs>
      <circle cx="200" cy="150" r="180" fill="url(#glow)" />
      {/* Temple arch */}
      <path d="M80 380 V200 A120 120 0 0 1 320 200 V380" fill="none" stroke="url(#archGrad)" strokeWidth="14" strokeLinecap="round" />
      <path d="M105 380 V205 A95 95 0 0 1 295 205 V380" fill="none" stroke="#C89B45" strokeWidth="3" opacity="0.6" />
      {/* Diya (lamp) */}
      <g transform="translate(200 250)">
        <ellipse cx="0" cy="40" rx="55" ry="16" fill="#C89B45" />
        <path d="M-55 40 Q0 75 55 40 Q40 20 0 20 Q-40 20 -55 40Z" fill="#E07A2C" />
        <path d="M0 20 C-10 5 -6 -12 0 -25 C6 -12 10 5 0 20Z" fill="#F0A05A" />
        <path d="M0 5 C-4 -3 -3 -12 0 -18 C3 -12 4 -3 0 5Z" fill="#FCE2B0" />
      </g>
      {/* Marigold dots */}
      {[...Array(10)].map((_, i) => {
        const angle = (i / 10) * Math.PI * 2
        const r = 150
        const cx = 200 + r * Math.cos(angle)
        const cy = 210 + r * 0.55 * Math.sin(angle)
        return <circle key={i} cx={cx} cy={cy} r="4" fill="#E0A542" opacity="0.7" />
      })}
    </svg>
  )
}

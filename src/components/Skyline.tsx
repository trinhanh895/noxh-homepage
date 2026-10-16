/*
 * Hà Nội social-housing skyline in single-weight line-art: slab towers with window grids,
 * one tower under construction with a crane, the Long Biên bridge truss and a few trees.
 * Strokes draw themselves when scrolled into view ([data-reveal="draw"]); windows fade in after.
 */
const towers: [number, number, number][] = [
  [40, 92, 96],
  [150, 52, 80],
  [244, 108, 110],
  [368, 70, 72],
  [454, 132, 92],
  [560, 40, 70],
  [644, 96, 104],
]

export function Skyline({ className = '' }: { className?: string }) {
  const s = {
    fill: 'none',
    stroke: 'rgb(255 255 255 / 0.16)',
    strokeWidth: 1.5,
    vectorEffect: 'non-scaling-stroke' as const,
    pathLength: 1,
  }
  return (
    <svg data-reveal="draw" className={className} viewBox="0 0 1440 220" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>
        <pattern id="skyline-win" width="16" height="14" patternUnits="userSpaceOnUse">
          <path d="M0 13.5H16M15.5 0V14" stroke="rgb(255 255 255 / 0.08)" strokeWidth="1" />
        </pattern>
      </defs>
      <path className="draw" {...s} d="M0 219H1440" />
      {towers.map(([x, y, w], i) => (
        <g key={i}>
          <rect className="draw-fill" x={x + 8} y={y + 12} width={w - 16} height={207 - y - 12} fill="url(#skyline-win)" />
          <rect className="draw" {...s} x={x} y={y} width={w} height={219 - y} />
        </g>
      ))}
      {/* under construction + tower crane */}
      <path className="draw" {...s} d="M780 219V128H870V219M780 158H870M780 188H870" />
      <path className="draw" {...s} d="M892 219V40M848 48H1004M892 40L932 48M966 48V100M960 100H972" />
      {/* Long Biên bridge truss */}
      <path
        className="draw"
        {...s}
        d="M1024 196H1440M1024 196Q1074 160 1124 196Q1174 160 1224 196Q1274 160 1324 196Q1374 160 1424 196M1049 196L1074 178L1099 196M1149 196L1174 178L1199 196M1249 196L1274 178L1299 196M1349 196L1374 178L1399 196"
      />
      {/* trees */}
      <path className="draw" {...s} d="M736 219V204M736 204a12 12 0 1 1 .1 0M1004 219V206M1004 206a10 10 0 1 1 .1 0M342 219V206M342 206a9 9 0 1 1 .1 0" />
    </svg>
  )
}

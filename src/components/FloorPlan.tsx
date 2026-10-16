/* Schematic floor plan drawn from a room list — stands in until the investor publishes real plan drawings */

export type Room = { x: number; y: number; w: number; h: number; label: string; kind?: 'wet' | 'balcony' }
export type Plan = { width: number; height: number; rooms: Room[] }

const PAD = 24

export function FloorPlan({ plan, mirror = false, title }: { plan: Plan; mirror?: boolean; title: string }) {
  const rooms = mirror ? plan.rooms.map((r) => ({ ...r, x: plan.width - r.x - r.w })) : plan.rooms
  return (
    <svg
      viewBox={`${-PAD} ${-PAD} ${plan.width + PAD * 2} ${plan.height + PAD * 2}`}
      role="img"
      aria-label={title}
      className="h-auto w-full"
    >
      <defs>
        <pattern id="fp-hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="8" stroke="var(--color-primary-500)" strokeOpacity="0.18" strokeWidth="2" />
        </pattern>
      </defs>
      {rooms.map((r) => (
        <g key={r.label + r.x + r.y}>
          <rect
            x={r.x}
            y={r.y}
            width={r.w}
            height={r.h}
            fill={r.kind === 'balcony' ? 'url(#fp-hatch)' : r.kind === 'wet' ? 'var(--color-primary-50)' : '#fff'}
            stroke="var(--color-primary-600)"
            strokeWidth={r.kind === 'balcony' ? 2 : 4}
            strokeDasharray={r.kind === 'balcony' ? '6 4' : undefined}
          />
          <text
            x={r.x + r.w / 2}
            y={r.y + r.h / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={r.kind === 'balcony' ? 13 : 16}
            fontWeight={500}
            fill={r.kind === 'balcony' ? 'var(--color-text-neutral-secondary)' : 'var(--color-text-neutral-primary)'}
          >
            {r.label}
          </text>
        </g>
      ))}
    </svg>
  )
}

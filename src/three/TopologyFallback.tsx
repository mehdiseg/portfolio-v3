import { CATEGORIES } from '../data/projects'
import { TOPO_LINKS, TOPO_NODES } from '../data/topology'

// Version statique (sans WebGL ou en mode performance) : même réseau, projeté en 2D
export function TopologyFallback() {
  const pos = new Map(TOPO_NODES.map((n) => [n.id, { x: n.position[0] * 60, y: -n.position[1] * 60 }]))
  const color = (c: string) => (c === 'core' ? 'var(--muted)' : `var(${CATEGORIES[c as keyof typeof CATEGORIES].cssVar})`)

  return (
    <div className="absolute inset-0 flex items-start justify-center pt-20 lg:items-center lg:justify-end lg:pt-0 lg:pr-[6vw]">
      <svg viewBox="-220 -200 440 400" className="h-[50svh] w-auto max-w-[92vw] opacity-90 lg:h-[70vh]" role="presentation">
        {TOPO_LINKS.map(([a, b]) => {
          const A = pos.get(a)!
          const B = pos.get(b)!
          const node = TOPO_NODES.find((n) => n.id === b)!
          return (
            <line
              key={`${a}-${b}`}
              x1={A.x}
              y1={A.y}
              x2={B.x}
              y2={B.y}
              stroke={color(node.category)}
              strokeOpacity={0.45}
              strokeWidth={1.5}
            />
          )
        })}
        {TOPO_NODES.map((n) => {
          const p = pos.get(n.id)!
          return (
            <g key={n.id}>
              <circle cx={p.x} cy={p.y} r={n.device === 'switch' ? 9 : 7} fill={color(n.category)} />
              <text x={p.x + 12} y={p.y + 4} fontSize={10} fill="var(--muted)" fontFamily="IBM Plex Sans, sans-serif">
                {n.label}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

import './viz.css'
import { useLang } from '../../i18n/lang'

export interface FlowNode {
  id: string
  x: number
  y: number
  w?: number
  h?: number
  label: string
  sub?: string
  tone?: 'rust' | 'js' | 'info' | 'ok' | 'warn' | 'muted'
  shape?: 'box' | 'round' | 'diamond'
}
export interface FlowEdge {
  from: string
  to: string
  label?: string
  dashed?: boolean
  /** 从节点的哪一侧出发 / 到达,默认自动按相对位置 */
  side?: 'h' | 'v'
}

const toneColor: Record<string, { stroke: string; fill: string; text: string }> = {
  rust: { stroke: 'var(--rust-deep)', fill: 'var(--rust-soft)', text: 'var(--rust)' },
  js: { stroke: '#998a23', fill: 'var(--js-soft)', text: '#d9c84a' },
  info: { stroke: 'var(--info)', fill: 'var(--info-soft)', text: 'var(--info)' },
  ok: { stroke: 'var(--ok)', fill: 'var(--ok-soft)', text: 'var(--ok)' },
  warn: { stroke: 'var(--warn)', fill: 'var(--warn-soft)', text: 'var(--warn)' },
  muted: { stroke: 'var(--line-strong)', fill: 'var(--bg-2)', text: 'var(--fg-2)' },
}

export default function Flow({
  nodes,
  edges,
  width = 700,
  height = 300,
}: {
  nodes: FlowNode[]
  edges: FlowEdge[]
  width?: number
  height?: number
}) {
  const lang = useLang()
  const byId = (id: string) => nodes.find((n) => n.id === id)!
  const center = (n: FlowNode) => ({
    cx: n.x + (n.w ?? 130) / 2,
    cy: n.y + (n.h ?? 52) / 2,
  })

  function edgePath(e: FlowEdge) {
    const a = byId(e.from)
    const b = byId(e.to)
    const ac = center(a)
    const bc = center(b)
    const aw = (a.w ?? 130) / 2
    const ah = (a.h ?? 52) / 2
    const bw = (b.w ?? 130) / 2
    const bh = (b.h ?? 52) / 2
    const horizontal = e.side === 'h' || (e.side !== 'v' && Math.abs(bc.cx - ac.cx) >= Math.abs(bc.cy - ac.cy))
    let x1, y1, x2, y2
    if (horizontal) {
      const dir = bc.cx > ac.cx ? 1 : -1
      x1 = ac.cx + dir * aw
      y1 = ac.cy
      x2 = bc.cx - dir * bw
      y2 = bc.cy
    } else {
      const dir = bc.cy > ac.cy ? 1 : -1
      x1 = ac.cx
      y1 = ac.cy + dir * ah
      x2 = bc.cx
      y2 = bc.cy - dir * bh
    }
    const mx = (x1 + x2) / 2
    const my = (y1 + y2) / 2
    const d = horizontal
      ? `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`
      : `M ${x1} ${y1} C ${x1} ${my}, ${x2} ${my}, ${x2} ${y2}`
    return { d, mx, my }
  }

  return (
    <div className="viz">
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" role="img" aria-label={lang === 'en' ? 'flowchart' : '流程图'}>
        <defs>
          <marker id="flow-arrow" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto">
            <path d="M0,0 L7,3 L0,6 Z" fill="var(--fg-2)" />
          </marker>
        </defs>

        {edges.map((e, i) => {
          const { d, mx, my } = edgePath(e)
          return (
            <g key={i}>
              <path
                d={d}
                fill="none"
                stroke="var(--fg-3)"
                strokeWidth={1.6}
                strokeDasharray={e.dashed ? '5 4' : '0'}
                markerEnd="url(#flow-arrow)"
              />
              {e.label && (
                <g>
                  <rect x={mx - e.label.length * 3.6 - 4} y={my - 9} width={e.label.length * 7.2 + 8}
                    height={18} rx={5} fill="var(--bg-0)" stroke="var(--line)" />
                  <text x={mx} y={my + 3.5} fill="var(--fg-2)" fontSize="10.5" textAnchor="middle">
                    {e.label}
                  </text>
                </g>
              )}
            </g>
          )
        })}

        {nodes.map((n) => {
          const w = n.w ?? 130
          const h = n.h ?? 52
          const t = toneColor[n.tone ?? 'muted']
          const isDiamond = n.shape === 'diamond'
          return (
            <g key={n.id}>
              {isDiamond ? (
                <polygon
                  points={`${n.x + w / 2},${n.y} ${n.x + w},${n.y + h / 2} ${n.x + w / 2},${n.y + h} ${n.x},${n.y + h / 2}`}
                  fill={t.fill} stroke={t.stroke} strokeWidth={1.5}
                />
              ) : (
                <rect x={n.x} y={n.y} width={w} height={h}
                  rx={n.shape === 'round' ? h / 2 : 10}
                  fill={t.fill} stroke={t.stroke} strokeWidth={1.5} />
              )}
              <text x={n.x + w / 2} y={n.y + h / 2 + (n.sub ? -2 : 4)}
                fill={t.text} fontSize="12.5" fontWeight="700" textAnchor="middle">
                {n.label}
              </text>
              {n.sub && (
                <text x={n.x + w / 2} y={n.y + h / 2 + 13}
                  fill="var(--fg-3)" fontSize="9.5" textAnchor="middle">
                  {n.sub}
                </text>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

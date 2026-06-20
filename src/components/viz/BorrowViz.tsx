import { useState } from 'react'
import { useLang } from '../../i18n/lang'
import './viz.css'

type Lang = 'zh' | 'en'
type L<T> = Record<Lang, T>

interface Borrow {
  label: string
  mut: boolean
}
interface Scenario {
  id: string
  tab: L<string>
  code: L<string>
  borrows: Borrow[]
  ok: boolean
  verdict: L<JSX.Element>
}

const scenarios: Scenario[] = [
  {
    id: 'shared',
    tab: { zh: '多个 &(只读)', en: 'Many & (read-only)' },
    code: {
      zh: `let s = String::from("hi");
let r1 = &s;
let r2 = &s;
let r3 = &s;
println!("{r1} {r2} {r3}"); // ✅`,
      en: `let s = String::from("hi");
let r1 = &s;
let r2 = &s;
let r3 = &s;
println!("{r1} {r2} {r3}"); // ✅`,
    },
    borrows: [
      { label: '&s (r1)', mut: false },
      { label: '&s (r2)', mut: false },
      { label: '&s (r3)', mut: false },
    ],
    ok: true,
    verdict: {
      zh: (
        <>
          <b>允许。</b>可以同时存在<b>任意多个</b>不可变借用 —— 大家都只读,谁也改不了,自然不会冲突。
          类比:多个读者同时看同一份只读文档。
        </>
      ),
      en: (
        <>
          <b>Allowed.</b> You can have <b>any number</b> of immutable borrows at once —— everyone only reads,
          nobody can mutate, so there's nothing to conflict over. Think of many readers viewing the same
          read-only document.
        </>
      ),
    },
  },
  {
    id: 'one-mut',
    tab: { zh: '一个 &mut(可写)', en: 'One &mut (writable)' },
    code: {
      zh: `let mut s = String::from("hi");
let r = &mut s;
r.push_str(" there"); // ✅`,
      en: `let mut s = String::from("hi");
let r = &mut s;
r.push_str(" there"); // ✅`,
    },
    borrows: [{ label: '&mut s (r)', mut: true }],
    ok: true,
    verdict: {
      zh: (
        <>
          <b>允许。</b>同一时刻只有<b>一个</b>可变借用时是安全的 —— 唯一的写入者,不存在并发修改。
        </>
      ),
      en: (
        <>
          <b>Allowed.</b> A <b>single</b> mutable borrow at a time is safe —— there's exactly one writer,
          so there's no concurrent modification.
        </>
      ),
    },
  },
  {
    id: 'mut-plus-shared',
    tab: { zh: '&mut 与 & 同时', en: '&mut and & together' },
    code: {
      zh: `let mut s = String::from("hi");
let r1 = &s;        // 只读借用
let r2 = &mut s;    // ❌ 可变借用
println!("{r1} {r2}");`,
      en: `let mut s = String::from("hi");
let r1 = &s;        // immutable borrow
let r2 = &mut s;    // ❌ mutable borrow
println!("{r1} {r2}");`,
    },
    borrows: [
      { label: '&s (r1)', mut: false },
      { label: '&mut s (r2)', mut: true },
    ],
    ok: false,
    verdict: {
      zh: (
        <>
          <b>报错</b>:<code>cannot borrow `s` as mutable because it is also borrowed as immutable</code>。
          如果 <code>r2</code> 改了数据,正在读的 <code>r1</code> 就会看到「脚下数据被换掉」—— 这正是 JS 里
          迭代时修改数组导致 bug 的根源,Rust 直接禁止。
        </>
      ),
      en: (
        <>
          <b>Error</b>: <code>cannot borrow `s` as mutable because it is also borrowed as immutable</code>.
          If <code>r2</code> mutated the data, <code>r1</code> —— which is still reading —— would see the ground
          shift under its feet. That's exactly the class of bug you get in JS when you mutate an array while
          iterating it, and Rust forbids it outright.
        </>
      ),
    },
  },
  {
    id: 'two-mut',
    tab: { zh: '两个 &mut', en: 'Two &mut' },
    code: {
      zh: `let mut s = String::from("hi");
let r1 = &mut s;
let r2 = &mut s;   // ❌
println!("{r1} {r2}");`,
      en: `let mut s = String::from("hi");
let r1 = &mut s;
let r2 = &mut s;   // ❌
println!("{r1} {r2}");`,
    },
    borrows: [
      { label: '&mut s (r1)', mut: true },
      { label: '&mut s (r2)', mut: true },
    ],
    ok: false,
    verdict: {
      zh: (
        <>
          <b>报错</b>:<code>cannot borrow `s` as mutable more than once</code>。两个写入者 = 潜在的数据竞争。
          Rust 的铁律:<b>要么多个只读,要么唯一一个可写,二者不可兼得。</b>
        </>
      ),
      en: (
        <>
          <b>Error</b>: <code>cannot borrow `s` as mutable more than once</code>. Two writers = a potential data
          race. Rust's iron rule: <b>either many readers or exactly one writer —— never both at once.</b>
        </>
      ),
    },
  },
]

export default function BorrowViz() {
  const lang = useLang()
  const [active, setActive] = useState(0)
  const sc = scenarios[active]
  const cx = 130
  const cy = 70

  return (
    <div className="viz">
      <div className="scenario-tabs">
        {scenarios.map((s, i) => (
          <button
            key={s.id}
            className={`scenario-tab ${i === active ? 'active' : ''}`}
            onClick={() => setActive(i)}
          >
            {s.tab[lang]}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'center' }}>
        <svg viewBox="0 0 360 200" width="100%" role="img" aria-label={lang === 'en' ? 'Borrow relationship diagram' : '借用关系图'}>
          {/* 所有者 */}
          <rect x={cx - 60} y={cy - 26} width={120} height={52} rx={10}
            fill="var(--rust-soft)" stroke="var(--rust)" strokeWidth={1.6} />
          <text x={cx} y={cy - 4} fill="var(--rust)" fontSize="14" fontWeight="700" textAnchor="middle">
            s
          </text>
          <text x={cx} y={cy + 13} fill="var(--fg-3)" fontSize="9.5" textAnchor="middle">
            {lang === 'en' ? 'owner · owns the data' : 'owner · 拥有数据'}
          </text>

          {sc.borrows.map((b, i) => {
            const n = sc.borrows.length
            const bx = 60 + (i * (240 / Math.max(n - 1, 1)))
            const by = 168
            const col = b.mut ? 'var(--warn)' : 'var(--info)'
            const conflict = !sc.ok
            return (
              <g key={i}>
                <line
                  x1={cx} y1={cy + 26} x2={bx} y2={by - 22}
                  stroke={col} strokeWidth={b.mut ? 2.4 : 1.6}
                  strokeDasharray={conflict ? '5 4' : '0'}
                  markerEnd={`url(#bh-${b.mut ? 'mut' : 'shared'})`}
                />
                <rect x={bx - 48} y={by - 20} width={96} height={40} rx={8}
                  fill={b.mut ? 'var(--warn-soft)' : 'var(--info-soft)'}
                  stroke={col} strokeWidth={1.4} />
                <text x={bx} y={by + 5} fill={col} fontSize="11.5" fontWeight="700" textAnchor="middle">
                  {b.label}
                </text>
                {conflict && (
                  <text x={bx} y={by - 28} fill="var(--err)" fontSize="14" textAnchor="middle">⚡</text>
                )}
              </g>
            )
          })}

          <defs>
            <marker id="bh-shared" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="var(--info)" />
            </marker>
            <marker id="bh-mut" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="var(--warn)" />
            </marker>
          </defs>
        </svg>

        <div>
          <pre style={{
            margin: 0, fontFamily: 'var(--font-mono)', fontSize: '0.78rem',
            background: 'var(--bg-2)', border: '1px solid var(--line)',
            borderRadius: 8, padding: '10px 12px', color: 'var(--fg-1)',
            whiteSpace: 'pre-wrap', lineHeight: 1.55,
          }}>
            {sc.code[lang]}
          </pre>
        </div>
      </div>

      <div className="mem-legend">
        <span><i style={{ background: 'var(--info)' }} />{lang === 'en' ? '&T immutable borrow (read-only)' : '&T 不可变借用(只读)'}</span>
        <span><i style={{ background: 'var(--warn)' }} />{lang === 'en' ? '&mut T mutable borrow (writable)' : '&mut T 可变借用(可写)'}</span>
      </div>

      <div className={`scenario-verdict ${sc.ok ? 'ok' : 'err'}`}>
        <span>{sc.ok ? '✅' : '🛑'}</span>
        <div>{sc.verdict[lang]}</div>
      </div>
    </div>
  )
}

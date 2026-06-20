import { useState } from 'react'
import { useLang } from '../../i18n/lang'
import './viz.css'

interface Bar {
  label: string
  /** 起止格(0..10 的时间轴) */
  start: number
  end: number
  color: string
  kind: 'owner' | 'ref'
}
interface Scene {
  id: string
  tab: string
  code: string
  bars: Bar[]
  ok: boolean
  verdict: JSX.Element
}

const buildScenes = (lang: 'zh' | 'en'): Scene[] => [
  {
    id: 'ok',
    tab: lang === 'en' ? '✅ Valid' : '✅ 合法',
    code: lang === 'en'
      ? `let s = String::from("hi"); // s is born
let r = &s;                  // r borrows s
println!("{r}");             // use r
// r ends here
// s ends here`
      : `let s = String::from("hi"); // s 诞生
let r = &s;                  // r 借用 s
println!("{r}");             // 用 r
// r 在这里结束
// s 在这里结束`,
    bars: [
      { label: "s (owner)", start: 1, end: 9, color: 'var(--rust)', kind: 'owner' },
      { label: "r = &s", start: 2, end: 7, color: 'var(--info)', kind: 'ref' },
    ],
    ok: true,
    verdict: lang === 'en' ? (
      <>
        The reference <code>r</code>'s lifetime is <b>fully contained within</b> <code>s</code>'s lifetime.
        The borrow checker is happy: as long as a reference "doesn't outlive its data", it's safe.
        That's the whole intuition behind lifetimes.
      </>
    ) : (
      <>
        引用 <code>r</code> 的存活区间<b>完全包含在</b> <code>s</code> 的存活区间内。借用检查器满意:
        只要引用「活得不比数据久」,就安全。这就是生命周期的全部直觉。
      </>
    ),
  },
  {
    id: 'dangle',
    tab: lang === 'en' ? '🛑 Dangling' : '🛑 悬垂',
    code: lang === 'en'
      ? `let r;                       // r wants to live long
{
    let s = String::from("hi"); // s lives in a small scope
    r = &s;                     // r borrows s
}                               // ❌ s dies right here
println!("{r}");                // but r still wants it → dangling!`
      : `let r;                       // r 想活很久
{
    let s = String::from("hi"); // s 在小作用域里
    r = &s;                     // r 借用 s
}                               // ❌ s 在这里就死了
println!("{r}");                // r 却还想用 → 悬垂!`,
    bars: [
      { label: lang === 'en' ? "r (ref)" : "r (引用)", start: 1, end: 9, color: 'var(--err)', kind: 'ref' },
      { label: "s (owner)", start: 3, end: 6, color: 'var(--rust)', kind: 'owner' },
    ],
    ok: false,
    verdict: lang === 'en' ? (
      <>
        <code>r</code> wants to live to cell 9, but the <code>s</code> it borrows is dropped at cell 6.
        The reference <b>outlives its data</b> → a dangling reference. Rust reports{' '}
        <code>`s` does not live long enough</code> at <b>compile time</b> and won't even let you run it.
        In C this is the classic use-after-free bug.
      </>
    ) : (
      <>
        <code>r</code> 想活到第 9 格,但它借用的 <code>s</code> 第 6 格就被 drop 了。
        引用<b>比数据活得久</b> → 悬垂引用。Rust 在<b>编译期</b>报 <code>`s` does not live long enough</code>,
        根本不让你跑。C 里这是经典 use-after-free 漏洞。
      </>
    ),
  },
  {
    id: 'generic',
    tab: lang === 'en' ? "'a in functions" : "函数里的 'a",
    code: lang === 'en'
      ? `// 'a ties "the returned reference" to "the argument references"
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() { x } else { y }
}
// meaning: the return value lives no longer than the shorter of x, y`
      : `// 'a 把「返回的引用」和「参数的引用」绑在一起
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() { x } else { y }
}
// 含义:返回值活得不超过 x、y 中较短的那个`,
    bars: [
      { label: "x: &'a str", start: 1, end: 8, color: 'var(--info)', kind: 'ref' },
      { label: "y: &'a str", start: 1, end: 6, color: 'var(--info)', kind: 'ref' },
      { label: lang === 'en' ? "returns &'a" : "返回 &'a", start: 1, end: 6, color: 'var(--ok)', kind: 'ref' },
    ],
    ok: true,
    verdict: lang === 'en' ? (
      <>
        When a function returns a reference, the compiler can't tell on its own which argument it came from,
        so you annotate the relationship with <code>{"'a"}</code>: <b>"the return value's lifetime = the shorter
        of the two arguments"</b>. <code>{"'a"}</code> doesn't change how long anything lives — it only{' '}
        <b>describes</b> the constraint so the compiler can verify safety.
      </>
    ) : (
      <>
        当函数返回引用,编译器无法自动判断它来自哪个参数,就需要你用 <code>'a</code> <b>标注关系</b>:
        「返回值的生命周期 = 两个入参里较短的那个」。<code>'a</code> 不改变任何东西的存活时间,只是<b>描述</b>约束,
        让编译器能验证安全性。
      </>
    ),
  },
]

const GRID = 10
const X0 = 110
const X1 = 460
const cellW = (X1 - X0) / GRID

export default function LifetimeViz() {
  const lang = useLang()
  const scenes = buildScenes(lang)
  const [active, setActive] = useState(0)
  const sc = scenes[active]
  const rowY = (i: number) => 50 + i * 44

  return (
    <div className="viz">
      <div className="scenario-tabs">
        {scenes.map((s, i) => (
          <button key={s.id} className={`scenario-tab ${i === active ? 'active' : ''}`}
            onClick={() => setActive(i)}>
            {s.tab}
          </button>
        ))}
      </div>

      <svg viewBox="0 0 480 200" width="100%" role="img"
        aria-label={lang === 'en' ? 'Lifetime timeline' : '生命周期时间轴'}>
        {/* 时间轴箭头 */}
        <text x={10} y={28} fill="var(--fg-2)" fontSize="11" fontWeight="700">
          {lang === 'en' ? 'time / scope →' : '时间 / 作用域 →'}
        </text>
        <line x1={X0} y1={34} x2={X1 + 6} y2={34} stroke="var(--line-strong)" strokeWidth={1} />
        {Array.from({ length: GRID + 1 }, (_, i) => (
          <line key={i} x1={X0 + i * cellW} y1={31} x2={X0 + i * cellW} y2={170}
            stroke="var(--line)" strokeWidth={0.5} strokeDasharray="2 3" />
        ))}

        {/* 生命周期条 */}
        {sc.bars.map((b, i) => {
          const y = rowY(i)
          const x = X0 + b.start * cellW
          const w = (b.end - b.start) * cellW
          return (
            <g key={b.label}>
              <text x={10} y={y + 15} fill={b.color} fontSize="11" fontWeight="700">{b.label}</text>
              <rect x={x} y={y} width={w} height={22} rx={6}
                fill={b.color} opacity={0.22} stroke={b.color} strokeWidth={1.5} />
              {/* 起止端点 */}
              <circle cx={x} cy={y + 11} r={3} fill={b.color} />
              <circle cx={x + w} cy={y + 11} r={3} fill={b.color} />
            </g>
          )
        })}

        {/* 悬垂场景:画一条「越界」标记 */}
        {!sc.ok && (
          <g>
            <line x1={X0 + 6 * cellW} y1={40} x2={X0 + 6 * cellW} y2={170}
              stroke="var(--err)" strokeWidth={1.5} strokeDasharray="4 3" />
            <text x={X0 + 6 * cellW + 4} y={165} fill="var(--err)" fontSize="10">
              {lang === 'en' ? 's dies here' : 's 在此死亡'}
            </text>
          </g>
        )}
      </svg>

      <div className={`scenario-verdict ${sc.ok ? 'ok' : 'err'}`}>
        <span>{sc.ok ? '✅' : '🛑'}</span>
        <div>{sc.verdict}</div>
      </div>

      <pre style={{
        marginTop: 12, fontFamily: 'var(--font-mono)', fontSize: '0.76rem',
        background: 'var(--bg-2)', border: '1px solid var(--line)',
        borderRadius: 8, padding: '10px 12px', color: 'var(--fg-1)',
        whiteSpace: 'pre-wrap', lineHeight: 1.5,
      }}>
        {sc.code}
      </pre>
    </div>
  )
}

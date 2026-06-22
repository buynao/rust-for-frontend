import { motion } from 'framer-motion'
import { useSteps, StepperControls } from './Stepper'
import { useLang } from '../../i18n/lang'
import './viz.css'

interface Frame {
  code: string
  owners: string[]   // 当前持有 Rc 句柄的变量名 / variables currently holding an Rc handle
  count: number      // 引用计数 / reference count
  alive: boolean
  caption: JSX.Element
}

const framesZh: Frame[] = [
  {
    code: 'let a = Rc::new(Node);',
    owners: ['a'],
    count: 1,
    alive: true,
    caption: (
      <>
        <code>Rc::new</code> 在堆上放一个值,并附带一个<b>引用计数器</b>。现在 <code>a</code> 是唯一持有者,
        计数 = <b>1</b>。<code>Rc</code> = Reference Counted(引用计数)。
      </>
    ),
  },
  {
    code: 'let b = Rc::clone(&a);',
    owners: ['a', 'b'],
    count: 2,
    alive: true,
    caption: (
      <>
        <code>Rc::clone</code> <b>不复制堆数据</b>,只是再发一个指向同一份数据的句柄,并把计数 +1 → <b>2</b>。
        类比 JS 里两个变量指向同一个对象,只是这里计数是显式的。
      </>
    ),
  },
  {
    code: 'let c = Rc::clone(&a);',
    owners: ['a', 'b', 'c'],
    count: 3,
    alive: true,
    caption: (
      <>
        再共享一次,计数 = <b>3</b>。三个变量<b>共享只读所有权</b> —— 这正是单一所有权做不到、需要 <code>Rc</code> 的场景
        (如图、树里一个节点被多处引用)。
      </>
    ),
  },
  {
    code: '} // c 离开作用域',
    owners: ['a', 'b'],
    count: 2,
    alive: true,
    caption: (
      <>
        <code>c</code> 被 drop,计数 -1 → <b>2</b>。<b>数据还没释放</b>,因为还有人在用。
      </>
    ),
  },
  {
    code: '} // b 离开作用域',
    owners: ['a'],
    count: 1,
    alive: true,
    caption: (
      <>
        <code>b</code> 也走了,计数 → <b>1</b>。依旧存活。
      </>
    ),
  },
  {
    code: '} // a 离开作用域',
    owners: [],
    count: 0,
    alive: false,
    caption: (
      <>
        最后一个持有者 <code>a</code> 离开,计数归 <b>0</b> —— 此刻 Rust <b>自动释放</b>堆数据。
        没有 GC,靠的就是「计数到 0 即 drop」。注意:<code>Rc</code> 只能在<b>单线程</b>用,多线程要用 <code>Arc</code>。
      </>
    ),
  },
]

const framesEn: Frame[] = [
  {
    code: 'let a = Rc::new(Node);',
    owners: ['a'],
    count: 1,
    alive: true,
    caption: (
      <>
        <code>Rc::new</code> puts a value on the heap with a <b>reference counter</b> attached. Right now <code>a</code> is
        the only holder, so the count = <b>1</b>. <code>Rc</code> = Reference Counted.
      </>
    ),
  },
  {
    code: 'let b = Rc::clone(&a);',
    owners: ['a', 'b'],
    count: 2,
    alive: true,
    caption: (
      <>
        <code>Rc::clone</code> <b>doesn't copy the heap data</b> — it just hands out another handle to the same data and
        bumps the count by 1 → <b>2</b>. Like two JS variables pointing at the same object, except the count is explicit here.
      </>
    ),
  },
  {
    code: 'let c = Rc::clone(&a);',
    owners: ['a', 'b', 'c'],
    count: 3,
    alive: true,
    caption: (
      <>
        Share it once more, count = <b>3</b>. Three variables now have <b>shared read-only ownership</b> — exactly the case
        single ownership can't handle and where you reach for <code>Rc</code> (e.g. one node referenced from many places in a graph or tree).
      </>
    ),
  },
  {
    code: '} // c leaves scope',
    owners: ['a', 'b'],
    count: 2,
    alive: true,
    caption: (
      <>
        <code>c</code> is dropped, count -1 → <b>2</b>. The <b>data isn't freed yet</b> — someone is still using it.
      </>
    ),
  },
  {
    code: '} // b leaves scope',
    owners: ['a'],
    count: 1,
    alive: true,
    caption: (
      <>
        <code>b</code> is gone too, count → <b>1</b>. Still alive.
      </>
    ),
  },
  {
    code: '} // a leaves scope',
    owners: [],
    count: 0,
    alive: false,
    caption: (
      <>
        The last holder <code>a</code> leaves, the count hits <b>0</b> — and right then Rust <b>frees the heap data automatically</b>.
        No GC; it's simply "count reaches 0, so drop". Note: <code>Rc</code> is <b>single-threaded</b> only; use <code>Arc</code> across threads.
      </>
    ),
  },
]

export default function RcViz() {
  const lang = useLang()
  const frames = lang === 'en' ? framesEn : framesZh
  const { step, next, prev, reset, go } = useSteps(frames.length)
  const f = frames[step]
  const slots = ['a', 'b', 'c']

  return (
    <div className="viz">
      <svg viewBox="0 0 480 230" width="100%" role="img" aria-label={lang === 'en' ? 'Rc reference counting diagram' : 'Rc 引用计数示意'}>
        {/* 栈上的句柄 / stack handles */}
        <text x={30} y={28} fill="var(--fg-2)" fontSize="12" fontWeight="700">{lang === 'en' ? 'Stack · Rc handles' : '栈 · Rc 句柄'}</text>
        {slots.map((name, i) => {
          const has = f.owners.includes(name)
          const y = 46 + i * 56
          return (
            <g key={name}>
              <motion.rect
                x={30} y={y} width={96} height={42} rx={8}
                animate={{ opacity: has ? 1 : 0.25 }}
                fill={has ? 'rgba(106,166,255,0.12)' : 'rgba(120,120,120,0.05)'}
                stroke={has ? 'var(--info)' : 'var(--fg-3)'}
                strokeWidth={1.5}
                strokeDasharray={has ? '0' : '5 4'} />
              <text x={48} y={y + 26} fill={has ? 'var(--info)' : 'var(--fg-3)'}
                fontSize="14" fontWeight="700">{name}</text>
              {/* 指向堆的连线 */}
              {has && f.alive && (
                <motion.path
                  d={`M 126 ${y + 21} C 200 ${y + 21}, 250 115, 300 115`}
                  fill="none" stroke="var(--rust)" strokeWidth={1.6}
                  markerEnd="url(#rc-arrow)"
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                  transition={{ duration: 0.4 }} />
              )}
            </g>
          )
        })}

        {/* 堆数据 + 计数器 / heap data + counter */}
        <text x={300} y={28} fill="var(--fg-2)" fontSize="12" fontWeight="700">{lang === 'en' ? 'Heap · shared data' : '堆 · 共享数据'}</text>
        {f.alive ? (
          <g>
            <rect x={300} y={70} width={150} height={90} rx={12}
              fill="var(--rust-soft)" stroke="var(--rust-deep)" strokeWidth={1.6} />
            <text x={375} y={100} fill="var(--rust)" fontSize="15" fontWeight="700" textAnchor="middle">
              {lang === 'en' ? 'Node data' : 'Node 数据'}
            </text>
            {/* 计数徽章 */}
            <motion.g key={f.count} initial={{ scale: 0.6 }} animate={{ scale: 1 }}>
              <circle cx={375} cy={132} r={17}
                fill="var(--bg-0)" stroke="var(--ok)" strokeWidth={2} />
              <text x={375} y={138} fill="var(--ok)" fontSize="16" fontWeight="800" textAnchor="middle">
                {f.count}
              </text>
            </motion.g>
            <text x={375} y={172} fill="var(--fg-3)" fontSize="9.5" textAnchor="middle">
              strong_count
            </text>
          </g>
        ) : (
          <g>
            <rect x={300} y={70} width={150} height={90} rx={12}
              fill="none" stroke="var(--fg-3)" strokeDasharray="5 4" />
            <text x={375} y={120} fill="var(--fg-3)" fontSize="13" textAnchor="middle">
              {lang === 'en' ? 'count = 0, freed' : '计数=0,已释放'}
            </text>
          </g>
        )}

        <defs>
          <marker id="rc-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="var(--rust)" />
          </marker>
        </defs>
      </svg>

      <div key={step} className="viz-caption-line">
        <code style={{ display: 'block', marginBottom: 6, color: 'var(--rust)' }}>{f.code}</code>
        {f.caption}
      </div>

      <StepperControls step={step} total={frames.length} onPrev={prev} onNext={next} onReset={reset} onGo={go} />
    </div>
  )
}

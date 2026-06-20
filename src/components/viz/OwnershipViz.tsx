import { motion } from 'framer-motion'
import { useSteps, StepperControls } from './Stepper'
import { useLang } from '../../i18n/lang'
import './viz.css'

interface VarBox {
  name: string
  valid: boolean
  /** 是否指向堆 */
  toHeap: boolean
}
interface Frame {
  code: string
  caption: JSX.Element
  vars: VarBox[]
  heapAlive: boolean
  error?: boolean
}

const buildFrames = (lang: 'zh' | 'en'): Frame[] => [
  {
    code: lang === 'en' ? 'let s1 = String::from("hi");' : 'let s1 = String::from("hi");',
    caption:
      lang === 'en' ? (
        <>
          Create a <code>String</code>. It has three parts: the pointer / length / capacity live <b>on the stack</b>,
          while the actual character data <code>"hi"</code> lives <b>on the heap</b>. <code>s1</code> is the “owner” of that heap memory.
        </>
      ) : (
        <>
          创建一个 <code>String</code>。它分三部分:<b>栈上</b>存指针 / 长度 / 容量,
          真正的字符数据 <code>"hi"</code> 在<b>堆上</b>。<code>s1</code> 是这块堆内存的「所有者」。
        </>
      ),
    vars: [{ name: 's1', valid: true, toHeap: true }],
    heapAlive: true,
  },
  {
    code: 'let s2 = s1;',
    caption:
      lang === 'en' ? (
        <>
          This is neither a shallow copy nor a deep copy — it’s a <b>move</b>. The stack pointer is copied into{' '}
          <code>s2</code>, but Rust immediately marks <code>s1</code> as <b>invalid</b> — the heap data always has exactly one owner.
        </>
      ) : (
        <>
          这不是浅拷贝,也不是深拷贝,而是 <b>move(移动)</b>。栈上的指针被复制给{' '}
          <code>s2</code>,但 Rust 立刻把 <code>s1</code> 标记为<b>失效</b> —— 堆数据始终只有一个所有者。
        </>
      ),
    vars: [
      { name: 's1', valid: false, toHeap: true },
      { name: 's2', valid: true, toHeap: true },
    ],
    heapAlive: true,
  },
  {
    code: lang === 'en' ? 'println!("{}", s1); // ❌' : 'println!("{}", s1); // ❌',
    caption:
      lang === 'en' ? (
        <>
          The compiler errors: <code>borrow of moved value: `s1`</code>. In JS this line would run, but
          Rust catches “using a value that’s already been moved” <b>at compile time</b> — eliminating dangling pointers / double frees at the root.
        </>
      ) : (
        <>
          编译器报错:<code>borrow of moved value: `s1`</code>。在 JS 里这行能跑,
          但 Rust 在<b>编译期</b>就拦下了「使用已被移动的值」—— 从根上杜绝了悬垂指针 / double free。
        </>
      ),
    vars: [
      { name: 's1', valid: false, toHeap: true },
      { name: 's2', valid: true, toHeap: true },
    ],
    heapAlive: true,
    error: true,
  },
  {
    code: lang === 'en' ? '} // s2 goes out of scope' : '} // s2 离开作用域',
    caption:
      lang === 'en' ? (
        <>
          When <code>s2</code> goes out of scope, Rust automatically calls <code>drop</code> to free that heap memory —
          no GC, and no manual <code>free</code> to write. This rule is called <b>RAII</b>.
        </>
      ) : (
        <>
          当 <code>s2</code> 离开作用域,Rust 自动调用 <code>drop</code> 释放那块堆内存 ——
          没有 GC,也不用你手写 <code>free</code>。这套规则叫 <b>RAII</b>。
        </>
      ),
    vars: [{ name: 's2', valid: false, toHeap: false }],
    heapAlive: false,
  },
]

const STACK_X = 40
const HEAP_X = 320
const ROW_Y = (i: number) => 70 + i * 70

export default function OwnershipViz() {
  const lang = useLang()
  const frames = buildFrames(lang)
  const { step, next, prev, reset, go } = useSteps(frames.length)
  const f = frames[step]

  return (
    <div className="viz">
      <svg
        viewBox="0 0 520 260"
        width="100%"
        role="img"
        aria-label={lang === 'en' ? 'Diagram of ownership move' : '所有权移动示意图'}
      >
        {/* 区域标签 */}
        <text x={STACK_X} y={36} fill="var(--fg-2)" fontSize="13" fontWeight="700">
          {lang === 'en' ? 'STACK' : '栈 STACK'}
        </text>
        <text x={HEAP_X} y={36} fill="var(--fg-2)" fontSize="13" fontWeight="700">
          {lang === 'en' ? 'HEAP' : '堆 HEAP'}
        </text>
        <rect x={STACK_X - 12} y={46} width={230} height={190} rx={10}
          fill="rgba(106,166,255,0.05)" stroke="var(--line)" />
        <rect x={HEAP_X - 12} y={46} width={188} height={190} rx={10}
          fill="rgba(222,165,132,0.05)" stroke="var(--line)" />

        {/* 堆块 */}
        {f.heapAlive ? (
          <motion.g
            initial={false}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <rect x={HEAP_X} y={86} width={150} height={48} rx={8}
              fill="var(--rust-soft)" stroke="var(--rust-deep)" strokeWidth={1.5} />
            <text x={HEAP_X + 14} y={106} fill="var(--rust)" fontSize="15" fontWeight="700">
              "hi"
            </text>
            <text x={HEAP_X + 14} y={123} fill="var(--fg-3)" fontSize="10">
              {lang === 'en' ? '0x1f04 · char data' : '0x1f04 · 字符数据'}
            </text>
          </motion.g>
        ) : (
          <g>
            <rect x={HEAP_X} y={86} width={150} height={48} rx={8}
              fill="none" stroke="var(--fg-3)" strokeDasharray="4 4" />
            <text x={HEAP_X + 30} y={114} fill="var(--fg-3)" fontSize="12">
              {lang === 'en' ? 'freed' : '已释放 freed'}
            </text>
          </g>
        )}

        {/* 变量盒 + 指针 */}
        {f.vars.map((v, i) => {
          const y = ROW_Y(i)
          const color = v.valid ? 'var(--info)' : 'var(--fg-3)'
          return (
            <g key={v.name}>
              <motion.rect
                layout
                x={STACK_X}
                y={y}
                width={120}
                height={44}
                rx={8}
                fill={v.valid ? 'rgba(106,166,255,0.12)' : 'rgba(120,120,120,0.06)'}
                stroke={color}
                strokeWidth={1.5}
                strokeDasharray={v.valid ? '0' : '5 4'}
                animate={{ opacity: v.valid ? 1 : 0.5 }}
              />
              <text x={STACK_X + 14} y={y + 20} fill={color} fontSize="15" fontWeight="700">
                {v.name}
              </text>
              <text x={STACK_X + 14} y={y + 36} fill="var(--fg-3)" fontSize="9.5">
                {v.toHeap ? 'ptr →' : '—'}
              </text>
              {!v.valid && v.name === 's1' && (
                <text x={STACK_X + 64} y={y + 28} fill="var(--err)" fontSize="11" fontWeight="700">
                  ✗ moved
                </text>
              )}
              {/* 指向堆的箭头 */}
              {v.toHeap && f.heapAlive && (
                <motion.path
                  d={`M ${STACK_X + 122} ${y + 22} C ${STACK_X + 200} ${y + 22}, ${HEAP_X - 60} 110, ${HEAP_X - 2} 110`}
                  fill="none"
                  stroke={v.valid ? 'var(--rust)' : 'var(--fg-3)'}
                  strokeWidth={v.valid ? 2 : 1.2}
                  strokeDasharray={v.valid ? '0' : '4 4'}
                  markerEnd="url(#arrowhead)"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1, opacity: v.valid ? 1 : 0.4 }}
                  transition={{ duration: 0.5 }}
                />
              )}
            </g>
          )
        })}

        <defs>
          <marker id="arrowhead" markerWidth="9" markerHeight="9" refX="7" refY="3"
            orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L7,3 L0,6 Z" fill="var(--rust)" />
          </marker>
        </defs>
      </svg>

      <div className={`viz-caption-line ${f.error ? 'is-error' : ''}`}
        style={f.error ? { borderLeftColor: 'var(--err)' } : undefined}>
        <code style={{ display: 'block', marginBottom: 6, color: f.error ? 'var(--err)' : 'var(--rust)' }}>
          {f.code}
        </code>
        {f.caption}
      </div>

      <StepperControls
        step={step}
        total={frames.length}
        onPrev={prev}
        onNext={next}
        onReset={reset}
        onGo={go}
      />
    </div>
  )
}

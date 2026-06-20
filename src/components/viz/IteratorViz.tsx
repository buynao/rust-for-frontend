import { motion } from 'framer-motion'
import { useSteps, StepperControls } from './Stepper'
import { useLang, type Lang } from '../../i18n/lang'
import './viz.css'

/* 演示惰性迭代器:  (1..=5).filter(|x| x%2==0).map(|x| x*x).sum()
   逐个元素被「拉」过流水线,看清惰性与短路。 */

interface Frame {
  source: number[]         // 还未消费的源
  current: number | null   // 当前在管道里的值
  stage: 'idle' | 'filter' | 'map' | 'drop' | 'add'
  mapped: number | null
  passed: boolean
  acc: number
  caption: JSX.Element
}

function buildFrames(lang: Lang): Frame[] {
  const src = [1, 2, 3, 4, 5]
  const frames: Frame[] = [
    {
      source: [...src], current: null, stage: 'idle', mapped: null, passed: false, acc: 0,
      caption:
        lang === 'en' ? (
          <>
            The pipeline is set up, but <b>nothing has moved yet</b>. Rust iterators are <b>lazy</b> —
            until you call a "consumer" like <code>.sum()</code>, the <code>filter</code>/<code>map</code> adapters never run.
          </>
        ) : (
          <>
            管道已搭好,但<b>一个元素都还没动</b>。Rust 的迭代器是<b>惰性的</b> ——
            在调用 <code>.sum()</code> 这种「消费者」之前,<code>filter</code>/<code>map</code> 不会执行。
          </>
        ),
    },
  ]
  let acc = 0
  let remaining = [...src]
  for (const x of src) {
    remaining = remaining.slice(1)
    const even = x % 2 === 0
    frames.push({
      source: remaining, current: x, stage: 'filter', mapped: null, passed: even, acc,
      caption:
        lang === 'en' ? (
          <>
            Pull <code>{x}</code> into <code>filter(|x| x % 2 == 0)</code>:
            {even ? <> <b>{x} is even, passes ✅</b></> : <> <b>{x} is odd, dropped ✗</b>, so we pull the next one right away.</>}
          </>
        ) : (
          <>
            拉取 <code>{x}</code> 进入 <code>filter(|x| x % 2 == 0)</code>:
            {even ? <> <b>{x} 是偶数,通过 ✅</b></> : <> <b>{x} 是奇数,被丢弃 ✗</b>,直接拉下一个。</>}
          </>
        ),
    })
    if (even) {
      const m = x * x
      frames.push({
        source: remaining, current: x, stage: 'map', mapped: m, passed: true, acc,
        caption:
          lang === 'en' ? (
            <>
              <code>{x}</code> enters <code>map(|x| x * x)</code> and becomes <code>{m}</code>.
              Note: each element goes <b>all the way through</b> (filter→map→sum) before we pull the next one — we don't filter the whole array first and then map.
            </>
          ) : (
            <>
              <code>{x}</code> 进入 <code>map(|x| x * x)</code>,变成 <code>{m}</code>。
              注意:每个元素是<b>一路走到底</b>(filter→map→sum)才回头拉下一个,而不是先把整个数组 filter 完再 map。
            </>
          ),
      })
      acc += m
      frames.push({
        source: remaining, current: x, stage: 'add', mapped: m, passed: true, acc,
        caption:
          lang === 'en' ? (
            <>
              <code>sum</code> adds <code>{m}</code> into the running total: <code>{acc - m} + {m} = {acc}</code>.
            </>
          ) : (
            <>
              <code>sum</code> 把 <code>{m}</code> 累加进结果:<code>{acc - m} + {m} = {acc}</code>。
            </>
          ),
      })
    }
  }
  frames.push({
    source: [], current: null, stage: 'idle', mapped: null, passed: false, acc,
    caption:
      lang === 'en' ? (
        <>
          The source is exhausted and <code>.sum()</code> returns <b><code>{acc}</code></b>. The whole chain <b>iterates only once</b> and builds no intermediate arrays —
          that's "zero-cost abstraction": it reads like JS method chaining but runs like a hand-written for loop.
        </>
      ) : (
        <>
          源耗尽,<code>.sum()</code> 返回 <b><code>{acc}</code></b>。整条链<b>只遍历了一次</b>,没有生成任何中间数组 ——
          这就是「零成本抽象」:写起来像 JS 的链式调用,跑起来像手写的 for 循环。
        </>
      ),
  })
  return frames
}

const STAGE_X = { src: 30, filter: 150, map: 270, sum: 390 }

export default function IteratorViz() {
  const lang = useLang()
  const frames = buildFrames(lang)
  const { step, next, prev, reset, go } = useSteps(frames.length)
  const f = frames[step]

  const tokenX =
    f.stage === 'filter' || f.stage === 'drop'
      ? STAGE_X.filter
      : f.stage === 'map'
        ? STAGE_X.map
        : f.stage === 'add'
          ? STAGE_X.sum
          : STAGE_X.src
  const tokenVal = f.stage === 'map' || f.stage === 'add' ? f.mapped : f.current

  return (
    <div className="viz">
      <svg viewBox="0 0 470 190" width="100%" role="img" aria-label={lang === 'en' ? 'Iterator pipeline' : '迭代器流水线'}>
        {/* 流水线轨道 */}
        <line x1={40} y1={70} x2={430} y2={70} stroke="var(--line-strong)" strokeWidth={2} />

        {/* 阶段盒 */}
        {[
          { x: STAGE_X.filter, label: 'filter', sub: 'x%2==0' },
          { x: STAGE_X.map, label: 'map', sub: 'x*x' },
          { x: STAGE_X.sum, label: 'sum', sub: `=${f.acc}` },
        ].map((s) => (
          <g key={s.label}>
            <rect x={s.x - 42} y={44} width={84} height={52} rx={9}
              fill="var(--bg-2)" stroke="var(--rust-deep)" strokeWidth={1.3} />
            <text x={s.x} y={66} fill="var(--rust)" fontSize="13" fontWeight="700" textAnchor="middle">
              {s.label}
            </text>
            <text x={s.x} y={82} fill="var(--fg-3)" fontSize="9.5" textAnchor="middle">
              {s.sub}
            </text>
          </g>
        ))}

        {/* 源队列 */}
        <text x={30} y={30} fill="var(--fg-2)" fontSize="11" fontWeight="700">{lang === 'en' ? 'source 1..=5' : '源 1..=5'}</text>
        {f.source.map((n, i) => (
          <g key={`${n}-${i}`}>
            <rect x={20 + i * 26} y={120} width={22} height={22} rx={5}
              fill="var(--info-soft)" stroke="var(--info)" />
            <text x={31 + i * 26} y={135} fill="var(--info)" fontSize="11" textAnchor="middle">{n}</text>
          </g>
        ))}
        <text x={20} y={158} fill="var(--fg-3)" fontSize="9.5">{lang === 'en' ? 'pending queue' : '待处理队列'}</text>

        {/* 当前 token */}
        {f.current !== null && (
          <motion.g
            animate={{ x: tokenX }}
            initial={false}
            transition={{ type: 'spring', stiffness: 120, damping: 18 }}
          >
            <motion.circle
              cy={70} r={16}
              fill={f.stage === 'drop' || (f.stage === 'filter' && !f.passed) ? 'var(--err-soft)' : 'var(--ok-soft)'}
              stroke={f.stage === 'filter' && !f.passed ? 'var(--err)' : 'var(--ok)'}
              strokeWidth={2}
            />
            <text y={75} fill="var(--fg-0)" fontSize="13" fontWeight="700" textAnchor="middle">
              {tokenVal}
            </text>
          </motion.g>
        )}

        {/* 被丢弃提示 */}
        {f.stage === 'filter' && !f.passed && (
          <text x={STAGE_X.filter} y={172} fill="var(--err)" fontSize="11" textAnchor="middle" fontWeight="700">
            {lang === 'en' ? '✗ dropped, goes no further' : '✗ 丢弃,不进入后续'}
          </text>
        )}

        {/* 结果 */}
        <text x={430} y={30} fill="var(--ok)" fontSize="13" fontWeight="700" textAnchor="end">
          Σ = {f.acc}
        </text>
      </svg>

      <div className="viz-caption-line">{f.caption}</div>

      <StepperControls step={step} total={frames.length} onPrev={prev} onNext={next} onReset={reset} onGo={go} />
    </div>
  )
}

import { useState, type ReactNode } from 'react'
import CodeBlock from './CodeBlock'
import { useUI } from '../i18n/strings'
import './Ui.css'

/* ============================================================
   Callout —— 提示框
   ============================================================ */
type CalloutKind = 'tip' | 'info' | 'warn' | 'danger' | 'rust' | 'js'
const calloutIcons: Record<CalloutKind, string> = {
  tip: '💡',
  info: 'ℹ️',
  warn: '⚠️',
  danger: '🛑',
  rust: '🦀',
  js: '🟨',
}
export function Callout({
  kind = 'info',
  title,
  children,
}: {
  kind?: CalloutKind
  title?: string
  children: ReactNode
}) {
  const t = useUI()
  return (
    <div className={`callout callout-${kind}`}>
      <div className="callout-head">
        <span className="callout-icon">{calloutIcons[kind]}</span>
        <span className="callout-label">{title ?? t.calloutLabels[kind]}</span>
      </div>
      <div className="callout-body">{children}</div>
    </div>
  )
}

/* ============================================================
   Compare —— JS ↔ Rust 并排对照
   ============================================================ */
export function Compare({
  js,
  rust,
  jsTitle = 'JavaScript / TypeScript',
  rustTitle = 'Rust',
  jsLang = 'ts',
  note,
}: {
  js: string
  rust: string
  jsTitle?: string
  rustTitle?: string
  jsLang?: 'js' | 'ts' | 'tsx' | 'bash' | 'json' | 'toml' | 'text'
  note?: ReactNode
}) {
  return (
    <div className="compare">
      <div className="compare-grid">
        <div className="compare-col compare-js">
          <div className="compare-tag">🟨 {jsTitle}</div>
          <CodeBlock code={js} lang={jsLang} />
        </div>
        <div className="compare-arrow">→</div>
        <div className="compare-col compare-rust">
          <div className="compare-tag">🦀 {rustTitle}</div>
          <CodeBlock code={rust} lang="rust" />
        </div>
      </div>
      {note && <div className="compare-note">{note}</div>}
    </div>
  )
}

/* ============================================================
   KeyTerm —— 术语卡(带 JS 类比)
   ============================================================ */
export function KeyTerm({
  term,
  en,
  analogy,
  children,
}: {
  term: string
  en?: string
  analogy?: string
  children: ReactNode
}) {
  const t = useUI()
  return (
    <div className="keyterm">
      <div className="keyterm-head">
        <span className="keyterm-name">{term}</span>
        {en && <span className="keyterm-en">{en}</span>}
      </div>
      <div className="keyterm-body">{children}</div>
      {analogy && (
        <div className="keyterm-analogy">
          <strong>{t.frontendAnalogy}</strong>
          {analogy}
        </div>
      )}
    </div>
  )
}

/* ============================================================
   Quiz —— 单选小测验
   ============================================================ */
export interface QuizOption {
  text: string
  correct?: boolean
}
export function Quiz({
  question,
  options,
  explain,
}: {
  question: ReactNode
  options: QuizOption[]
  explain?: ReactNode
}) {
  const t = useUI()
  const [picked, setPicked] = useState<number | null>(null)
  const answered = picked !== null
  const isRight = answered && options[picked].correct

  return (
    <div className={`quiz ${answered ? (isRight ? 'quiz-right' : 'quiz-wrong') : ''}`}>
      <div className="quiz-q">
        <span className="quiz-badge">{t.quizBadge}</span>
        <span>{question}</span>
      </div>
      <div className="quiz-options">
        {options.map((o, i) => {
          const state = !answered
            ? ''
            : o.correct
              ? 'opt-correct'
              : i === picked
                ? 'opt-wrong'
                : 'opt-dim'
          return (
            <button
              key={i}
              className={`quiz-opt ${state}`}
              disabled={answered}
              onClick={() => setPicked(i)}
            >
              <span className="quiz-opt-key">{String.fromCharCode(65 + i)}</span>
              {o.text}
              {answered && o.correct && <span className="quiz-opt-mark">✓</span>}
              {answered && !o.correct && i === picked && (
                <span className="quiz-opt-mark">✗</span>
              )}
            </button>
          )
        })}
      </div>
      {answered && (
        <div className="quiz-feedback">
          <strong>{isRight ? t.quizRight : t.quizWrong}</strong>
          {explain && <div className="quiz-explain">{explain}</div>}
          {!isRight && (
            <button className="quiz-retry" onClick={() => setPicked(null)}>
              {t.quizRetry}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

/* ============================================================
   Figure —— 给可视化组件加标题/说明的容器
   ============================================================ */
export function Figure({
  title,
  caption,
  children,
}: {
  title?: string
  caption?: ReactNode
  children: ReactNode
}) {
  return (
    <figure className="figure">
      {title && <figcaption className="figure-title">{title}</figcaption>}
      <div className="figure-body">{children}</div>
      {caption && <div className="figure-caption">{caption}</div>}
    </figure>
  )
}

/* ============================================================
   Pill —— 行内小标签
   ============================================================ */
export function Pill({
  children,
  tone = 'rust',
}: {
  children: ReactNode
  tone?: 'rust' | 'js' | 'ok' | 'warn' | 'err' | 'info'
}) {
  return <span className={`pill pill-${tone}`}>{children}</span>
}

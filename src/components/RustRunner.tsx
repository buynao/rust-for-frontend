import { useRef, useState } from 'react'
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import {
  runOnPlayground,
  playgroundUrl,
  looksLikeFullProgram,
  type ExecuteResult,
} from '../lib/playground'
import { useUI } from '../i18n/strings'
import { useTheme } from '../theme'
import './RustRunner.css'

interface Props {
  initialCode: string
  title?: string
  /** 期望输出(运行前作为占位提示展示) */
  expectedOutput?: string
}

type Status = 'idle' | 'running' | 'done' | 'error'

// 编辑层与高亮层必须用完全一致的字体盒模型,否则光标会错位
const EDITOR_FONT: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: '0.86rem',
  lineHeight: 1.6,
  padding: '16px',
  margin: 0,
  tabSize: 4,
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  border: 0,
}

export default function RustRunner({ initialCode, title, expectedOutput }: Props) {
  const t = useUI()
  const theme = useTheme()
  const [code, setCode] = useState(initialCode)
  const [status, setStatus] = useState<Status>('idle')
  const [result, setResult] = useState<ExecuteResult | null>(null)
  const [errMsg, setErrMsg] = useState('')
  const [elapsed, setElapsed] = useState(0)
  const abortRef = useRef<AbortController | null>(null)

  const run = async () => {
    abortRef.current?.abort()
    const ctrl = new AbortController()
    abortRef.current = ctrl
    setStatus('running')
    setResult(null)
    setErrMsg('')
    const t0 = performance.now()
    // 片段(没有 fn main)自动包一层,方便直接运行表达式
    const program = looksLikeFullProgram(code)
      ? code
      : `fn main() {\n${code.replace(/^/gm, '    ')}\n}`
    try {
      const r = await runOnPlayground(program, {}, ctrl.signal)
      setElapsed((performance.now() - t0) / 1000)
      setResult(r)
      setStatus(r.success ? 'done' : 'error')
    } catch (e) {
      if ((e as Error).name === 'AbortError') return
      setErrMsg((e as Error).message || t.requestFailed)
      setStatus('error')
    }
  }

  const reset = () => {
    abortRef.current?.abort()
    setCode(initialCode)
    setStatus('idle')
    setResult(null)
    setErrMsg('')
  }

  const edited = code !== initialCode

  return (
    <div className="runner">
      <div className="runner-bar">
        <div className="runner-dots"><span /><span /><span /></div>
        {title && <span className="runner-title">{title}</span>}
        <span className="runner-lang">{t.runnerEditable}</span>
        <div className="runner-actions">
          {edited && (
            <button className="rn-btn" onClick={reset} title={t.restoreTitle}>{t.restore}</button>
          )}
          <a className="rn-btn" href={playgroundUrl(code)} target="_blank" rel="noreferrer">
            Playground ↗
          </a>
          <button
            className="rn-btn rn-run"
            onClick={run}
            disabled={status === 'running'}
          >
            {status === 'running' ? t.compiling : t.run}
          </button>
        </div>
      </div>

      {/* 叠层编辑器:高亮层在下,透明 textarea 在上 */}
      <div className="runner-editor">
        <SyntaxHighlighter
          language="rust"
          style={theme === 'light' ? oneLight : oneDark}
          customStyle={{ ...EDITOR_FONT, background: 'transparent', pointerEvents: 'none' }}
          codeTagProps={{ style: { fontFamily: 'var(--font-mono)' } }}
          wrapLongLines
        >
          {code + '\n'}
        </SyntaxHighlighter>
        <textarea
          className="runner-textarea"
          style={EDITOR_FONT}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => {
            // Tab 插入 4 空格,而不是跳出编辑框
            if (e.key === 'Tab') {
              e.preventDefault()
              const ta = e.currentTarget
              const s = ta.selectionStart
              const next = code.slice(0, s) + '    ' + code.slice(ta.selectionEnd)
              setCode(next)
              requestAnimationFrame(() => {
                ta.selectionStart = ta.selectionEnd = s + 4
              })
            }
            // Ctrl/Cmd + Enter 运行
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
              e.preventDefault()
              run()
            }
          }}
        />
      </div>

      {/* 输出区 */}
      {status === 'idle' && expectedOutput !== undefined && (
        <div className="runner-output runner-output--hint">
          <span className="runner-out-tag">{t.expectedOutput}</span>
          <pre>{expectedOutput}</pre>
        </div>
      )}
      {status === 'running' && (
        <div className="runner-output runner-output--running">
          <span className="runner-spinner" /> {t.runningCloud}
        </div>
      )}
      {status === 'error' && errMsg && (
        <div className="runner-output runner-output--err">
          <span className="runner-out-tag">{t.errorTag}</span>
          <pre>{errMsg}{t.runnerErrHint}</pre>
        </div>
      )}
      {result && (status === 'done' || status === 'error') && (
        <div className={`runner-output ${result.success ? 'runner-output--ok' : 'runner-output--err'}`}>
          <span className="runner-out-tag">
            {result.success ? t.outputOk : t.compileFailed}
            <i className="runner-meta">{t.fromPlayground(elapsed.toFixed(2))}</i>
          </span>
          {result.stdout && <pre className="runner-stdout">{result.stdout}</pre>}
          {!result.success && result.stderr && (
            <pre className="runner-stderr">{cleanStderr(result.stderr)}</pre>
          )}
          {result.success && !result.stdout && (
            <pre className="runner-stdout runner-dim">{t.noOutput}</pre>
          )}
        </div>
      )}
    </div>
  )
}

/** 编译成功时 stderr 全是 "Compiling/Finished/Running" 噪音,失败时才展示;此处精简一下 */
function cleanStderr(stderr: string): string {
  return stderr
    .split('\n')
    .filter((l) => !/^\s*(Compiling|Finished|Running)\b/.test(l))
    .join('\n')
    .trim()
}

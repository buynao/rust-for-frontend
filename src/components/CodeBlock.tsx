import { useState } from 'react'
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import rust from 'react-syntax-highlighter/dist/esm/languages/prism/rust'
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash'
import toml from 'react-syntax-highlighter/dist/esm/languages/prism/toml'
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json'
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript'
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript'
import jsx from 'react-syntax-highlighter/dist/esm/languages/prism/jsx'
import tsx from 'react-syntax-highlighter/dist/esm/languages/prism/tsx'
import RustRunner from './RustRunner'
import { useUI } from '../i18n/strings'
import './CodeBlock.css'

SyntaxHighlighter.registerLanguage('rust', rust)
SyntaxHighlighter.registerLanguage('bash', bash)
SyntaxHighlighter.registerLanguage('toml', toml)
SyntaxHighlighter.registerLanguage('json', json)
SyntaxHighlighter.registerLanguage('javascript', javascript)
SyntaxHighlighter.registerLanguage('typescript', typescript)
SyntaxHighlighter.registerLanguage('jsx', jsx)
SyntaxHighlighter.registerLanguage('tsx', tsx)

interface Props {
  code: string
  /** 语言,默认 rust */
  lang?: 'rust' | 'bash' | 'toml' | 'js' | 'jsx' | 'ts' | 'tsx' | 'json' | 'text'
  /** 顶部标题/文件名 */
  title?: string
  /** 是否显示「在 Playground 运行」按钮(仅 rust 有意义) */
  runnable?: boolean
  /** 高亮某些行(1 起) */
  highlight?: number[]
  /** 终端预期输出,显示在代码块下方 */
  output?: string
}

const langMap: Record<string, string> = {
  rust: 'rust',
  bash: 'bash',
  toml: 'toml',
  js: 'javascript',
  jsx: 'jsx',
  ts: 'typescript',
  tsx: 'tsx',
  json: 'json',
  text: 'text',
}

export default function CodeBlock({
  code,
  lang = 'rust',
  title,
  runnable,
  highlight = [],
  output,
}: Props) {
  const t = useUI()
  const [copied, setCopied] = useState(false)
  const trimmed = code.replace(/^\n+|\n+$/g, '')

  // 可运行的 Rust 代码块 → 交给内嵌运行器(可编辑 + 云端执行)
  if (runnable && lang === 'rust') {
    return <RustRunner initialCode={trimmed} title={title} expectedOutput={output} />
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(trimmed)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="codeblock">
      <div className="codeblock-bar">
        <div className="codeblock-dots">
          <span /><span /><span />
        </div>
        {title && <span className="codeblock-title">{title}</span>}
        <span className="codeblock-lang">{lang}</span>
        <div className="codeblock-actions">
          <button className="cb-btn" onClick={copy}>
            {copied ? t.copied : t.copy}
          </button>
        </div>
      </div>
      <SyntaxHighlighter
        language={langMap[lang] ?? 'text'}
        style={oneDark}
        showLineNumbers
        wrapLines
        lineProps={(n: number) =>
          highlight.includes(n)
            ? { style: { display: 'block', background: 'rgba(222,165,132,0.14)' } }
            : {}
        }
        customStyle={{
          margin: 0,
          background: 'transparent',
          fontSize: '0.86rem',
          padding: '16px 4px 16px 0',
        }}
        codeTagProps={{ style: { fontFamily: 'var(--font-mono)' } }}
      >
        {trimmed}
      </SyntaxHighlighter>
      {output !== undefined && (
        <div className="codeblock-output">
          <span className="codeblock-output-tag">{t.outputTag}</span>
          <pre>{output}</pre>
        </div>
      )}
    </div>
  )
}

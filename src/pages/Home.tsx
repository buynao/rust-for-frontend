import { Link } from 'react-router-dom'
import { chapters, groupedChapters } from '../content/chapters'
import { useProgress } from '../hooks/useProgress'
import './Home.css'

export default function Home() {
  const groups = groupedChapters()
  const { completed } = useProgress()
  const first = chapters[0]
  const totalMin = chapters.reduce((n, c) => n + c.minutes, 0)

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-badges">
          <span className="hero-badge">🦀 Rust</span>
          <span className="hero-badge">面向前端工程师</span>
          <span className="hero-badge">可视化 · 可交互</span>
        </div>
        <h1 className="hero-title">
          用<em>前端的心智模型</em>
          <br />
          把 Rust 学进去
        </h1>
        <p className="hero-sub">
          你已经会 JavaScript / TypeScript 了。这门课不从零讲编程,而是把
          Rust 的每个概念都翻译成你熟悉的语言 —— 所有权对应什么、
          <code>Result</code> 取代了哪种 <code>try/catch</code>、Wasm 怎么和你的
          React 应用对话。配合可交互的动画一眼看懂。
        </p>
        <div className="hero-actions">
          <Link className="btn-primary" to={`/learn/${first.slug}`}>
            开始第 1 章 · {first.title} →
          </Link>
          <a
            className="btn-ghost"
            href="https://play.rust-lang.org/"
            target="_blank"
            rel="noreferrer"
          >
            打开 Rust Playground
          </a>
        </div>
        <div className="hero-stats">
          <div><strong>{chapters.length}</strong><span>章节</span></div>
          <div><strong>{totalMin}</strong><span>分钟</span></div>
          <div><strong>{completed.size}</strong><span>已完成</span></div>
        </div>
      </section>

      <section className="why-cards">
        <div className="why-card">
          <span className="why-ico">🧠</span>
          <h3>对照式讲解</h3>
          <p>每个语法点都给出 JS/TS 与 Rust 的并排代码,你看一眼就知道差异在哪。</p>
        </div>
        <div className="why-card">
          <span className="why-ico">🎞️</span>
          <h3>可视化核心难点</h3>
          <p>所有权 move、借用检查、栈与堆、迭代器管道 —— 用 SVG 动画让抽象变具体。</p>
        </div>
        <div className="why-card">
          <span className="why-ico">🛠️</span>
          <h3>动手做小工具</h3>
          <p>从环境搭建到一个能跑的 CLI 工具,再到编译成 WebAssembly 嵌进网页。</p>
        </div>
      </section>

      <section className="outline">
        <h2 className="outline-title">课程大纲</h2>
        {groups.map((g, gi) => (
          <div className="outline-group" key={g.group}>
            <div className="outline-group-name">{g.group}</div>
            <div className="outline-list">
              {g.items.map((ch) => {
                const idx =
                  groups.slice(0, gi).reduce((n, x) => n + x.items.length, 0) +
                  g.items.indexOf(ch)
                return (
                  <Link
                    key={ch.slug}
                    to={`/learn/${ch.slug}`}
                    className={`outline-item ${completed.has(ch.slug) ? 'is-done' : ''}`}
                  >
                    <span className="outline-num">
                      {completed.has(ch.slug) ? '✓' : String(idx + 1).padStart(2, '0')}
                    </span>
                    <span className="outline-ico">{ch.icon}</span>
                    <span className="outline-text">
                      <strong>{ch.title}</strong>
                      <span>{ch.subtitle}</span>
                    </span>
                    <span className="outline-min">{ch.minutes}′</span>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </section>

      <footer className="home-foot">
        <a
          className="home-foot-gh"
          href="https://github.com/buynao/rust-for-frontend"
          target="_blank"
          rel="noreferrer"
        >
          <svg viewBox="0 0 16 16" width="18" height="18" aria-hidden="true">
            <path
              fill="currentColor"
              d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"
            />
          </svg>
          在 GitHub 查看源码
        </a>
        <div className="home-foot-meta">
          用 Vite · React · SVG 构建 · 一门为前端而生的 Rust 教程 🦀
        </div>
      </footer>
    </div>
  )
}

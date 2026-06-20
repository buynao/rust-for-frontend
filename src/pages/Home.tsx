import { Link } from 'react-router-dom'
import { chapters, groupedChapters } from '../content/chapters'
import { useProgress } from '../hooks/useProgress'
import { useLang, loc } from '../i18n/lang'
import { useUI } from '../i18n/strings'
import './Home.css'

export default function Home() {
  const groups = groupedChapters()
  const { completed } = useProgress()
  const lang = useLang()
  const t = useUI()
  const first = chapters[0]
  const totalMin = chapters.reduce((n, c) => n + c.minutes, 0)

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-badges">
          <span className="hero-badge">{t.badgeRust}</span>
          <span className="hero-badge">{t.badgeForFrontend}</span>
          <span className="hero-badge">{t.badgeVisual}</span>
        </div>
        <h1 className="hero-title">{t.heroTitle}</h1>
        <p className="hero-sub">{t.heroSub}</p>
        <div className="hero-actions">
          <Link className="btn-primary" to={`/learn/${first.slug}`}>
            {t.startChapter(loc(first.title, lang))}
          </Link>
          <a
            className="btn-ghost"
            href="https://play.rust-lang.org/"
            target="_blank"
            rel="noreferrer"
          >
            {t.openPlayground}
          </a>
        </div>
        <div className="hero-stats">
          <div><strong>{chapters.length}</strong><span>{t.statChapters}</span></div>
          <div><strong>{totalMin}</strong><span>{t.statMinutes}</span></div>
          <div><strong>{completed.size}</strong><span>{t.statDone}</span></div>
        </div>
      </section>

      <section className="why-cards">
        {t.whyCards.map((card) => (
          <div className="why-card" key={card.title}>
            <span className="why-ico">{card.ico}</span>
            <h3>{card.title}</h3>
            <p>{card.body}</p>
          </div>
        ))}
      </section>

      <section className="outline">
        <h2 className="outline-title">{t.outlineTitle}</h2>
        {groups.map((g, gi) => (
          <div className="outline-group" key={g.group.zh}>
            <div className="outline-group-name">{loc(g.group, lang)}</div>
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
                      <strong>{loc(ch.title, lang)}</strong>
                      <span>{loc(ch.subtitle, lang)}</span>
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
          {t.footGithub}
        </a>
        <div className="home-foot-meta">
          {t.footMeta}
        </div>
      </footer>
    </div>
  )
}

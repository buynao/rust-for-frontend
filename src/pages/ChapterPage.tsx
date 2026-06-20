import { Suspense, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { chapterBySlug, chapterIndex, chapters } from '../content/chapters'
import { useProgress } from '../hooks/useProgress'
import { useLang, loc } from '../i18n/lang'
import { useUI } from '../i18n/strings'
import './ChapterPage.css'

export default function ChapterPage() {
  const { slug = '' } = useParams()
  const ch = chapterBySlug(slug)
  const idx = chapterIndex(slug)
  const { completed, toggle } = useProgress()
  const lang = useLang()
  const t = useUI()

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [slug])

  if (!ch) {
    return (
      <div className="chapter">
        <h1>{t.notFoundTitle}</h1>
        <Link to="/">{t.backHome}</Link>
      </div>
    )
  }

  const prev = idx > 0 ? chapters[idx - 1] : null
  const next = idx < chapters.length - 1 ? chapters[idx + 1] : null
  const done = completed.has(ch.slug)
  const Body = ch.Component

  return (
    <article className="chapter prose">
      <div className="chapter-meta">
        <span className="chapter-kicker">
          {t.chapterKicker(idx + 1, loc(ch.group, lang))}
        </span>
        <span className="chapter-mins">{t.chapterMins(ch.minutes)}</span>
      </div>
      <h1 className="chapter-title">
        <span className="chapter-title-icon">{ch.icon}</span>
        {loc(ch.title, lang)}
      </h1>
      <p className="chapter-subtitle">{loc(ch.subtitle, lang)}</p>
      <hr />

      <Suspense fallback={<div className="chapter-loading">{t.loading}</div>}>
        <Body />
      </Suspense>

      <div className="chapter-done">
        <button
          className={`done-btn ${done ? 'is-done' : ''}`}
          onClick={() => toggle(ch.slug)}
        >
          {done ? t.markedDone : t.markDone}
        </button>
      </div>

      <nav className="chapter-nav">
        {prev ? (
          <Link className="nav-prev" to={`/learn/${prev.slug}`}>
            <span className="nav-dir">{t.navPrev}</span>
            <span className="nav-name">{prev.icon} {loc(prev.title, lang)}</span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link className="nav-next" to={`/learn/${next.slug}`}>
            <span className="nav-dir">{t.navNext}</span>
            <span className="nav-name">{next.icon} {loc(next.title, lang)}</span>
          </Link>
        ) : (
          <Link className="nav-next" to="/">
            <span className="nav-dir">{t.navFinished}</span>
            <span className="nav-name">{t.navBackHome}</span>
          </Link>
        )}
      </nav>
    </article>
  )
}

import { useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { chapters, groupedChapters } from '../content/chapters'
import { useProgress } from '../hooks/useProgress'
import { useLang, loc, useLangControls } from '../i18n/lang'
import { useUI } from '../i18n/strings'
import { useThemeControls } from '../theme'
import './Layout.css'

export default function Layout() {
  const groups = groupedChapters()
  const { completed } = useProgress()
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const lang = useLang()
  const { toggle: toggleLang } = useLangControls()
  const { theme, toggle: toggleTheme } = useThemeControls()
  const t = useUI()
  const themeTitle = theme === 'light' ? t.themeSwitchToDark : t.themeSwitchToLight
  const pct = Math.round((completed.size / chapters.length) * 100)

  return (
    <div className="layout">
      <header className="topbar">
        <button
          className="hamburger"
          aria-label={t.menu}
          onClick={() => setOpen((v) => !v)}
        >
          <span /><span /><span />
        </button>
        <Link to="/" className="brand" onClick={() => setOpen(false)}>
          <span className="brand-mark">🦀</span>
          <span className="brand-text">
            Rust <em>for</em> Frontend
          </span>
        </Link>
        <div className="topbar-progress" title={t.completedOf(completed.size, chapters.length)}>
          <div className="topbar-progress-bar" style={{ width: `${pct}%` }} />
          <span className="topbar-progress-label">{pct}%</span>
        </div>
        <a
          className="topbar-link"
          href="https://play.rust-lang.org/"
          target="_blank"
          rel="noreferrer"
        >
          {t.playground}
        </a>
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          title={themeTitle}
          aria-label={themeTitle}
        >
          <span className="theme-toggle-ico" aria-hidden="true">
            {theme === 'light' ? '🌙' : '☀️'}
          </span>
        </button>
        <button
          className="lang-toggle"
          onClick={toggleLang}
          title={t.langSwitchTitle}
          aria-label={t.langSwitchTitle}
        >
          <span className="lang-toggle-ico">🌐</span>
          {t.langSwitchLabel}
        </button>
        <div className="topbar-social">
          <a
            className="social-link"
            href="https://github.com/buynao/rust-for-frontend"
            target="_blank"
            rel="noreferrer"
            aria-label={t.github}
            title={t.github}
          >
            <svg viewBox="0 0 16 16" width="18" height="18" aria-hidden="true">
              <path
                fill="currentColor"
                d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"
              />
            </svg>
          </a>
          <a
            className="social-link"
            href="https://x.com/buynao1"
            target="_blank"
            rel="noreferrer"
            aria-label="X / Twitter"
            title="X / Twitter"
          >
            <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
              <path
                fill="currentColor"
                d="M9.52 6.77 15.48 0h-1.41L8.9 5.88 4.76 0H0l6.25 8.9L0 16h1.41l5.46-6.21L11.24 16H16L9.52 6.77ZM7.58 8.98l-.63-.89L1.92 1.04h2.17l4.06 5.69.63.89 5.28 7.4h-2.17L7.58 8.98Z"
              />
            </svg>
          </a>
        </div>
      </header>

      <div className="body">
        <aside className={`sidebar ${open ? 'open' : ''}`}>
          <nav className="nav">
            <NavLink
              to="/"
              end
              className="nav-home"
              onClick={() => setOpen(false)}
            >
              {t.navHome}
            </NavLink>
            {groups.map((g, gi) => (
              <div className="nav-group" key={g.group.zh}>
                <div className="nav-group-title">{loc(g.group, lang)}</div>
                {g.items.map((ch) => {
                  const idx =
                    groups.slice(0, gi).reduce((n, x) => n + x.items.length, 0) +
                    g.items.indexOf(ch)
                  return (
                    <NavLink
                      key={ch.slug}
                      to={`/learn/${ch.slug}`}
                      className="nav-item"
                      onClick={() => setOpen(false)}
                    >
                      <span className="nav-num">
                        {completed.has(ch.slug) ? '✓' : String(idx + 1).padStart(2, '0')}
                      </span>
                      <span className="nav-label">
                        <span className="nav-icon">{ch.icon}</span>
                        {loc(ch.title, lang)}
                      </span>
                    </NavLink>
                  )
                })}
              </div>
            ))}
          </nav>
          <div className="sidebar-foot">
            {t.sidebarFoot(chapters.length)}
          </div>
        </aside>

        {open && <div className="scrim" onClick={() => setOpen(false)} />}

        <main className="content" key={`${location.pathname}|${lang}`}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

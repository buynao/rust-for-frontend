import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type Theme = 'dark' | 'light'

const KEY = 'rff:theme'

/** 读取系统配色偏好:`prefers-color-scheme: light` 时用亮色,否则暗色 */
function detectSystemTheme(): Theme {
  if (typeof window === 'undefined' || !window.matchMedia) return 'dark'
  return window.matchMedia('(prefers-color-scheme: light)').matches
    ? 'light'
    : 'dark'
}

/** 初始主题:用户手动选过就用存档,否则跟随系统 */
function initialTheme(): Theme {
  try {
    const saved = localStorage.getItem(KEY)
    if (saved === 'dark' || saved === 'light') return saved
  } catch {
    /* ignore */
  }
  return detectSystemTheme()
}

/** 把主题写到 <html data-theme>,CSS 据此切换全部设计 token */
function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme
}

interface ThemeCtx {
  theme: Theme
  setTheme: (t: Theme) => void
  toggle: () => void
}

const Ctx = createContext<ThemeCtx | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(initialTheme)

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  // 用户没手动选过时,跟随系统配色实时变化
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia('(prefers-color-scheme: light)')
    const onChange = (e: MediaQueryListEvent) => {
      try {
        if (localStorage.getItem(KEY)) return // 用户已手动覆盖
      } catch {
        /* ignore */
      }
      setThemeState(e.matches ? 'light' : 'dark')
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const persist = (t: Theme) => {
    try {
      localStorage.setItem(KEY, t)
    } catch {
      /* ignore */
    }
  }

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t)
    persist(t)
  }, [])

  const toggle = useCallback(() => {
    setThemeState((prev) => {
      const next: Theme = prev === 'dark' ? 'light' : 'dark'
      persist(next)
      return next
    })
  }, [])

  const value = useMemo(
    () => ({ theme, setTheme, toggle }),
    [theme, setTheme, toggle],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

function useThemeCtx(): ThemeCtx {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useTheme must be used within <ThemeProvider>')
  return ctx
}

/** 当前主题。组件用 `const theme = useTheme()`(如代码块挑选高亮配色)。 */
export function useTheme(): Theme {
  return useThemeCtx().theme
}

/** 主题开关控制(供顶栏切换按钮使用) */
export function useThemeControls(): ThemeCtx {
  return useThemeCtx()
}

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type Lang = 'zh' | 'en'

/** 同时支持中英文的字符串 */
export type Localized = { zh: string; en: string }

const KEY = 'rff:lang'

/** 读取浏览器语言:中文(zh / zh-CN / zh-TW…)显示中文,其余一律英文 */
function detectBrowserLang(): Lang {
  if (typeof navigator === 'undefined') return 'en'
  const candidates = [navigator.language, ...(navigator.languages ?? [])]
  for (const c of candidates) {
    if (c && c.toLowerCase().startsWith('zh')) return 'zh'
  }
  return 'en'
}

/** 初始语言:用户手动选过就用存档,否则跟随浏览器 */
function initialLang(): Lang {
  try {
    const saved = localStorage.getItem(KEY)
    if (saved === 'zh' || saved === 'en') return saved
  } catch {
    /* ignore */
  }
  return detectBrowserLang()
}

interface LangCtx {
  lang: Lang
  setLang: (l: Lang) => void
  toggle: () => void
}

const Ctx = createContext<LangCtx | null>(null)

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang)

  useEffect(() => {
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en'
    document.title =
      lang === 'zh'
        ? 'Rust for Frontend · 前端视角的 Rust 交互教程'
        : 'Rust for Frontend · An Interactive Rust Course for Frontend Devs'
    const desc =
      lang === 'zh'
        ? '面向前端开发者的交互式 Rust 学习教程 —— 用你熟悉的 JS/TS 心智模型,可视化地理解所有权、借用、生命周期与 WebAssembly。'
        : 'An interactive Rust course for frontend developers — use the JS/TS mental models you already know to visually grasp ownership, borrowing, lifetimes, and WebAssembly.'
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute('content', desc)
  }, [lang])

  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    try {
      localStorage.setItem(KEY, l)
    } catch {
      /* ignore */
    }
  }, [])

  const toggle = useCallback(() => {
    setLangState((prev) => {
      const next: Lang = prev === 'zh' ? 'en' : 'zh'
      try {
        localStorage.setItem(KEY, next)
      } catch {
        /* ignore */
      }
      return next
    })
  }, [])

  const value = useMemo(() => ({ lang, setLang, toggle }), [lang, setLang, toggle])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

function useLangCtx(): LangCtx {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useLang must be used within <LangProvider>')
  return ctx
}

/** 当前语言。章节组件用 `const lang = useLang()` 然后分支渲染。 */
export function useLang(): Lang {
  return useLangCtx().lang
}

/** 语言开关控制(供顶栏切换按钮使用) */
export function useLangControls(): LangCtx {
  return useLangCtx()
}

/** 在当前语言下取出本地化字符串 */
export function loc(s: Localized, lang: Lang): string {
  return s[lang]
}

/**
 * 小工具:把「按语言分组的字典」绑定到当前语言,返回取值函数。
 * 用法:const t = useT(STRINGS); t.home.start
 */
export function pick<T>(dict: Record<Lang, T>, lang: Lang): T {
  return dict[lang]
}

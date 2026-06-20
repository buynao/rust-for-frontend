import { useCallback, useEffect, useRef, useState } from 'react'
import { useLang } from '../../i18n/lang'

/** 受控步进的 hook:返回当前步、控制函数 */
export function useSteps(total: number, autoMs = 0) {
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)
  const timer = useRef<number | null>(null)

  const clear = () => {
    if (timer.current) {
      window.clearInterval(timer.current)
      timer.current = null
    }
  }

  const next = useCallback(() => setStep((s) => Math.min(s + 1, total - 1)), [total])
  const prev = useCallback(() => setStep((s) => Math.max(s - 1, 0)), [])
  const reset = useCallback(() => {
    setStep(0)
    setPlaying(false)
  }, [])
  const go = useCallback((i: number) => setStep(Math.max(0, Math.min(i, total - 1))), [total])

  useEffect(() => {
    if (!playing || autoMs <= 0) return
    timer.current = window.setInterval(() => {
      setStep((s) => {
        if (s >= total - 1) {
          setPlaying(false)
          return s
        }
        return s + 1
      })
    }, autoMs)
    return clear
  }, [playing, autoMs, total])

  const togglePlay = useCallback(() => {
    setStep((s) => (s >= total - 1 ? 0 : s))
    setPlaying((p) => !p)
  }, [total])

  return { step, playing, next, prev, reset, go, togglePlay, total }
}

interface StepperControlsProps {
  step: number
  total: number
  playing?: boolean
  onPrev: () => void
  onNext: () => void
  onReset: () => void
  onGo: (i: number) => void
  onTogglePlay?: () => void
  canPlay?: boolean
}

export function StepperControls({
  step,
  total,
  playing,
  onPrev,
  onNext,
  onReset,
  onGo,
  onTogglePlay,
  canPlay,
}: StepperControlsProps) {
  const lang = useLang()
  return (
    <div className="stepper">
      <button className="stepper-btn" onClick={onPrev} disabled={step === 0}>
        {lang === 'en' ? '← Prev' : '← 上一步'}
      </button>
      <button
        className="stepper-btn primary"
        onClick={onNext}
        disabled={step >= total - 1}
      >
        {lang === 'en' ? 'Next →' : '下一步 →'}
      </button>
      {canPlay && onTogglePlay && (
        <button className="stepper-btn" onClick={onTogglePlay}>
          {playing
            ? lang === 'en' ? '⏸ Pause' : '⏸ 暂停'
            : lang === 'en' ? '▶ Autoplay' : '▶ 自动播放'}
        </button>
      )}
      <button className="stepper-btn" onClick={onReset}>
        {lang === 'en' ? '↺ Reset' : '↺ 重置'}
      </button>
      <div className="stepper-dots">
        {Array.from({ length: total }, (_, i) => (
          <button
            key={i}
            className={`stepper-dot ${i === step ? 'active' : i < step ? 'passed' : ''}`}
            onClick={() => onGo(i)}
            aria-label={lang === 'en' ? `Step ${i + 1}` : `第 ${i + 1} 步`}
          />
        ))}
      </div>
    </div>
  )
}

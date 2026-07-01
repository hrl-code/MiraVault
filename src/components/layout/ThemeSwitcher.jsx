import { useEffect, useRef, useState } from 'react'
import { themes } from '@/config/themes'
import { useThemeStore } from '@/store/themeStore'

function PaletteDots({ colors }) {
  return (
    <span className="flex shrink-0 -space-x-1">
      {colors.slice(0, 4).map((color) => (
        <span
          key={color}
          className="h-4 w-4 rounded-full border border-[color:var(--bg-secondary)]"
          style={{ backgroundColor: color }}
        />
      ))}
    </span>
  )
}

function ChevronIcon({ open }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={['h-4 w-4 transition-transform', open ? 'rotate-180' : ''].join(' ')}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
    </svg>
  )
}

export default function ThemeSwitcher() {
  const { theme, setTheme } = useThemeStore()
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const activeTheme = themes.find((item) => item.id === theme) || themes[0]

  useEffect(() => {
    function handleClick(event) {
      if (!rootRef.current?.contains(event.target)) setOpen(false)
    }

    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function chooseTheme(nextTheme) {
    setTheme(nextTheme)
    setOpen(false)
  }

  return (
    <div ref={rootRef} className="relative space-y-3">
      <p className="text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-muted)]">Tema</p>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center gap-2 rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg-card)]/70 px-3 py-2 text-left text-sm text-[color:var(--text-primary)] transition hover:bg-[color:var(--bg-hover)]"
      >
        <PaletteDots colors={activeTheme.colors} />
        <span className="min-w-0 flex-1 truncate">{activeTheme.label}</span>
        <ChevronIcon open={open} />
      </button>

      {open ? (
        <div className="absolute bottom-[calc(100%+8px)] left-0 right-0 z-50 max-h-[320px] overflow-y-auto rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg-secondary)] p-2 shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
          {themes.map((item) => {
            const active = item.id === theme
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => chooseTheme(item.id)}
                className={[
                  'flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition',
                  active
                    ? 'bg-[color:var(--accent-muted)] text-[color:var(--accent)]'
                    : 'text-[color:var(--text-secondary)] hover:bg-[color:var(--bg-hover)] hover:text-[color:var(--text-primary)]'
                ].join(' ')}
              >
                <PaletteDots colors={item.colors} />
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

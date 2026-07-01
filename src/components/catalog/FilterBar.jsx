import { useEffect, useState } from 'react'

const typeOptions = [
  { value: 'all', label: 'Todos' },
  { value: 'movie', label: 'Peliculas' },
  { value: 'series', label: 'Series' },
  { value: 'book', label: 'Libros' }
]

const qualityOptions = [
  { value: 'all', label: 'Todos' },
  { value: '4K', label: '4K' },
  { value: '1080p', label: '1080p' },
  { value: '720p', label: '720p' }
]

const languageOptions = [
  { value: 'all', label: 'Todos' },
  { value: 'ESP', label: 'ESP' },
  { value: 'VOSE', label: 'VOSE' },
  { value: 'DUAL', label: 'DUAL' }
]

const statusOptions = [
  { value: 'all', label: 'Todos' },
  { value: 'pending', label: 'Pendiente' },
  { value: 'watching', label: 'Viendo' },
  { value: 'completed', label: 'Completada' },
  { value: 'paused', label: 'Pausada' }
]

function Pill({ active, onClick, children, disabled = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        'rounded-full border px-3 py-1.5 text-sm transition',
        active
          ? 'border-[color:var(--accent)] bg-[color:var(--accent)] text-white'
          : 'border-[color:var(--border)] text-[color:var(--text-secondary)] hover:bg-[color:var(--bg-hover)] hover:text-[color:var(--text-primary)]',
        disabled ? 'cursor-not-allowed opacity-60' : ''
      ].join(' ')}
    >
      {children}
    </button>
  )
}

function GroupLabel({ children }) {
  return <span className="text-xs uppercase tracking-[0.18em] text-[color:var(--text-muted)]">{children}</span>
}

export default function FilterBar({
  filters,
  onFiltersChange,
  onSearch,
  fixedType = null
}) {
  const [query, setQuery] = useState(filters.query || '')

  useEffect(() => {
    setQuery(filters.query || '')
  }, [filters.query])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      onSearch(query)
    }, 400)

    return () => window.clearTimeout(timeoutId)
  }, [onSearch, query])
  function update(nextPatch) {
    onFiltersChange({ ...filters, ...nextPatch })
  }

  return (
    <div className="space-y-4 rounded-[20px] border border-[color:var(--border)] bg-[color:var(--bg-card)]/50 p-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl border border-[color:var(--border)] bg-black/10 px-4 py-3">
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-[color:var(--text-muted)]" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="11" cy="11" r="6" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar dentro de tu biblioteca..."
            className="w-full bg-transparent text-sm text-[color:var(--text-primary)] outline-none placeholder:text-[color:var(--text-muted)]"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <GroupLabel>Tipo</GroupLabel>
        {typeOptions.map((option) => (
          <Pill
            key={option.value}
            active={filters.type === option.value}
            disabled={Boolean(fixedType) && fixedType !== option.value}
            onClick={() => update({ type: option.value })}
          >
            {option.label}
          </Pill>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <GroupLabel>Calidad</GroupLabel>
        {qualityOptions.map((option) => (
          <Pill
            key={option.value}
            active={filters.quality === option.value}
            onClick={() => update({ quality: option.value })}
          >
            {option.label}
          </Pill>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <GroupLabel>Idioma</GroupLabel>
        {languageOptions.map((option) => (
          <Pill
            key={option.value}
            active={filters.language === option.value}
            onClick={() => update({ language: option.value })}
          >
            {option.label}
          </Pill>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <GroupLabel>Estado</GroupLabel>
        {statusOptions.map((option) => (
          <Pill
            key={option.value}
            active={filters.status === option.value}
            onClick={() => update({ status: option.value })}
          >
            {option.label}
          </Pill>
        ))}
      </div>

    </div>
  )
}

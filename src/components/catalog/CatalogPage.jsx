import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import FilterBar from './FilterBar'
import MediaCard from './MediaCard'
import useCatalog from '@/hooks/useCatalog'
import Spinner from '@/components/ui/Spinner'
import { useWatchProgressStore } from '@/store/watchProgressStore'
import { useLibraryStatusStore } from '@/store/libraryStatusStore'
import { getEffectiveStatus } from '@/utils/libraryProgress'

function filterItems(items, filters, progress, statuses) {
  return items.filter((item) => {
    const qualityMatch = filters.quality === 'all' || item.quality === filters.quality
    const languageMatch = filters.language === 'all' || item.language === filters.language
    const typeMatch = filters.type === 'all' || item.type === filters.type
    const statusMatch = filters.status === 'all' || getEffectiveStatus(item, progress, statuses) === filters.status

    return qualityMatch && languageMatch && typeMatch && statusMatch
  })
}

export default function CatalogPage({
  title,
  description,
  initialType = 'all'
}) {
  const { items, loading, error, hasMore, fetchLatest, search, loadMore } = useCatalog()
  const progress = useWatchProgressStore((state) => state.progress)
  const statuses = useLibraryStatusStore((state) => state.statuses)
  const [filters, setFilters] = useState({
    type: initialType,
    quality: 'all',
    language: 'all',
    status: 'all',
    query: ''
  })
  const sentinelRef = useRef(null)

  const runLatest = useCallback(
    (nextType) => fetchLatest(nextType, 1),
    [fetchLatest]
  )

  const runSearch = useCallback(
    (query, nextType) => search(query, nextType),
    [search]
  )

  useEffect(() => {
    if (!filters.query.trim()) return
    runSearch(filters.query, filters.type)
  }, [filters.query, filters.type, runSearch])

  useEffect(() => {
    if (filters.query.trim()) return
    runLatest(filters.type)
  }, [filters.type, filters.query, runLatest])

  useEffect(() => {
    const target = sentinelRef.current
    if (!target || !hasMore || filters.query.trim()) return undefined

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry?.isIntersecting) {
          loadMore()
        }
      },
      { rootMargin: '120px 0px' }
    )

    observer.observe(target)
    return () => observer.disconnect()
  }, [filters.query, loadMore, hasMore, items.length])

  const visibleItems = useMemo(() => filterItems(items, filters, progress, statuses), [filters, items, progress, statuses])

  function handleFiltersChange(nextFilters) {
    const safeType = initialType === 'all' ? nextFilters.type : initialType
    setFilters({
      ...nextFilters,
      type: safeType
    })
  }

  const handleSearchChange = useCallback((query) => {
    setFilters((current) => ({ ...current, query }))
  }, [])

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.32em] text-[color:var(--text-muted)]">MiraVault</p>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-4xl font-semibold text-[color:var(--text-primary)]">{title}</h1>
            <p className="mt-2 max-w-2xl text-sm text-[color:var(--text-secondary)]">{description}</p>
          </div>
          <div className="rounded-full border border-[color:var(--border)] bg-[color:var(--accent-muted)] px-4 py-2 text-sm text-[color:var(--accent)]">
            {visibleItems.length} resultados
          </div>
        </div>
      </header>

      <FilterBar
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onSearch={handleSearchChange}
        fixedType={initialType === 'all' ? null : initialType}
      />

      {error ? (
        <div className="rounded-2xl border border-[#7a2f36] bg-[#45171d]/50 px-4 py-3 text-sm text-[#ffccd2]">
          {error}
        </div>
      ) : null}

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[color:var(--text-primary)]">
            {title === 'Inicio' ? 'Novedades' : title}
          </h2>
          {loading ? (
            <span className="text-sm text-[color:var(--text-secondary)]">Actualizando catalogo...</span>
          ) : null}
        </div>

        {visibleItems.length > 0 ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] content-start gap-4">
            {visibleItems.map((item) => (
              <div key={`${item.provider}-${item.id}-${item.url}`} className="flex justify-center">
                <MediaCard item={item} />
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-[24px] border border-dashed border-[color:var(--border)] bg-black/10 px-6 py-12 text-center text-sm text-[color:var(--text-secondary)]">
            {loading ? 'Buscando contenido...' : 'No hay resultados para los filtros actuales.'}
          </div>
        )}

        <div ref={sentinelRef} className="flex h-12 items-center justify-center">
          {!filters.query.trim() && hasMore ? (
            loading ? (
              <div className="flex items-center gap-3 text-xs uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
                <Spinner size="sm" />
                Cargando mas resultados
              </div>
            ) : (
              <div className="flex justify-center text-xs uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
                Sigue bajando para cargar mas
              </div>
            )
          ) : null}
        </div>
      </section>
    </div>
  )
}

import { useCallback, useEffect, useMemo, useState } from 'react'
import MediaCard from '@/components/catalog/MediaCard'
import Spinner from '@/components/ui/Spinner'

function isLibraryMedia(item) {
  return item?.type === 'movie' || item?.type === 'series'
}

function sortLibrary(items) {
  return [...items].sort((a, b) => {
    const byUpdated = Number(b.updatedAt || 0) - Number(a.updatedAt || 0)
    if (byUpdated !== 0) return byUpdated
    return String(a.title || '').localeCompare(String(b.title || ''), 'es')
  })
}

export default function Library() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const loadLibrary = useCallback(async () => {
    setLoading(true)
    try {
      const data = await window.electronAPI?.libraryList?.()
      const nextItems = Array.isArray(data) ? data.filter(isLibraryMedia) : []
      setItems(sortLibrary(nextItems))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadLibrary()
  }, [loadLibrary])

  const title = useMemo(() => {
    if (loading) return 'Cargando biblioteca...'
    if (items.length === 1) return '1 titulo'
    return `${items.length} titulos`
  }, [items.length, loading])

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-[color:var(--text-muted)]">Biblioteca</p>
          <h1 className="mt-3 text-4xl font-semibold text-[color:var(--text-primary)]">Mis series y peliculas</h1>
          <p className="mt-2 text-sm text-[color:var(--text-secondary)]">
            Solo contenido local detectado en tu biblioteca.
          </p>
        </div>
        <div className="rounded-full border border-[color:var(--border)] bg-[color:var(--accent-muted)] px-4 py-2 text-sm text-[color:var(--accent)]">
          {title}
        </div>
      </header>

      {loading ? (
        <div className="flex h-48 items-center justify-center gap-3 text-sm text-[color:var(--text-secondary)]">
          <Spinner size="md" />
          Cargando tarjetas...
        </div>
      ) : items.length > 0 ? (
        <section className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] content-start gap-4">
          {items.map((item) => (
            <div key={`${item.provider}-${item.id}-${item.url}`} className="flex justify-center">
              <MediaCard item={item} />
            </div>
          ))}
        </section>
      ) : (
        <div className="rounded-[24px] border border-dashed border-[color:var(--border)] bg-black/10 px-6 py-12 text-center text-sm text-[color:var(--text-secondary)]">
          No hay series o peliculas en la biblioteca.
        </div>
      )}
    </div>
  )
}

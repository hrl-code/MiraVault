import { useCallback, useRef, useState } from 'react'

const PAGE_SIZE = 24

function normalizeType(type) {
  const value = String(type || 'movie').toLowerCase()
  if (value === 'movies' || value === 'peliculas') return 'movie'
  if (value === 'series') return 'series'
  if (value === 'books' || value === 'book' || value === 'libros') return 'book'
  if (value === 'all' || value === 'todos') return 'all'
  return 'movie'
}

function slicePage(items, page) {
  const start = Math.max(0, (page - 1) * PAGE_SIZE)
  return items.slice(start, start + PAGE_SIZE)
}

function normalizeItems(items) {
  return Array.isArray(items) ? items : []
}

function sortItems(items) {
  return [...normalizeItems(items)].sort((a, b) => {
    const byUpdated = Number(b.updatedAt || 0) - Number(a.updatedAt || 0)
    if (byUpdated !== 0) return byUpdated
    return String(a.title || '').localeCompare(String(b.title || ''), 'es')
  })
}

function filterByType(items, type) {
  const normalizedType = normalizeType(type)
  if (normalizedType === 'all') return items.filter((item) => item.type === 'movie' || item.type === 'series')
  return items.filter((item) => item.type === normalizedType)
}

function filterByQuery(items, query) {
  const safeQuery = String(query || '').trim().toLowerCase()
  if (!safeQuery) return items

  return items.filter((item) => {
    const haystack = [
      item.title,
      item.year,
      item.quality,
      item.language,
      ...(Array.isArray(item.genres) ? item.genres : [])
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return haystack.includes(safeQuery)
  })
}

export default function useCatalog() {
  const [items, setItems] = useState([])
  const [allItems, setAllItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const lastRequestRef = useRef({ mode: 'latest', type: 'all', query: '' })

  const fetchLatest = useCallback(async (type, nextPage = 1) => {
    setLoading(true)
    setError(null)

    try {
      const libraryItems = sortItems(await window.electronAPI?.libraryList?.())
      const result = filterByType(libraryItems, type)
      const visible = slicePage(result, 1)
      setAllItems(result)
      setItems(visible)
      setPage(1)
      setHasMore(result.length > visible.length)
      lastRequestRef.current = {
        mode: 'latest',
        type: normalizeType(type),
        query: ''
      }
      return result
    } catch (err) {
      setAllItems([])
      setItems([])
      setHasMore(false)
      setError(err?.message || 'No se pudo cargar el catalogo.')
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const search = useCallback(async (query, type) => {
    const safeQuery = String(query || '').trim()
    if (!safeQuery) {
      return fetchLatest(type, 1)
    }

    setLoading(true)
    setError(null)

    try {
      const libraryItems = sortItems(await window.electronAPI?.libraryList?.())
      const result = filterByQuery(filterByType(libraryItems, type), safeQuery)
      const visible = slicePage(result, 1)
      setAllItems(result)
      setItems(visible)
      setPage(1)
      setHasMore(result.length > visible.length)
      lastRequestRef.current = {
        mode: 'search',
        type: normalizeType(type),
        query: safeQuery
      }
      return result
    } catch (err) {
      setAllItems([])
      setItems([])
      setHasMore(false)
      setError(err?.message || 'No se pudo buscar contenido.')
      return []
    } finally {
      setLoading(false)
    }
  }, [fetchLatest])

  const loadMore = useCallback(async () => {
    const nextPage = page + 1
    if (loading || !hasMore) return []

    const nextVisible = slicePage(allItems, nextPage)
    if (nextVisible.length > 0) {
      setItems((current) => [...current, ...nextVisible])
      setPage(nextPage)
      setHasMore(allItems.length > nextPage * PAGE_SIZE)
      return nextVisible
    }

    const lastRequest = lastRequestRef.current
    if (lastRequest.mode !== 'latest') {
      setHasMore(false)
      return []
    }
    setHasMore(false)
    return []
  }, [allItems, hasMore, loading, page])

  return {
    items,
    loading,
    error,
    page,
    hasMore,
    fetchLatest,
    search,
    loadMore
  }
}

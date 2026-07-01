import { create } from 'zustand'

/**
 * Genera la clave de progreso para un item multimedia.
 * Para peliculas/libros: solo el mediaId.
 * Para episodios: mediaId:season:episode
 */
export function getProgressKey(itemOrId, season, episode) {
  const id = typeof itemOrId === 'string' ? itemOrId : itemOrId.id
  if (season != null && episode != null) return `${id}:${season}:${episode}`
  return id
}

function formatTimeRaw(seconds) {
  const s = Math.floor(Number(seconds) || 0)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${sec}s`
  return `${sec}s`
}

export function formatProgress(progress) {
  if (!progress) return ''
  if (progress.watched) return 'Visto'
  if (progress.currentTime > 0 && progress.duration > 0) {
    const pct = Math.round((progress.currentTime / progress.duration) * 100)
    return `${formatTimeRaw(progress.currentTime)} (${pct}%)`
  }
  if (progress.currentTime > 0) return formatTimeRaw(progress.currentTime)
  return ''
}

export function progressPercent(progress) {
  if (!progress) return 0
  if (progress.watched) return 100
  if (progress.currentTime > 0 && progress.duration > 0) {
    return Math.round((progress.currentTime / progress.duration) * 100)
  }
  return 0
}

export const useWatchProgressStore = create((set, get) => ({
  progress: {},
  loading: true,

  async loadProgress() {
    try {
      const data = await window.electronAPI?.getWatchProgress?.() || {}
      set({ progress: data, loading: false })
    } catch {
      set({ loading: false })
    }
  },

  async updateProgress(key, data) {
    try {
      const result = await window.electronAPI?.updateWatchProgress?.(key, data)
      if (result) {
        set((state) => ({
          progress: { ...state.progress, [key]: result }
        }))
      }
    } catch {
      // fallback silencioso
    }
  },

  applyExternalProgress(key, data) {
    if (!key || !data) return
    set((state) => ({
      progress: { ...state.progress, [key]: data }
    }))
  },

  async markWatched(key) {
    try {
      await window.electronAPI?.markWatched?.(key)
      set((state) => ({
        progress: {
          ...state.progress,
          [key]: { watched: true, currentTime: 0, duration: 0, updatedAt: Date.now() }
        }
      }))
    } catch {
      // fallback silencioso
    }
  },

  async markUnwatched(key) {
    try {
      await window.electronAPI?.markUnwatched?.(key)
      set((state) => {
        const { [key]: _, ...rest } = state.progress
        return { progress: rest }
      })
    } catch {
      // fallback silencioso
    }
  },

  getProgress(key) {
    return get().progress[key] || null
  },

  /** Obtiene items con progreso parcial (no vistos, no empezados desde 0) */
  getInProgress() {
    const entries = get().progress
    return Object.entries(entries)
      .filter(([, value]) => !value.watched && value.currentTime > 0)
      .sort(([, a], [, b]) => (b.updatedAt || 0) - (a.updatedAt || 0))
      .map(([key]) => key)
  },

  /** Obtiene items vistos */
  getWatched() {
    const entries = get().progress
    return Object.entries(entries)
      .filter(([, value]) => value.watched)
      .map(([key]) => key)
  }
}))

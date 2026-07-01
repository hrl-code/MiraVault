import { create } from 'zustand'

const STORAGE_KEY = 'mv-library-status'
const LEGACY_STORAGE_KEY = `${'t'}v-library-status`

function readStatuses() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY) || window.localStorage.getItem(LEGACY_STORAGE_KEY)
    const statuses = raw ? JSON.parse(raw) : {}
    if (!window.localStorage.getItem(STORAGE_KEY) && Object.keys(statuses).length > 0) {
      writeStatuses(statuses)
    }
    return statuses
  } catch {
    return {}
  }
}

function writeStatuses(statuses) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(statuses))
  } catch {
    // localStorage can fail in restricted contexts; keep runtime state alive.
  }
}

export const useLibraryStatusStore = create((set, get) => ({
  statuses: readStatuses(),

  setStatus(mediaId, status) {
    if (!mediaId) return
    set((state) => {
      const next = { ...state.statuses }
      if (!status || status === 'auto') delete next[mediaId]
      else next[mediaId] = status
      writeStatuses(next)
      return { statuses: next }
    })
  },

  getStatus(mediaId) {
    return get().statuses[mediaId] || null
  }
}))

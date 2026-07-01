import { create } from 'zustand'

const STORAGE_KEY = 'mv-favorites'
const LEGACY_STORAGE_KEY = `${'t'}v-favorites`

function readFavorites() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY)
    const parsed = JSON.parse(raw || '[]')
    const favorites = Array.isArray(parsed) ? parsed : []
    if (!localStorage.getItem(STORAGE_KEY) && favorites.length > 0) writeFavorites(favorites)
    return favorites
  } catch {
    return []
  }
}

function writeFavorites(favorites) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
}

export const useFavoritesStore = create((set, get) => ({
  favorites: readFavorites(),
  addFavorite(item) {
    const exists = get().favorites.some((entry) => entry.id === item.id)
    if (exists) return

    const favorites = [...get().favorites, item]
    writeFavorites(favorites)
    set({ favorites })
  },
  removeFavorite(id) {
    const favorites = get().favorites.filter((entry) => entry.id !== id)
    writeFavorites(favorites)
    set({ favorites })
  },
  isFavorite(id) {
    return get().favorites.some((entry) => entry.id === id)
  }
}))

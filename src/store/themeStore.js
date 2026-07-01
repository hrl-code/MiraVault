import { create } from 'zustand'

export const useThemeStore = create((set) => ({
  theme: 'dark-blue',
  setTheme: async (theme) => {
    set({ theme })
    await window.electronAPI?.setTheme?.(theme)
    document.documentElement.setAttribute('data-theme', theme)
  }
}))

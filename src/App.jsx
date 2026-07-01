import { useEffect } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import Home from '@/pages/Home'
import Movies from '@/pages/Movies'
import Series from '@/pages/Series'
import Books from '@/pages/Books'
import Favorites from '@/pages/Favorites'
import Library from '@/pages/Library'
import Downloads from '@/pages/Downloads'
import IPTV from '@/pages/IPTV'
import IPTVPlayer from '@/pages/IPTVPlayer'
import Folders from '@/pages/Folders'
import Settings from '@/pages/Settings'
import MediaDetails from '@/pages/MediaDetails'
import Player from '@/pages/Player'
import { useThemeStore } from '@/store/themeStore'
import { useWatchProgressStore } from '@/store/watchProgressStore'

export default function App() {
  const { theme, setTheme } = useThemeStore()
  const loadProgress = useWatchProgressStore((state) => state.loadProgress)
  const applyExternalProgress = useWatchProgressStore((state) => state.applyExternalProgress)

  useEffect(() => {
    const load = async () => {
      const saved = await window.electronAPI?.getTheme?.() ?? 'dark-blue'
      setTheme(saved)
    }
    load()
  }, [setTheme])

  useEffect(() => {
    loadProgress()
  }, [loadProgress])

  useEffect(() => {
    return window.electronAPI?.onWatchProgressChanged?.(({ key, progress }) => {
      applyExternalProgress(key, progress)
    })
  }, [applyExternalProgress])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/home" replace />} />
          <Route path="home" element={<Home />} />
          <Route path="movies" element={<Movies />} />
          <Route path="series" element={<Series />} />
          <Route path="books" element={<Books />} />
          <Route path="favorites" element={<Favorites />} />
          <Route path="library" element={<Library />} />
          <Route path="downloads" element={<Downloads />} />
          <Route path="iptv" element={<IPTV />} />
          <Route path="iptv/player" element={<IPTVPlayer />} />
          <Route path="folders" element={<Folders />} />
          <Route path="settings" element={<Settings />} />
          <Route path="media/:mediaId" element={<MediaDetails />} />
          <Route path="player" element={<Player />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}

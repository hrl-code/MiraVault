import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@/components/ui/Toast'

const STORAGE_KEY = 'mv-iptv-playlists'
const LEGACY_STORAGE_KEY = `${'t'}v-iptv-playlists`

function TvIcon({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="4" y="6" width="16" height="11" rx="2" />
      <path d="M10 20h4M12 17v3M9 3l3 3 3-3" />
    </svg>
  )
}

function parseAttributes(value) {
  const attrs = {}
  const pattern = /([\w-]+)="([^"]*)"/g
  let match = pattern.exec(value)
  while (match) {
    attrs[match[1]] = match[2]
    match = pattern.exec(value)
  }
  return attrs
}

function parseM3U(text, sourceName = 'IPTV') {
  const lines = String(text || '').split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
  const channels = []
  let current = null

  for (const line of lines) {
    if (line.startsWith('#EXTINF')) {
      const commaIndex = line.indexOf(',')
      const metadata = commaIndex >= 0 ? line.slice(0, commaIndex) : line
      const title = commaIndex >= 0 ? line.slice(commaIndex + 1).trim() : 'Canal sin nombre'
      const attrs = parseAttributes(metadata)
      current = {
        id: `${sourceName}:${channels.length}:${title}`,
        name: attrs['tvg-name'] || title,
        logo: attrs['tvg-logo'] || '',
        group: attrs['group-title'] || 'Sin grupo',
        url: '',
        source: sourceName
      }
      continue
    }

    if (!line.startsWith('#') && current) {
      channels.push({ ...current, url: line })
      current = null
    }
  }

  return channels
}

function readStoredPlaylists() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY)
    const parsed = JSON.parse(raw || '[]')
    const playlists = Array.isArray(parsed) ? parsed : []
    if (!localStorage.getItem(STORAGE_KEY) && playlists.length > 0) saveStoredPlaylists(playlists)
    return playlists
  } catch {
    return []
  }
}

function saveStoredPlaylists(playlists) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(playlists))
}

export default function IPTV() {
  const { show } = useToast()
  const navigate = useNavigate()
  const [playlists, setPlaylists] = useState([])
  const [name, setName] = useState('Mi IPTV')
  const [url, setUrl] = useState('')
  const [manualText, setManualText] = useState('')
  const [query, setQuery] = useState('')
  const [group, setGroup] = useState('all')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setPlaylists(readStoredPlaylists())
  }, [])

  const channels = useMemo(() => (
    playlists.flatMap((playlist) => parseM3U(playlist.content, playlist.name))
  ), [playlists])

  const groups = useMemo(() => (
    ['all', ...Array.from(new Set(channels.map((channel) => channel.group).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'es'))]
  ), [channels])

  const filteredChannels = useMemo(() => {
    const safeQuery = query.trim().toLowerCase()
    return channels.filter((channel) => {
      const matchesGroup = group === 'all' || channel.group === group
      const matchesQuery = !safeQuery || `${channel.name} ${channel.group} ${channel.source}`.toLowerCase().includes(safeQuery)
      return matchesGroup && matchesQuery
    })
  }, [channels, group, query])

  function persist(nextPlaylists) {
    setPlaylists(nextPlaylists)
    saveStoredPlaylists(nextPlaylists)
  }

  async function addFromUrl() {
    if (!url.trim()) {
      show('Pega una URL M3U/M3U8', 'error')
      return
    }

    setLoading(true)
    const result = await window.electronAPI?.iptvFetchPlaylist?.(url.trim())
    setLoading(false)

    if (!result?.ok) {
      show(result?.error || 'No se pudo cargar la lista IPTV', 'error')
      return
    }

    const playlist = {
      id: `${Date.now()}`,
      name: name.trim() || 'IPTV',
      url: url.trim(),
      content: result.text,
      updatedAt: Date.now()
    }
    persist([playlist, ...playlists.filter((entry) => entry.url !== playlist.url)])
    setUrl('')
    show(`Lista cargada: ${parseM3U(result.text, playlist.name).length} canales`, 'success')
  }

  function addManual() {
    if (!manualText.trim()) {
      show('Pega el contenido M3U primero', 'error')
      return
    }

    const playlist = {
      id: `${Date.now()}`,
      name: name.trim() || 'IPTV manual',
      url: '',
      content: manualText,
      updatedAt: Date.now()
    }
    persist([playlist, ...playlists])
    setManualText('')
    show(`Lista anadida: ${parseM3U(playlist.content, playlist.name).length} canales`, 'success')
  }

  async function refreshPlaylist(playlist) {
    if (!playlist.url) return
    setLoading(true)
    const result = await window.electronAPI?.iptvFetchPlaylist?.(playlist.url)
    setLoading(false)
    if (!result?.ok) {
      show(result?.error || 'No se pudo actualizar', 'error')
      return
    }
    persist(playlists.map((entry) => entry.id === playlist.id ? { ...entry, content: result.text, updatedAt: Date.now() } : entry))
    show('Lista actualizada', 'success')
  }

  function playChannel(channel) {
    const index = filteredChannels.findIndex((entry) => entry.url === channel.url)
    navigate('/iptv/player', {
      state: {
        channel,
        channels: filteredChannels,
        index: Math.max(0, index)
      }
    })
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-[color:var(--text-muted)]">Streaming</p>
          <h1 className="mt-2 text-4xl font-semibold text-[color:var(--text-primary)]">IPTV</h1>
          <p className="mt-2 max-w-2xl text-sm text-[color:var(--text-secondary)]">
            Anade listas M3U/M3U8 y abre canales con VLC o el reproductor externo configurado.
          </p>
        </div>
        <div className="rounded-full bg-[color:var(--accent-muted)] px-4 py-2 text-sm text-[color:var(--accent)]">
          {channels.length} canales
        </div>
      </header>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(340px,0.65fr)]">
        <div className="rounded-[24px] border border-[color:var(--border)] bg-[color:var(--bg-card)]/45 p-5">
          <h2 className="text-xl font-semibold text-[color:var(--text-primary)]">Anadir lista</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-[180px_minmax(0,1fr)_auto]">
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Nombre" className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg-secondary)] px-4 py-3 text-sm outline-none focus:border-[color:var(--accent)]" />
            <input value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://.../lista.m3u" className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg-secondary)] px-4 py-3 text-sm outline-none focus:border-[color:var(--accent)]" />
            <button type="button" onClick={addFromUrl} disabled={loading} className="rounded-xl bg-[color:var(--accent)] px-5 py-3 text-sm font-medium text-white disabled:opacity-60">
              {loading ? 'Cargando...' : 'Cargar URL'}
            </button>
          </div>
          <textarea value={manualText} onChange={(event) => setManualText(event.target.value)} rows={5} placeholder="O pega aqui el contenido #EXTM3U..." className="mt-3 w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg-secondary)] px-4 py-3 text-sm outline-none focus:border-[color:var(--accent)]" />
          <button type="button" onClick={addManual} className="mt-3 rounded-xl border border-[color:var(--border)] px-5 py-3 text-sm text-[color:var(--text-primary)] hover:bg-[color:var(--bg-hover)]">
            Anadir contenido pegado
          </button>
        </div>

        <div className="rounded-[24px] border border-[color:var(--border)] bg-[color:var(--bg-card)]/45 p-5">
          <h2 className="text-xl font-semibold text-[color:var(--text-primary)]">Listas</h2>
          <div className="mt-4 space-y-2">
            {playlists.length === 0 ? (
              <p className="text-sm text-[color:var(--text-muted)]">Todavia no hay listas IPTV.</p>
            ) : playlists.map((playlist) => (
              <div key={playlist.id} className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg-secondary)]/55 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[color:var(--text-primary)]">{playlist.name}</p>
                    <p className="truncate text-xs text-[color:var(--text-muted)]">{playlist.url || 'Manual'} · {parseM3U(playlist.content, playlist.name).length} canales</p>
                  </div>
                  <div className="flex gap-2">
                    {playlist.url ? <button type="button" onClick={() => refreshPlaylist(playlist)} className="rounded-lg px-2 py-1 text-xs text-[color:var(--accent)] hover:bg-[color:var(--accent-muted)]">Actualizar</button> : null}
                    <button type="button" onClick={() => persist(playlists.filter((entry) => entry.id !== playlist.id))} className="rounded-lg px-2 py-1 text-xs text-[#e05555] hover:bg-[#e05555]/10">Quitar</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-[24px] border border-[color:var(--border)] bg-[color:var(--bg-card)]/45 p-5">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <h2 className="text-xl font-semibold text-[color:var(--text-primary)]">Canales</h2>
          <div className="flex flex-col gap-2 md:flex-row">
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar canal..." className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg-secondary)] px-4 py-3 text-sm outline-none focus:border-[color:var(--accent)]" />
            <select value={group} onChange={(event) => setGroup(event.target.value)} className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg-secondary)] px-4 py-3 text-sm outline-none focus:border-[color:var(--accent)]">
              {groups.map((entry) => <option key={entry} value={entry}>{entry === 'all' ? 'Todos los grupos' : entry}</option>)}
            </select>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filteredChannels.map((channel) => (
            <button key={`${channel.source}-${channel.url}`} type="button" onClick={() => playChannel(channel)} className="group flex items-center gap-3 rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg-secondary)]/55 p-3 text-left transition hover:border-[color:var(--accent)] hover:bg-[color:var(--bg-hover)]">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[color:var(--accent-muted)] text-[color:var(--accent)]">
                {channel.logo ? <img src={channel.logo} alt="" className="h-full w-full object-contain" /> : <TvIcon />}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-[color:var(--text-primary)]">{channel.name}</p>
                <p className="truncate text-xs text-[color:var(--text-muted)]">{channel.group} · {channel.source}</p>
              </div>
            </button>
          ))}
        </div>

        {channels.length > 0 && filteredChannels.length === 0 ? (
          <p className="mt-6 text-center text-sm text-[color:var(--text-muted)]">No hay canales para ese filtro.</p>
        ) : null}
      </section>
    </div>
  )
}

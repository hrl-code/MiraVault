import { Link, useLocation } from 'react-router-dom'

function SectionLabel({ children }) {
  return (
    <p className="px-4 text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-muted)]">
      {children}
    </p>
  )
}

function GridIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="4" y="4" width="6" height="6" rx="1" />
      <rect x="14" y="4" width="6" height="6" rx="1" />
      <rect x="4" y="14" width="6" height="6" rx="1" />
      <rect x="14" y="14" width="6" height="6" rx="1" />
    </svg>
  )
}

function FilmIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <path d="M8 5v14M16 5v14M4 10h4M16 10h4M4 14h4M16 14h4" />
    </svg>
  )
}

function SignalIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M5 19.5h.01" />
      <path d="M5 14a5.5 5.5 0 0 1 5.5 5.5" />
      <path d="M5 8.5a11 11 0 0 1 11 11" />
      <path d="M5 3a16.5 16.5 0 0 1 16.5 16.5" />
    </svg>
  )
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 4v10" />
      <path d="m8 10 4 4 4-4" />
      <path d="M5 20h14" />
    </svg>
  )
}

function FolderIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H10l2 2h6.5A2.5 2.5 0 0 1 21 9.5v7A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5v-9Z" />
    </svg>
  )
}

function GearIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 8.5A3.5 3.5 0 1 1 8.5 12 3.5 3.5 0 0 1 12 8.5Z" />
      <path d="m19 12 1.6-1-1.6-2.8-1.8.3a6.8 6.8 0 0 0-1.5-.9L15 5h-3l-.7 2.6a6.8 6.8 0 0 0-1.5.9L8 8.2 6.4 11 8 12l-1.6 1 1.6 2.8 1.8-.3c.5.4 1 .7 1.5.9L12 19h3l.7-2.6c.5-.2 1-.5 1.5-.9l1.8.3L20.6 13 19 12Z" />
    </svg>
  )
}

const catalogItems = [
  { to: '/home', label: 'Inicio', icon: GridIcon },
  { to: '/library', label: 'Biblioteca', icon: FilmIcon },
  { to: '/iptv', label: 'IPTV', icon: SignalIcon },
  { to: '/downloads', label: 'Torrents', icon: DownloadIcon },
  { to: '/folders', label: 'Carpetas', icon: FolderIcon }
]

function SidebarItem({ item, pathname }) {
  const active = pathname === item.to
  const Icon = item.icon

  return (
    <Link
      to={item.to}
      className={[
        'group flex items-center gap-3 border-l-2 px-4 py-2.5 text-sm transition-colors',
        active
          ? 'border-[color:var(--accent)] bg-[color:var(--accent-muted)] text-[color:var(--accent)]'
          : 'border-transparent text-[color:var(--text-secondary)] hover:bg-[color:var(--bg-hover)] hover:text-[color:var(--text-primary)]'
      ].join(' ')}
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[color:var(--bg-card)] text-current">
        <Icon />
      </span>
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
    </Link>
  )
}

export default function Sidebar() {
  const location = useLocation()

  return (
    <aside className="flex w-[220px] flex-col overflow-hidden border-r border-[color:var(--border)] bg-[color:var(--bg-secondary)]">
      <div className="flex-1 overflow-y-auto py-5 [scrollbar-color:var(--scrollbar)_transparent] [scrollbar-width:thin]">
        <div className="space-y-6">
          <section className="space-y-2">
            <SectionLabel>Catalogo</SectionLabel>
            <div>
              {catalogItems.map((item) => (
                <SidebarItem
                  key={item.to}
                  item={item}
                  pathname={location.pathname}
                />
              ))}
            </div>
          </section>
        </div>
      </div>

      <div className="border-t border-[color:var(--border)] px-4 py-4">
        <Link
          to="/settings"
          className={[
            'flex items-center gap-3 rounded-2xl border px-3 py-2.5 text-sm transition-colors',
            location.pathname === '/settings'
              ? 'border-[color:var(--accent)] bg-[color:var(--accent-muted)] text-[color:var(--accent)]'
              : 'border-[color:var(--border)] text-[color:var(--text-secondary)] hover:bg-[color:var(--bg-hover)] hover:text-[color:var(--text-primary)]'
          ].join(' ')}
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[color:var(--bg-card)]">
            <GearIcon />
          </span>
          Configuracion
        </Link>
      </div>
    </aside>
  )
}

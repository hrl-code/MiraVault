import { useFavoritesStore } from '@/store/favoritesStore'
import MediaCard from '@/components/catalog/MediaCard'
import EmptyState from '@/components/ui/EmptyState'
import { useToast } from '@/components/ui/Toast'

function HeartOffIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="m12 20-1.1-1C6 14.5 3 11.8 3 8.5A4.5 4.5 0 0 1 7.5 4 5 5 0 0 1 12 6.1 5 5 0 0 1 16.5 4 4.5 4.5 0 0 1 21 8.5c0 3.3-3 6-7.9 10.5L12 20Z" />
      <path d="m5 5 14 14" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m7 7 10 10" />
      <path d="m17 7-10 10" />
    </svg>
  )
}

export default function Favorites() {
  const favorites = useFavoritesStore((state) => state.favorites)
  const removeFavorite = useFavoritesStore((state) => state.removeFavorite)
  const { show } = useToast()

  function handleRemove(id) {
    removeFavorite(id)
    show('Eliminado de favoritos', 'info')
  }

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.32em] text-[color:var(--text-muted)]">Coleccion</p>
        <div>
          <h1 className="text-4xl font-semibold text-[color:var(--text-primary)]">Favoritos</h1>
          <p className="mt-2 max-w-2xl text-sm text-[color:var(--text-secondary)]">
            Guarda tus titulos favoritos y recuperalos rapido cuando quieras reproducirlos o revisarlos.
          </p>
        </div>
      </header>

      {favorites.length > 0 ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4">
          {favorites.map((item) => (
            <div key={`${item.id}-${item.provider || 'favorite'}`} className="flex justify-center">
              <MediaCard
                item={item}
                overlay={
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation()
                      handleRemove(item.id)
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-[#7c2632]/85 text-white opacity-0 transition hover:bg-[#e05555] group-hover:opacity-100"
                    aria-label="Quitar de favoritos"
                  >
                    <CloseIcon />
                  </button>
                }
              />
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<HeartOffIcon />}
          title="Aun no tienes favoritos"
          description="Marca contenido con el corazon para construir tu lista personal y volver a ella cuando quieras."
        />
      )}
    </div>
  )
}

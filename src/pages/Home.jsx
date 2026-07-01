import CatalogPage from '@/components/catalog/CatalogPage'
import ContinueWatching from '@/components/catalog/ContinueWatching'

export default function Home() {
  return (
    <div className="space-y-8">
      <ContinueWatching />
      <CatalogPage
        title="Inicio"
        description="Explora las ultimas incorporaciones de tu biblioteca local y encuentra rapido que reproducir o revisar."
        initialType="all"
      />
    </div>
  )
}

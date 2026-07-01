import CatalogPage from '@/components/catalog/CatalogPage'

export default function Movies() {
  return (
    <CatalogPage
      title="Peliculas"
      description="Tus peliculas detectadas automaticamente, con caratulas, calidad, idioma y metadatos enriquecidos."
      initialType="movie"
    />
  )
}

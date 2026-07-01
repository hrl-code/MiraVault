import CatalogPage from '@/components/catalog/CatalogPage'

export default function Books() {
  return (
    <CatalogPage
      title="Libros"
      description="Tu estanteria digital local, con portadas y clasificacion basadas en los archivos importados."
      initialType="book"
    />
  )
}

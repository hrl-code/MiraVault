const { previewOrganizeSeriesFolder, organizeSeriesFolder } = require('./library')

async function main() {
  const action = process.argv[2]
  const rootPath = process.argv[3]

  if (!rootPath || (action !== 'preview' && action !== 'organize')) {
    process.stdout.write(JSON.stringify({ ok: false, error: 'Solicitud de organizador no valida.', items: [] }))
    return
  }

  const result = action === 'organize'
    ? await organizeSeriesFolder(rootPath)
    : await previewOrganizeSeriesFolder(rootPath)

  process.stdout.write(JSON.stringify(result || { ok: false, error: 'Sin resultado.', items: [] }))
}

main().catch((error) => {
  process.stdout.write(JSON.stringify({
    ok: false,
    error: error.message || 'Error interno del organizador.',
    items: []
  }))
})

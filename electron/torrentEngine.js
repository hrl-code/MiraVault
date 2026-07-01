const fs = require('fs')
const qbittorrent = require('./qbittorrent')
const webtorrent = require('./torrentWebtorrent')
const { getStore } = require('./storeHelper')
const { importPaths } = require('./library')

const DEFAULT_CONFIG = {
  engine: 'webtorrent'
}

async function getActiveEngineId() {
  const store = await getStore()
  return store.get('torrentEngine.engine', DEFAULT_CONFIG.engine)
}

function getEngine(engineId) {
  return engineId === 'qbittorrent' ? qbittorrent : webtorrent
}

async function getConfig() {
  const engine = await getActiveEngineId()
  return {
    engine,
    webtorrent: await webtorrent.getConfig(),
    qbittorrent: await qbittorrent.getConfig()
  }
}

async function setConfig(config = {}) {
  const store = await getStore()
  const engine = config.engine === 'qbittorrent' ? 'qbittorrent' : 'webtorrent'
  store.set('torrentEngine.engine', engine)

  const next = { engine }
  if (config.webtorrent) next.webtorrent = await webtorrent.setConfig(config.webtorrent)
  else next.webtorrent = await webtorrent.getConfig()

  if (config.qbittorrent) next.qbittorrent = await qbittorrent.setConfig(config.qbittorrent)
  else next.qbittorrent = await qbittorrent.getConfig()

  return next
}

async function getEngineStatus() {
  const engine = await getActiveEngineId()
  const status = await getEngine(engine).getEngineStatus?.() || await getEngine(engine).getStatus?.()
  return { ...(status || {}), engine }
}

async function ping() {
  const engine = await getActiveEngineId()
  const result = await getEngine(engine).ping()
  return { ...(result || {}), engine }
}

async function listTorrents(filter = 'all') {
  return getEngine(await getActiveEngineId()).listTorrents(filter)
}

async function getTransferInfo() {
  return getEngine(await getActiveEngineId()).getTransferInfo()
}

async function addTorrent(payload = {}) {
  return getEngine(await getActiveEngineId()).addTorrent(payload)
}

async function pauseTorrent(id) {
  return getEngine(await getActiveEngineId()).pauseTorrent(id)
}

async function resumeTorrent(id) {
  return getEngine(await getActiveEngineId()).resumeTorrent(id)
}

async function deleteTorrent(payload = {}) {
  return getEngine(await getActiveEngineId()).deleteTorrent(payload)
}

async function openContent(torrent) {
  const engine = torrent?.engine || await getActiveEngineId()
  if (engine === 'webtorrent' && webtorrent.openContent) return webtorrent.openContent(torrent)

  const targetPath = qbittorrent.getTorrentContentRoot(torrent)
  const fallbackPath = torrent?.save_path || ''
  const existingPath = targetPath && fs.existsSync(targetPath) ? targetPath : fallbackPath
  if (!existingPath) return { ok: false, error: 'No se pudo resolver la ruta.' }
  const { shell } = require('electron')
  const openResult = await shell.openPath(existingPath)
  return openResult ? { ok: false, error: openResult } : { ok: true }
}

async function importContent(torrent) {
  const engine = torrent?.engine || await getActiveEngineId()
  const targetPath = engine === 'webtorrent'
    ? webtorrent.getTorrentContentRoot(torrent)
    : qbittorrent.getTorrentContentRoot(torrent)
  const fallbackPath = torrent?.save_path || ''
  const existingPath = targetPath && fs.existsSync(targetPath) ? targetPath : fallbackPath
  if (!existingPath || !fs.existsSync(existingPath)) return { ok: false, error: 'La ruta descargada todavia no existe.' }
  const imported = await importPaths([existingPath])
  return { ok: true, imported }
}

module.exports = {
  getConfig,
  setConfig,
  getEngineStatus,
  ping,
  listTorrents,
  getTransferInfo,
  addTorrent,
  pauseTorrent,
  resumeTorrent,
  deleteTorrent,
  openContent,
  importContent
}

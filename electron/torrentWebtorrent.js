const fs = require('fs')
const path = require('path')
const { app, shell } = require('electron')
const { getStore } = require('./storeHelper')

const DEFAULT_CONFIG = {
  downloadPath: path.join(process.env.USERPROFILE || process.env.HOME || process.cwd(), 'Downloads', 'MiraVault')
}

let clientPromise = null
const sources = new Map()
const errors = new Map()

async function getWebTorrentClass() {
  const mod = await import('webtorrent')
  return mod.default
}

async function getClient() {
  if (!clientPromise) {
    clientPromise = getWebTorrentClass().then((WebTorrent) => {
      const client = new WebTorrent()
      client.on('error', (error) => {
        errors.set('client', error.message)
      })
      return client
    })
  }
  return clientPromise
}

function cleanText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim()
}

function ensureDirectory(directory) {
  fs.mkdirSync(directory, { recursive: true })
  return directory
}

function getDefaultDownloadPath() {
  return app?.getPath ? path.join(app.getPath('downloads'), 'MiraVault') : DEFAULT_CONFIG.downloadPath
}

async function getConfig() {
  const store = await getStore()
  return {
    ...DEFAULT_CONFIG,
    downloadPath: getDefaultDownloadPath(),
    ...(store.get('webtorrent') || {})
  }
}

async function setConfig(config = {}) {
  const store = await getStore()
  const current = await getConfig()
  const next = {
    downloadPath: cleanText(config.downloadPath ?? current.downloadPath ?? getDefaultDownloadPath())
  }
  store.set('webtorrent', next)
  return next
}

async function getQueue() {
  const store = await getStore()
  return Array.isArray(store.get('webtorrent.queue')) ? store.get('webtorrent.queue') : []
}

async function saveQueue(queue) {
  const store = await getStore()
  store.set('webtorrent.queue', queue)
}

async function upsertQueueEntry(entry) {
  const queue = await getQueue()
  const next = queue.filter((item) => item.id !== entry.id && item.source !== entry.source)
  next.push(entry)
  await saveQueue(next)
}

async function removeQueueEntry(id) {
  const queue = await getQueue()
  await saveQueue(queue.filter((item) => item.id !== id))
}

function torrentSourceFromPayload({ magnetOrUrl, torrentFiles } = {}) {
  const value = cleanText(magnetOrUrl)
  if (value) return { source: value, sourceType: value.startsWith('magnet:') ? 'magnet' : 'url' }

  const firstFile = Array.isArray(torrentFiles) ? torrentFiles.find(Boolean) : ''
  if (firstFile) return { source: firstFile, sourceType: 'file' }

  return { source: '', sourceType: '' }
}

function torrentIdFromSource(source) {
  if (!source) return ''
  if (source.startsWith('magnet:')) {
    const match = source.match(/btih:([a-zA-Z0-9]+)/)
    return match ? match[1].toLowerCase() : source
  }
  return source
}

function getTorrentFilePath(file) {
  return file?.path || ''
}

function normalizeTorrent(torrent) {
  const source = sources.get(torrent.infoHash) || {}
  const done = Boolean(torrent.done || torrent.progress >= 1)
  const paused = Boolean(torrent.paused)
  const state = errors.get(torrent.infoHash)
    ? 'error'
    : done
      ? 'uploading'
      : paused
        ? 'pausedDL'
        : torrent.ready
          ? 'downloading'
          : 'metadata'

  return {
    hash: torrent.infoHash,
    id: torrent.infoHash,
    engine: 'webtorrent',
    name: torrent.name || source.name || 'Torrent sin metadata',
    state,
    progress: Number(torrent.progress || 0),
    dlspeed: Number(torrent.downloadSpeed || 0),
    upspeed: Number(torrent.uploadSpeed || 0),
    size: Number(torrent.length || 0),
    completed: Number(torrent.downloaded || 0),
    save_path: source.savePath || torrent.path || '',
    eta: Number(torrent.timeRemaining || 0) > 0 ? Math.round(Number(torrent.timeRemaining || 0) / 1000) : 0,
    num_seeds: 0,
    num_leechs: Number(torrent.numPeers || 0),
    category: 'webtorrent',
    files: Array.isArray(torrent.files)
      ? torrent.files.map((file) => ({
        name: file.name,
        path: getTorrentFilePath(file),
        length: file.length,
        downloaded: file.downloaded
      }))
      : [],
    error: errors.get(torrent.infoHash) || ''
  }
}

async function rememberTorrent(torrent, entry) {
  const id = torrent.infoHash || entry.id || torrentIdFromSource(entry.source)
  const next = {
    ...entry,
    id,
    name: torrent.name || entry.name || '',
    addedAt: entry.addedAt || Date.now()
  }
  sources.set(id, next)
  await upsertQueueEntry(next)
}

async function addOne(entry) {
  const client = await getClient()
  const savePath = ensureDirectory(entry.savePath)
  const torrentId = entry.sourceType === 'file' ? fs.readFileSync(entry.source) : entry.source

  return new Promise((resolve) => {
    let settled = false
    const torrent = client.add(torrentId, { path: savePath }, async (readyTorrent) => {
      if (settled) return
      settled = true
      await rememberTorrent(readyTorrent, entry)
      resolve({ ok: true, id: readyTorrent.infoHash, name: readyTorrent.name, savePath })
    })

    const guessedId = torrent.infoHash || entry.id || torrentIdFromSource(entry.source)
    sources.set(guessedId, { ...entry, id: guessedId })

    torrent.on('infoHash', async () => {
      await rememberTorrent(torrent, entry)
    })
    torrent.on('metadata', async () => {
      await rememberTorrent(torrent, entry)
    })
    torrent.on('done', async () => {
      await rememberTorrent(torrent, { ...entry, completedAt: Date.now() })
    })
    torrent.on('error', (error) => {
      errors.set(torrent.infoHash || guessedId, error.message)
      if (!settled) {
        settled = true
        resolve({ ok: false, error: error.message })
      }
    })

    setTimeout(() => {
      if (!settled) {
        settled = true
        resolve({ ok: true, id: torrent.infoHash || guessedId, name: torrent.name || entry.name || 'Esperando metadata', savePath, pendingMetadata: true })
      }
    }, 1500)
  })
}

async function restoreQueue() {
  const queue = await getQueue()
  if (queue.length === 0) return
  const client = await getClient()

  for (const entry of queue) {
    const id = entry.id || torrentIdFromSource(entry.source)
    if (!entry.source || client.get(id)) continue
    try {
      await addOne(entry)
    } catch (error) {
      errors.set(id, error.message)
    }
  }
}

async function getStatus() {
  try {
    await getClient()
    return {
      ok: true,
      engine: 'webtorrent',
      mode: 'webtorrent',
      activeUrl: 'internal://webtorrent',
      managedAvailable: true,
      managedRunning: true,
      error: errors.get('client') || ''
    }
  } catch (error) {
    return { ok: false, engine: 'webtorrent', mode: 'webtorrent', error: error.message }
  }
}

async function ping() {
  return getStatus()
}

async function listTorrents() {
  try {
    await restoreQueue()
    const client = await getClient()
    return client.torrents.map(normalizeTorrent)
  } catch {
    return []
  }
}

async function getTransferInfo() {
  const items = await listTorrents()
  return {
    dl_info_speed: items.reduce((sum, item) => sum + Number(item.dlspeed || 0), 0),
    up_info_speed: items.reduce((sum, item) => sum + Number(item.upspeed || 0), 0)
  }
}

async function addTorrent(payload = {}) {
  const { source, sourceType } = torrentSourceFromPayload(payload)
  if (!source) return { ok: false, error: 'Pega un magnet/URL o selecciona un archivo .torrent.' }
  if (sourceType === 'file' && !fs.existsSync(source)) return { ok: false, error: 'El archivo .torrent no existe.' }

  const config = await getConfig()
  const savePath = ensureDirectory(cleanText(payload.savePath) || config.downloadPath)
  const entry = {
    id: torrentIdFromSource(source),
    source,
    sourceType,
    savePath,
    name: sourceType === 'file' ? path.basename(source, path.extname(source)) : ''
  }

  try {
    const client = await getClient()
    if (entry.id && client.get(entry.id)) return { ok: false, error: 'Este torrent ya existe en la cola.' }
    const result = await addOne(entry)
    return result.ok ? { ...result, savePath } : result
  } catch (error) {
    return { ok: false, error: error.message }
  }
}

async function pauseTorrent(id) {
  const client = await getClient()
  const torrent = client.get(id)
  if (!torrent) return { ok: false, error: 'Torrent no encontrado.' }
  torrent.pause()
  return { ok: true }
}

async function resumeTorrent(id) {
  const client = await getClient()
  const torrent = client.get(id)
  if (!torrent) return { ok: false, error: 'Torrent no encontrado.' }
  torrent.resume()
  return { ok: true }
}

async function deleteTorrent({ hash, id, deleteFiles = false } = {}) {
  const targetId = hash || id
  if (!targetId) return { ok: false, error: 'Falta id.' }
  const client = await getClient()
  const torrent = client.get(targetId)
  const normalized = torrent ? normalizeTorrent(torrent) : null

  if (torrent) {
    await new Promise((resolve) => torrent.destroy({ destroyStore: Boolean(deleteFiles) }, () => resolve()))
  }

  if (deleteFiles && normalized?.files?.length) {
    for (const file of normalized.files) {
      const filePath = file.path
      if (filePath && normalized.save_path && path.resolve(filePath).startsWith(path.resolve(normalized.save_path))) {
        fs.rmSync(filePath, { force: true })
      }
    }
  }

  sources.delete(targetId)
  errors.delete(targetId)
  await removeQueueEntry(targetId)
  return { ok: true }
}

function getTorrentContentRoot(torrent) {
  const savePath = torrent?.save_path || torrent?.savePath || ''
  const name = torrent?.name || ''
  if (!savePath) return ''
  const candidate = name ? path.join(savePath, name) : savePath
  return fs.existsSync(candidate) ? candidate : savePath
}

async function openContent(torrent) {
  const targetPath = getTorrentContentRoot(torrent)
  if (!targetPath) return { ok: false, error: 'No se pudo resolver la ruta.' }
  const openResult = await shell.openPath(targetPath)
  return openResult ? { ok: false, error: openResult } : { ok: true }
}

async function shutdown() {
  if (!clientPromise) return { ok: true }
  const client = await clientPromise
  await new Promise((resolve) => client.destroy(() => resolve()))
  clientPromise = null
  sources.clear()
  return { ok: true }
}

module.exports = {
  getConfig,
  setConfig,
  getStatus,
  ping,
  listTorrents,
  getTransferInfo,
  addTorrent,
  pauseTorrent,
  resumeTorrent,
  deleteTorrent,
  getTorrentContentRoot,
  openContent,
  shutdown
}

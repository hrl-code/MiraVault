const { getStore } = require('./storeHelper')

async function getWatchProgress() {
  const store = await getStore()
  return store.get('watchProgress', {})
}

async function saveWatchProgress(progress) {
  const store = await getStore()
  store.set('watchProgress', progress)
}

async function getProgress(key) {
  const all = await getWatchProgress()
  return all[key] || null
}

async function updateProgress(key, data) {
  const all = await getWatchProgress()
  all[key] = {
    ...(all[key] || {}),
    ...data,
    updatedAt: Date.now()
  }
  await saveWatchProgress(all)
  return all[key]
}

async function markWatched(key) {
  return updateProgress(key, { watched: true, currentTime: 0, duration: 0 })
}

async function markUnwatched(key) {
  const all = await getWatchProgress()
  delete all[key]
  await saveWatchProgress(all)
  return true
}

async function getAllProgress() {
  return getWatchProgress()
}

async function clearAllProgress() {
  await saveWatchProgress({})
  return true
}

module.exports = {
  getProgress,
  updateProgress,
  markWatched,
  markUnwatched,
  getAllProgress,
  clearAllProgress
}

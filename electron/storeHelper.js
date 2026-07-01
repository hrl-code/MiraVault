let storePromise = null

async function getStore() {
  if (!storePromise) {
    storePromise = import('electron-store').then(({ default: Store }) => (
      new Store({ name: 'miravault-config' })
    ))
  }

  return storePromise
}

async function getValue(key, fallbackValue) {
  return (await getStore()).get(key, fallbackValue)
}

async function setValue(key, value) {
  ;(await getStore()).set(key, value)
  return true
}

module.exports = { getStore, getValue, setValue }

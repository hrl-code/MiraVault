const fs = require('fs')
const path = require('path')

const rootDir = path.resolve(__dirname, '..')
const publicDir = path.join(rootDir, 'public')
const pngPath = path.join(publicDir, 'icon.png')
const icoPath = path.join(publicDir, 'icon.ico')

const pngBase64 =
  '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'

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true })
}

function writePng() {
  if (!fs.existsSync(pngPath)) {
    fs.writeFileSync(pngPath, Buffer.from(pngBase64, 'base64'))
  }
}

function writeIcoFromPng() {
  if (fs.existsSync(icoPath)) return

  const pngBuffer = Buffer.from(pngBase64, 'base64')
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(1, 4)

  const directoryEntry = Buffer.alloc(16)
  directoryEntry.writeUInt8(0, 0)
  directoryEntry.writeUInt8(0, 1)
  directoryEntry.writeUInt8(0, 2)
  directoryEntry.writeUInt8(0, 3)
  directoryEntry.writeUInt16LE(1, 4)
  directoryEntry.writeUInt16LE(32, 6)
  directoryEntry.writeUInt32LE(pngBuffer.length, 8)
  directoryEntry.writeUInt32LE(22, 12)

  fs.writeFileSync(icoPath, Buffer.concat([header, directoryEntry, pngBuffer]))
}

function run() {
  ensureDir(publicDir)
  writePng()
  writeIcoFromPng()
  console.log('Placeholder icon assets ready.')
}

run()

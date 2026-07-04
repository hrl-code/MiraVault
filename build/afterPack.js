const fs = require('fs')
const path = require('path')

module.exports = async function afterPack(context) {
  if (context.electronPlatformName !== 'win32') return

  const exePath = path.join(context.appOutDir, `${context.packager.appInfo.productFilename}.exe`)
  const iconPath = path.join(context.packager.projectDir, 'public', 'icon.ico')

  if (!fs.existsSync(exePath) || !fs.existsSync(iconPath)) return

  const rcedit = require('rcedit')
  await rcedit(exePath, {
    icon: iconPath,
    'version-string': {
      CompanyName: 'MiraVault',
      FileDescription: 'MiraVault',
      ProductName: 'MiraVault',
      OriginalFilename: 'MiraVault.exe',
      InternalName: 'MiraVault'
    }
  })
}

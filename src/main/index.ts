import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { store, AppConfig, getConfig } from './config'
import { AuthService } from './auth'
import { uploaderService } from './uploader'
import { schedulerService } from './scheduler'

let mainWindow: BrowserWindow
const authService = new AuthService()

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 850,
    show: false,
    autoHideMenuBar: true,
    icon: join(__dirname, '../../resources/icon.png'),
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
    // mainWindow.webContents.openDevTools({ mode: 'detach' })
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  // IPC Handlers
  ipcMain.handle('get-config', () => getConfig())
  ipcMain.handle('set-config', (_, newConfig: Partial<AppConfig>) => {
    store.set(newConfig as any)
    if (newConfig.schedule) {
      schedulerService.restart()
    }
  })

  ipcMain.handle('select-folder', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory']
    })
    if (result.canceled) return null
    return result.filePaths[0]
  })

  ipcMain.handle('authenticate', async () => {
    await authService.authenticate()
    return true
  })

  ipcMain.handle('is-authenticated', async () => {
    return authService.checkLoggedIn()
  })

  ipcMain.handle('logout', async () => {
    return authService.logout()
  })

  ipcMain.handle('get-channel-info', async () => {
    return authService.getChannelInfo()
  })

  ipcMain.handle('trigger-scan', async () => {
    return uploaderService.scanAndUpload()
  })

  ipcMain.handle('cancel-upload', async () => {
    return uploaderService.cancelUpload()
  })

  ipcMain.handle('is-uploading', async () => {
    return uploaderService.isUploading
  })

  createWindow()
  schedulerService.start()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

export { mainWindow }

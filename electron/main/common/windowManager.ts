/* eslint-disable class-methods-use-this */
import chokidar from 'chokidar'
import { BrowserWindow, WebContents, screen, shell } from 'electron'
import Store from 'electron-store'

import { StoreSchema, StoreKeys } from '../electron-store/storeConfig'
import LanceDBTableWrapper from '../vector-database/lanceTableWrapper'

type WindowInfo = {
  windowID: number
  dbTableClient: LanceDBTableWrapper
  vaultDirectoryForWindow: string
}

class WindowsManager {
  activeWindows: WindowInfo[] = []

  private errorStringsToSendWindow: string[] = []

  watcher: chokidar.FSWatcher | undefined

  async createWindow(store: Store<StoreSchema>, preload: string, url: string | undefined, indexHtml: string) {
    const { x, y } = this.getNextWindowPosition()
    const { width, height } = this.getWindowSize()

    const win = new BrowserWindow({
      title: 'Reor',
      x,
      y,
      webPreferences: {
        preload,
        webSecurity: true,
        contextIsolation: true,
      },
      frame: false,
      titleBarStyle: 'hidden',
      titleBarOverlay: {
        color: '#303030',
        symbolColor: '#fff',
        height: 30,
      },
      width,
      height,
    })

    win.webContents.session.webRequest.onHeadersReceived((details, callback) => {
      console.log('Setting CSP headers...')
      const newHeaders = {
        responseHeaders: {
          ...details.responseHeaders,
          'Content-Security-Policy': [
            "default-src 'self' 'unsafe-inline'; " +
              "img-src 'self' data: blob: https:; " +
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'; " +
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
              "font-src 'self' https://fonts.gstatic.com; " +
              "connect-src 'self' https://* wss://*;",
          ],
        },
      }
      console.log('New headers:', newHeaders)
      callback(newHeaders)
    })

    if (url) {
      // electron-vite-vue#298
      win.loadURL(url)
      // Open devTool if the app is not packaged
      win.webContents.openDevTools()
    } else {
      win.loadFile(indexHtml)
    }

    // Make all links open with the browser, not with the application
    win.webContents.setWindowOpenHandler(({ url: _url }) => {
      if (_url.startsWith('https:')) shell.openExternal(_url)
      return { action: 'deny' }
    })

    win.on('close', () => {
      win.webContents.send('prepare-for-window-close')

      this.prepareWindowForClose(store, win)
    })

    win.webContents.on('did-finish-load', () => {
      const errorsToSendWindow = this.getAndClearErrorStrings()
      errorsToSendWindow.forEach((errorStrToSendWindow) => {
        win.webContents.send('error-to-display-in-window', errorStrToSendWindow)
      })
    })
  }

  getAndSetupDirectoryForWindowFromPreviousAppSession(
    webContents: Electron.WebContents,
    store: Store<StoreSchema>,
  ): string {
    const lastUsedVaultDirectory = store.get(StoreKeys.DirectoryFromPreviousSession) as string
    if (!lastUsedVaultDirectory) {
      return ''
    }
    const isUserDirectoryUsed = this.activeWindows.some((w) => w.vaultDirectoryForWindow === lastUsedVaultDirectory)
    if (!isUserDirectoryUsed) {
      this.setVaultDirectoryForContents(webContents, lastUsedVaultDirectory, store)
      return lastUsedVaultDirectory
    }
    return ''
  }

  appendNewErrorToDisplayInWindow(errorString: string) {
    let errorSent = false
    const activeWindows = BrowserWindow.getAllWindows()
    activeWindows.forEach((window) => {
      if (!window.webContents.isLoading()) {
        window.webContents.send('error-to-display-in-window', errorString)
        errorSent = true
      }
    })

    if (!errorSent) {
      this.errorStringsToSendWindow.push(errorString)
    }
  }

  getAndClearErrorStrings(): string[] {
    const errorStrings = this.errorStringsToSendWindow
    this.errorStringsToSendWindow = []
    return errorStrings
  }

  getBrowserWindowId(webContents: WebContents): number | null {
    const browserWindow = BrowserWindow.fromWebContents(webContents)
    return browserWindow ? browserWindow.id : null
  }

  getWindowInfoForContents(webContents: WebContents): WindowInfo | null {
    const windowID = this.getBrowserWindowId(webContents)

    if (windowID === null) {
      return null
    }

    const windowInfo = this.activeWindows.find((w) => w.windowID === windowID)
    return windowInfo || null
  }

  getVaultDirectoryForWinContents(webContents: WebContents): string | null {
    const windowID = this.getBrowserWindowId(webContents)
    return windowID ? this.getVaultDirectoryForWindowID(windowID) : null
  }

  private getVaultDirectoryForWindowID(windowID: number): string | null {
    const windowInfo = this.activeWindows.find((w) => w.windowID === windowID)
    return windowInfo ? windowInfo.vaultDirectoryForWindow : null
  }

  setVaultDirectoryForContents(webContents: WebContents, directory: string, store: Store<StoreSchema>): void {
    if (!webContents) {
      throw new Error('Invalid webContents provided.')
    }

    const windowID = this.getBrowserWindowId(webContents)
    if (!windowID) {
      throw new Error('Unable to find the browser window ID.')
    }

    if (!directory || typeof directory !== 'string') {
      throw new Error('Invalid directory provided.')
    }

    let windowInfo = this.activeWindows.find((w) => w.windowID === windowID)

    if (!windowInfo) {
      windowInfo = {
        windowID,
        dbTableClient: new LanceDBTableWrapper(), // Assuming default value as null, modify as needed
        vaultDirectoryForWindow: directory,
      }
      this.activeWindows.push(windowInfo)
    } else {
      windowInfo.vaultDirectoryForWindow = directory
    }

    store.set(StoreKeys.DirectoryFromPreviousSession, directory)
  }

  prepareWindowForClose(store: Store<StoreSchema>, win: BrowserWindow) {
    const directoryToSave = this.getVaultDirectoryForWinContents(win.webContents)

    // Save the directory if found
    if (directoryToSave) {
      store.set(StoreKeys.DirectoryFromPreviousSession, directoryToSave)
      this.removeActiveWindowByDirectory(directoryToSave)
    }
  }

  removeActiveWindowByDirectory(directory: string): void {
    this.activeWindows = this.activeWindows.filter((w) => w.vaultDirectoryForWindow !== directory)
  }

  getNextWindowPosition(): { x: number | undefined; y: number | undefined } {
    const windowOffset = 30 // Offset for each new window
    const focusedWin = BrowserWindow.getFocusedWindow()

    if (focusedWin) {
      const [x, y] = focusedWin.getPosition()
      return { x: x + windowOffset, y: y + windowOffset }
    }
    return { x: undefined, y: undefined }
  }

  getWindowSize(): { width: number; height: number } {
    const primaryDisplay = screen.getPrimaryDisplay()
    const { width, height } = primaryDisplay.workAreaSize

    const windowWidth = Math.min(1200, width * 0.8) // e.g., 80% of screen width or 1200px
    const windowHeight = Math.min(800, height * 0.8) // e.g., 80% of screen height or 800px

    return { width: windowWidth, height: windowHeight }
  }
}

export default WindowsManager

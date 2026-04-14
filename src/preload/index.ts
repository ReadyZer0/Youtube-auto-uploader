import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', {
      getConfig: () => ipcRenderer.invoke('get-config'),
      setConfig: (config: any) => ipcRenderer.invoke('set-config', config),
      selectFolder: () => ipcRenderer.invoke('select-folder'),
      authenticate: () => ipcRenderer.invoke('authenticate'),
      isAuthenticated: () => ipcRenderer.invoke('is-authenticated'),
      logout: () => ipcRenderer.invoke('logout'),
      getChannelInfo: () => ipcRenderer.invoke('get-channel-info'),
      triggerScan: () => ipcRenderer.invoke('trigger-scan'),
      cancelUpload: () => ipcRenderer.invoke('cancel-upload'),
      isUploading: () => ipcRenderer.invoke('is-uploading'),
      onLog: (callback: any) => {
        ipcRenderer.on('uploader-log', (_event, log) => callback(log))
      },
      removeLogListener: () => {
        ipcRenderer.removeAllListeners('uploader-log')
      }
    })
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = {
    getConfig: () => ipcRenderer.invoke('get-config'),
    setConfig: (config: any) => ipcRenderer.invoke('set-config', config),
    selectFolder: () => ipcRenderer.invoke('select-folder'),
    authenticate: () => ipcRenderer.invoke('authenticate'),
    isAuthenticated: () => ipcRenderer.invoke('is-authenticated'),
    triggerScan: () => ipcRenderer.invoke('trigger-scan'),
    onLog: (callback: any) => {
      const subscription = (_event: any, log: any) => callback(log)
      ipcRenderer.on('uploader-log', subscription)
      return () => ipcRenderer.removeListener('uploader-log', subscription)
    }
  }
}

import { join } from 'path'
import * as fs from 'fs'
import { google } from 'googleapis'
import { getConfig, store } from './config'
import { mainWindow } from './index'
import { AuthService } from './auth'

export class UploaderService {
  private isScanning = false
  public isUploading = false
  private authService: AuthService
  private abortController: AbortController | null = null

  constructor() {
    this.authService = new AuthService()
  }

  private sendLog(message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') {
    if (mainWindow) {
      mainWindow.webContents.send('uploader-log', {
        id: Date.now().toString(),
        message,
        timestamp: new Date().toLocaleTimeString(),
        type
      })
    }
    console.log(`[Uploader] ${message}`)
  }

  async scanAndUpload() {
    if (this.isScanning) return
    this.isScanning = true
    
    const { watchFolder, keywords, history, tokens } = getConfig()
    if (!tokens) {
      this.sendLog('Authentication required. Please sign in first.', 'warning')
      this.isScanning = false
      return
    }

    if (!watchFolder || !fs.existsSync(watchFolder)) {
      this.sendLog('Watch folder not configured or missing. Please set it in Settings.', 'error')
      this.isScanning = false
      return
    }

    this.sendLog(`🔍 Scanning watch folder: ${watchFolder}...`)
    
    try {
      const files = fs.readdirSync(watchFolder)
      const videoFiles = files.filter(f => {
        const ext = f.split('.').pop()?.toLowerCase()
        return ['mp4', 'mkv', 'mov', 'avi'].includes(ext || '')
      })

      this.sendLog(`📂 Found ${videoFiles.length} video files in directory.`)

      const pendingFiles = videoFiles.filter(f => {
        const fullPath = join(watchFolder, f)
        const stats = fs.statSync(fullPath)
        const fileId = `${f}_${stats.size}`
        
        const matchesKeyword = keywords.length === 0 || keywords.some(k => f.toLowerCase().includes(k.toLowerCase()))
        const isDuplicate = history.includes(fullPath) || history.includes(fileId)

        if (matchesKeyword && isDuplicate) {
          this.sendLog(`⏭️ Skipping duplicate: ${f}`, 'info')
          return false
        }
        
        if (!matchesKeyword) {
          // Silent skip for keywords to avoid log spam, but we'll show a summary
          return false
        }
        
        return true
      })

      if (pendingFiles.length === 0) {
        this.sendLog('✅ Scan complete: No new matching videos found.', 'info')
        this.isScanning = false
        return
      }

      this.sendLog(`🚀 Found ${pendingFiles.length} new videos to upload.`)

      for (const file of pendingFiles) {
        const fullPath = join(watchFolder, file)
        const stats = fs.statSync(fullPath)
        const fileId = `${file}_${stats.size}`
        
        try {
          await this.uploadToYouTube(fullPath, file)
          const updatedHistory = [...store.get('history'), fullPath, fileId]
          store.set('history', updatedHistory)
        } catch (error: any) {
          if (error.name === 'AbortError' || error.message?.includes('aborted')) {
            this.sendLog(`🛑 Upload of ${file} was cancelled by user.`, 'warning')
            break 
          }
          this.sendLog(`❌ Failed to upload ${file}: ${error.message}`, 'error')
        }
      }
    } catch (err: any) {
      this.sendLog(`❌ Error during scan: ${err.message}`, 'error')
    }

    this.isScanning = false
  }

  cancelUpload() {
    if (this.abortController) {
      this.sendLog('🛑 Cancelling current upload...', 'warning')
      this.abortController.abort()
      this.abortController = null
      this.isUploading = false
    }
  }

  private async uploadToYouTube(filePath: string, fileName: string) {
    this.sendLog(`📤 Starting official API upload for: ${fileName}`, 'info')
    this.isUploading = true
    this.abortController = new AbortController()
    
    const auth = this.authService.getAuthClient()
    const youtube = google.youtube({ version: 'v3', auth })

    const { privacyStatus } = getConfig()
    const title = fileName.replace(/\.[^/.]+$/, "")

    try {
      const response = await youtube.videos.insert({
        part: ['snippet', 'status'],
        requestBody: {
          snippet: {
            title,
            description: `Automated upload by Ready Auto YT Uploader\nFile: ${fileName}`,
            categoryId: '22'
          },
          status: {
            privacyStatus: privacyStatus || 'private',
            selfDeclaredMadeForKids: false
          }
        },
        media: {
          body: fs.createReadStream(filePath)
        }
      }, {
        signal: this.abortController.signal,
        onUploadProgress: (evt) => {
          const progress = Math.round((evt.bytesRead * 100) / (fs.statSync(filePath).size))
          this.sendLog(`进度: ${progress}% completed`, 'info')
        }
      })

      this.sendLog(`✅ Successfully uploaded: ${response.data.snippet?.title} (ID: ${response.data.id})`, 'success')
    } catch (error: any) {
      throw error
    } finally {
      this.isUploading = false
      this.abortController = null
    }
  }
}

export const uploaderService = new UploaderService()

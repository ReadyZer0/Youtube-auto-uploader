import { shell } from 'electron'
import { google } from 'googleapis'
import { store, getConfig } from './config'
import http from 'http'
import url from 'url'

import { mainWindow } from './index'

export class AuthService {
  private oauth2Client: any
  private redirectPort = 4281
  private redirectUri = `http://localhost:${this.redirectPort}`

  constructor() {
    this.initClient()
  }

  private logActivity(message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') {
    if (mainWindow) {
      mainWindow.webContents.send('uploader-log', {
        id: Date.now().toString(),
        message,
        timestamp: new Date().toLocaleTimeString(),
        type
      })
    }
    console.log(`[Auth] ${message}`)
  }

  private initClient() {
    const { clientId, clientSecret, tokens } = getConfig()
    if (clientId && clientSecret) {
      this.oauth2Client = new google.auth.OAuth2(clientId, clientSecret, this.redirectUri)
      if (tokens) {
        this.oauth2Client.setCredentials(tokens)
      }
    }
  }

  async authenticate(): Promise<void> {
    const { clientId, clientSecret } = getConfig()
    if (!clientId || !clientSecret) {
      throw new Error('Master Keys are missing. Please restart the application.')
    }

    this.initClient()

    const authUrl = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/youtube.upload',
        'https://www.googleapis.com/auth/youtube.readonly',
        'openid',
        'profile'
      ],
      prompt: 'consent'
    })

    console.log('[Auth] Opening default browser for authentication...')
    await shell.openExternal(authUrl)

    return new Promise((resolve, reject) => {
      const server = http.createServer(async (req, res) => {
        try {
          const queryObject = url.parse(req.url || '', true).query
          const code = queryObject.code as string

          if (code) {
            const { tokens } = await this.oauth2Client.getToken(code)
            this.oauth2Client.setCredentials(tokens)
            store.set('tokens', tokens)

            // ✅ Sync Identity instantly
            await this.syncIdentity(tokens)
            
            res.end('<h1>Authentication Successful!</h1><p>You can close this window now.</p>')
            
            setTimeout(() => {
              if (server.listening) server.close()
            }, 1000)
            resolve()
          } else {
            res.end('<h1>Authentication Failed</h1><p>No code found in redirect.</p>')
            server.close()
            reject(new Error('Auth failed'))
          }
        } catch (e) {
          res.end('<h1>Error</h1><p>Something went wrong during authentication.</p>')
          server.close()
          reject(e)
        }
      })

      server.on('error', (err: any) => {
        if (err.code === 'EADDRINUSE') {
          console.warn(`[Auth] Port ${this.redirectPort} already in use.`)
        } else {
          reject(err)
        }
      })

      server.listen(this.redirectPort, () => {
        console.log(`[Auth] Callback server listening on port ${this.redirectPort}`)
      })
    })
  }

  private async syncIdentity(tokens: any): Promise<void> {
    try {
      this.initClient()
      const youtube = google.youtube({ version: 'v3', auth: this.oauth2Client })
      const response = await youtube.channels.list({
        part: ['snippet'],
        mine: true
      })
      
      const channel = response.data.items?.[0]
      if (channel) {
        const profile = {
          title: channel.snippet?.title || 'YouTube Creator',
          thumbnail: channel.snippet?.thumbnails?.high?.url || channel.snippet?.thumbnails?.medium?.url || channel.snippet?.thumbnails?.default?.url,
          source: 'youtube'
        }
        store.set('profile', profile)
        console.log('[Auth] YouTube Channel correctly linked:', profile.title)
        this.logActivity(`🔗 YouTube Channel Linked: ${profile.title}`)
        return
      }

      // Fallback to ID Token decoding if no YouTube channel entity is found
      if (tokens.id_token) {
        const base64Url = tokens.id_token.split('.')[1]
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
        const payload = JSON.parse(Buffer.from(base64, 'base64').toString('utf8'))
        
        const profile = {
          title: payload.name || payload.email || 'YouTube Creator',
          thumbnail: payload.picture,
          source: 'google_oidc'
        }
        store.set('profile', profile)
        this.logActivity(`🔗 Account Linked (No Channel): ${profile.title}`, 'warning')
      }
    } catch (e: any) {
      console.error('[Auth] Failed to sync identity:', e.message)
    }
  }

  async logout(): Promise<void> {
    console.log('[Auth] Performing Absolute Revocation...')
    
    // Step 1: Try to revoke remotely (best effort)
    try {
      const { tokens } = store.store as any
      if (tokens && tokens.refresh_token && this.oauth2Client) {
        await this.oauth2Client.revokeToken(tokens.refresh_token)
        console.log('[Auth] Token revoked successfully on Google side.')
      }
    } catch (e: any) {
      console.warn('[Auth] Remote revocation skipped:', e.message)
    }

    // Step 2: Always wipe local state (guaranteed)
    store.delete('tokens')
    store.delete('profile')
    this.oauth2Client = null
    this.initClient()
    console.log('[Auth] Local session completely cleared.')
  }


  async checkLoggedIn(): Promise<boolean> {
    const { tokens } = store.store as any
    return !!tokens
  }

  getAuthClient() {
    this.initClient()
    return this.oauth2Client
  }

  async getChannelInfo(force = false): Promise<any> {
    const { profile, tokens } = store.store as any
    if (profile && !force) return profile
    if (!tokens) return null

    // Fetch fresh identity from Google
    await this.syncIdentity(tokens)
    return store.get('profile')
  }
}

import Store from 'electron-store'

export interface AppConfig {
  clientId: string
  clientSecret: string
  tokens: any // OAuth2 tokens
  profile: any // Cached YouTube channel profile
  watchFolder: string
  keywords: string[]
  privacyStatus: 'private' | 'unlisted' | 'public'
  schedule: {
    type: 'interval' | 'daily' | 'weekly' | 'monthly' | 'cron'
    value: string
    enabled: boolean
  }
  history: string[] // list of uploaded absolute file paths
}

// OAuth2 credentials fetched from environment variables at build-time.
// These are sourced from the .env file (not committed to Git).
const MASTER_CLIENT_ID = (import.meta.env as any).MAIN_VITE_GOOGLE_CLIENT_ID || ''
const MASTER_CLIENT_SECRET = (import.meta.env as any).MAIN_VITE_GOOGLE_CLIENT_SECRET || ''

const schema: any = {
  clientId: { type: 'string', default: MASTER_CLIENT_ID },
  clientSecret: { type: 'string', default: MASTER_CLIENT_SECRET },
  tokens: { type: ['object', 'null'], default: null },
  profile: { type: ['object', 'null'], default: null },
  watchFolder: { type: 'string', default: '' },
  keywords: { type: 'array', items: { type: 'string' }, default: ['highlight'] },
  privacyStatus: { type: 'string', enum: ['private', 'unlisted', 'public'], default: 'private' },
  schedule: {
    type: 'object',
    properties: {
      type: { type: 'string', enum: ['interval', 'daily', 'weekly', 'monthly', 'cron'], default: 'interval' },
      value: { type: 'string', default: '60' },
      enabled: { type: 'boolean', default: true }
    },
    default: { type: 'interval', value: '60', enabled: true }
  },
  history: { type: 'array', items: { type: 'string' }, default: [] }
}

export const store = new Store<AppConfig>({ schema })

export function getConfig(): AppConfig {
  const current = store.store
  if (!current.clientId) current.clientId = MASTER_CLIENT_ID
  if (!current.clientSecret) current.clientSecret = MASTER_CLIENT_SECRET
  return current
}

export function setConfig(newConfig: Partial<AppConfig>) {
  store.set(newConfig as any)
}

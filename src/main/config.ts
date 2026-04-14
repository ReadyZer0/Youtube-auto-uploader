import Store from 'electron-store'

export interface AppConfig {
  clientId: string
  clientSecret: string
  tokens: any // OAuth2 tokens
  watchFolder: string
  keywords: string[]
  privacyStatus: 'private' | 'unlisted' | 'public'
  schedule: {
    type: 'interval' | 'daily' | 'weekly' | 'monthly' | 'cron'
    value: string
  }
  history: string[] // list of uploaded absolute file paths
}

// Credentials are loaded from .env file (never committed to git)
// See .env.example for the template
const MASTER_CLIENT_ID = import.meta.env.MAIN_VITE_GOOGLE_CLIENT_ID || ''
const MASTER_CLIENT_SECRET = import.meta.env.MAIN_VITE_GOOGLE_CLIENT_SECRET || ''

const schema: any = {
  clientId: { type: 'string', default: MASTER_CLIENT_ID },
  clientSecret: { type: 'string', default: MASTER_CLIENT_SECRET },
  tokens: { type: 'object', default: null },
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

// Ensure that even if the store is empty, we return the master keys
export function getConfig(): AppConfig {
  const current = store.store
  if (!current.clientId) current.clientId = MASTER_CLIENT_ID
  if (!current.clientSecret) current.clientSecret = MASTER_CLIENT_SECRET
  return current
}

export function setConfig(newConfig: Partial<AppConfig>) {
  store.set(newConfig as any)
}

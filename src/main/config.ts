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

const schema: any = {
  clientId: { type: 'string', default: '' },
  clientSecret: { type: 'string', default: '' },
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

// Credentials are loaded from .env file (never committed to git).
// See .env.example for the template.
// Priority: store (user-saved) > .env file > empty (user must configure)
export function getConfig(): AppConfig {
  const current = store.store

  // If the store doesn't have credentials yet, try loading from .env
  if (!current.clientId) {
    const envId = import.meta.env.MAIN_VITE_GOOGLE_CLIENT_ID || ''
    if (envId) {
      store.set('clientId', envId)
      current.clientId = envId
    }
  }
  if (!current.clientSecret) {
    const envSecret = import.meta.env.MAIN_VITE_GOOGLE_CLIENT_SECRET || ''
    if (envSecret) {
      store.set('clientSecret', envSecret)
      current.clientSecret = envSecret
    }
  }

  return current
}

export function setConfig(newConfig: Partial<AppConfig>) {
  store.set(newConfig as any)
}

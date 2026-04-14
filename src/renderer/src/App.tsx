import { useState, useEffect } from 'react'
import Dashboard from './components/Dashboard'
import SettingsPage from './components/Settings'
import AuthPage from './components/Auth'
import DonateModal from './components/DonateModal'
import LogoImage from './assets/icon.png'
import { LayoutDashboard, Settings, Key, Linkedin, Heart } from 'lucide-react'

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [config, setConfig] = useState<any>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isDonateOpen, setIsDonateOpen] = useState(false)

  const loadConfig = async () => {
    try {
      if ((window as any).api) {
        const cfg = await (window as any).api.getConfig()
        setConfig(cfg)
        const authed = await (window as any).api.isAuthenticated()
        setIsAuthenticated(authed)
      } else {
        console.error('API NOT FOUND IN WINDOW')
      }
    } catch (e) {
      console.error('FAILED TO LOAD CONFIG', e)
    }
  }

  useEffect(() => {
    loadConfig()
  }, [])

  const handleConfigChange = async (newConfig: any) => {
    await (window as any).api.setConfig(newConfig)
    setConfig({ ...config, ...newConfig })
  }

  return (
    <div className="app-container">
      <div className="sidebar">
        <div className="sidebar-title">
          <img src={LogoImage} alt="Logo" style={{ width: 36, height: 36, borderRadius: 10, boxShadow: '0 4px 12px rgba(255,0,0,0.3)' }} />
          <span>Ready Auto YT</span>
        </div>
        
        <div 
          className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <LayoutDashboard size={20} />
          Dashboard
        </div>
        
        <div 
          className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <Settings size={20} />
          Settings
        </div>
        
        <div 
          className={`nav-item ${activeTab === 'auth' ? 'active' : ''}`}
          onClick={() => setActiveTab('auth')}
        >
          <Key size={20} />
          YouTube Auth
        </div>

        <div style={{ marginTop: 'auto', padding: '0 16px' }}>
          <div 
            className="nav-item"
            style={{ color: '#0077B5', opacity: 0.9 }}
            onClick={() => window.open('https://iq.linkedin.com/in/ali-dheyaa-abdulwahab-6bbbb1239', '_blank')}
          >
            <Linkedin size={20} />
            Connect LinkedIn
          </div>

          <div 
            className="nav-item"
            style={{ color: 'var(--primary)', fontWeight: 700 }}
            onClick={() => setIsDonateOpen(true)}
          >
            <Heart size={20} fill="var(--primary)" />
            Support Dev
          </div>
        </div>

        <div style={{ padding: '20px 24px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px', 
            fontSize: '12px', 
            fontWeight: 600,
            padding: '12px',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '12px',
            color: isAuthenticated ? 'var(--success)' : 'var(--error)' 
          }}>
            <div style={{ 
              width: 8, 
              height: 8, 
              borderRadius: '50%', 
              background: isAuthenticated ? 'var(--success)' : 'var(--error)',
              boxShadow: `0 0 10px ${isAuthenticated ? 'var(--success)' : 'var(--error)'}`
            }} />
            {isAuthenticated ? 'Account Connected' : 'Signed Out'}
          </div>
        </div>
      </div>

      <main className="main-viewport">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -10, filter: 'blur(10px)' }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            style={{ height: '100%' }}
          >
            {activeTab === 'dashboard' && <Dashboard />}
            {activeTab === 'settings' && (
              <SettingsPage 
                config={config} 
                onChange={handleConfigChange} 
              />
            )}
            {activeTab === 'auth' && (
              <AuthPage 
                authenticated={isAuthenticated}
                onAuthSuccess={loadConfig} 
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <DonateModal 
        isOpen={isDonateOpen} 
        onClose={() => setIsDonateOpen(false)} 
      />
    </div>
  )
}

export default App

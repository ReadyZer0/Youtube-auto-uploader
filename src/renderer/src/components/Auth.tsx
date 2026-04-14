import { useState, useEffect } from 'react'
import { Video, AlertTriangle, ShieldCheck, ArrowRight, CheckCircle2, LogOut, User } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const Auth = ({ authenticated, onAuthSuccess }: { authenticated: boolean, onAuthSuccess: () => void }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [channelName, setChannelName] = useState<string | null>(null)
  const [thumbnail, setThumbnail] = useState<string | null>(null)

  useEffect(() => {
    let timeout: any;
    if (authenticated) {
      // 0.5-second buffer is enough with local decoding
      timeout = setTimeout(() => {
        loadChannelInfo()
      }, 500)
    }
    return () => clearTimeout(timeout)
  }, [authenticated])

  const loadChannelInfo = async () => {
    if (!(window as any).api) return
    try {
      setError(null)
      const info = await (window as any).api.getChannelInfo()
      if (info) {
        setChannelName(info.title)
        setThumbnail(info.thumbnail)
      } else {
        setError('Google returned no profile info. Please Sign Out and try again.')
      }
    } catch (e: any) {
      setError(`Identity Sync Error: ${e.message || 'Unknown error'}`)
    }
  }

  const handleAuthenticate = async () => {
    setLoading(true)
    setError(null)
    try {
      if ((window as any).api) {
        await (window as any).api.authenticate()
        onAuthSuccess()
      }
    } catch (e: any) {
      setError(e.message || 'Sign-in failed.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    if (!window.confirm('Are you sure you want to sign out? This will disconnect your channel.')) return;
    
    console.log('[AuthUI] Sign Out clicked. Clearing local state...');
    setChannelName(null)
    setThumbnail(null)
    setError(null)
    
    if ((window as any).api) {
      try {
        await (window as any).api.logout()
      } catch (e: any) {
        console.error('[AuthUI] Logout error:', e.message);
      }
      onAuthSuccess() 
    }
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        YouTube Integration
      </motion.h1>
      <p style={{ color: 'var(--text-dim)', marginBottom: '32px' }}>
        {authenticated 
          ? 'Your account is securely connected and ready for automated uploads.' 
          : 'Connect your channel using the official Google security protocol.'}
      </p>
      
      <div className="glass-card" style={{ padding: '64px 40px', textAlign: 'center' }}>
        <AnimatePresence mode="wait">
          {authenticated ? (
            <motion.div key="connected-state" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <div style={{ 
                width: '100px', height: '100px', margin: '0 auto 24px', borderRadius: '50%',
                overflow: 'hidden', border: '4px solid var(--success)',
                boxShadow: '0 8px 32px rgba(0,200,83,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#222'
              }}>
                {thumbnail ? (
                  <img src={thumbnail} alt="Channel" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <User size={48} color="var(--success)" />
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
                <h2 style={{ fontSize: '28px', fontWeight: 700, margin: 0, color: '#fff' }}>
                  {channelName || 'Syncing Account...'}
                </h2>
                {channelName && (
                  <div style={{ 
                    background: 'rgba(255,0,0,0.1)', color: '#FF0000', 
                    fontSize: '10px', fontWeight: 800, padding: '2px 6px', 
                    borderRadius: '4px', border: '1px solid rgba(255,0,0,0.2)',
                    textTransform: 'uppercase', letterSpacing: '0.5px'
                  }}>
                    YouTube
                  </div>
                )}
              </div>
              
              {!channelName && (
                <button 
                  onClick={loadChannelInfo}
                  style={{ 
                    background: 'none', border: 'none', color: 'var(--primary)', 
                    cursor: 'pointer', fontSize: '12px', textDecoration: 'underline',
                    marginBottom: '16px', display: 'block', margin: '0 auto 16px'
                  }}
                >
                  Taking too long? Try Force Sync
                </button>
              )}
              
              {error && (
                <div style={{ 
                  color: 'var(--error)', 
                  marginBottom: '20px', 
                  fontSize: '13px', 
                  background: 'rgba(255, 69, 58, 0.1)', 
                  padding: '10px', 
                  borderRadius: '8px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <AlertTriangle size={14} />
                  {error}
                </div>
              )}

              <div style={{ color: 'var(--success)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '40px' }}>
                <CheckCircle2 size={16} />
                Verified & Connected
              </div>

              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                <div style={{ padding: '12px 24px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <ShieldCheck size={18} color="var(--success)" />
                  <span style={{ fontSize: '14px', fontWeight: 500 }}>Session Active</span>
                </div>
                
                <button 
                  className="btn btn-secondary" 
                  style={{ borderColor: 'var(--border)', color: 'var(--text-dim)', background: 'transparent' }}
                  onClick={handleLogout}
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            </motion.div>
          ) : !loading ? (
            <motion.div key="ready-state" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div style={{ 
                background: 'linear-gradient(135deg, #FF0000 0%, #CC0000 100%)', 
                width: '64px', height: '64px', margin: '0 auto 24px', borderRadius: '18px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 32px rgba(255,0,0,0.3)'
              }}>
                <Video color="white" size={32} />
              </div>

              <h2 style={{ fontSize: '26px', fontWeight: 700, marginBottom: '16px' }}>
                Browser Sign In
              </h2>
              
              <p style={{ color: 'var(--text-dim)', marginBottom: '32px', fontSize: '14px' }}>
                Universal OAuth2 flow. No API keys required.
              </p>

              <button 
                className="btn btn-primary" 
                style={{ padding: '18px 56px', fontSize: '18px', fontWeight: 600 }}
                onClick={handleAuthenticate}
              >
                Sign in with YouTube
                <ArrowRight size={20} style={{ marginLeft: '12px' }} />
              </button>

              {error && (
                <div style={{ color: 'var(--error)', marginTop: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <AlertTriangle size={16} />
                  {error}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div key="loading-state" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="pulse" style={{ width: '64px', height: '64px', background: 'var(--primary)', borderRadius: '50%', margin: '0 auto 32px' }} />
              <h2 style={{ fontSize: '22px', marginBottom: '12px' }}>Awaiting Approval</h2>
              <p style={{ color: 'var(--text-dim)' }}>
                Please complete the sign-in process in your browser. <br/>
                We will automatically connect once you're done!
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '12px', color: 'var(--text-dim)' }}>
        <p>
          Official Google OAuth2 secured via baked-in Master Keys.<br/>
          Your channel session is stored securely on your local device.
        </p>
      </div>
    </div>
  )
}

export default Auth

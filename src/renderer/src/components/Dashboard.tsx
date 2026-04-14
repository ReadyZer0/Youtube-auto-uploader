import { useState, useEffect, useRef } from 'react'
import { Play, Terminal, Info, Activity, Clock, XCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Log {
  message: string
  type: 'info' | 'success' | 'error' | 'warning' | 'progress'
  timestamp: string
}

const Dashboard = () => {
  const [logs, setLogs] = useState<Log[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const logEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if ((window as any).api) {
      ;(window as any).api.onLog((log: Log) => {
        setLogs(prev => [...prev, log].slice(-100))
        
        // Auto-detect upload start/stop from logs for faster UI response
        if (log.message.includes('Starting official API upload')) setIsUploading(true)
        if (log.message.includes('Successfully uploaded') || log.message.includes('Failed to upload')) {
           // We'll trust the polling for final state to be accurate
        }
      })
    }

    // Polling for absolute state accuracy
    const interval = setInterval(async () => {
      if ((window as any).api) {
        const uploading = await (window as any).api.isUploading()
        setIsUploading(uploading)
      }
    }, 1000)

    return () => {
      if ((window as any).api) {
        ;(window as any).api.removeLogListener()
      }
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  const triggerManualScan = () => {
    if ((window as any).api) {
      const initialLog: Log = {
        message: '🚀 Initiating manual scan...',
        type: 'info',
        timestamp: new Date().toISOString()
      }
      setLogs(prev => [...prev, initialLog].slice(-100))
      ;(window as any).api.triggerScan()
    }
  }

  const cancelCurrentUpload = () => {
    if ((window as any).api) {
      ;(window as any).api.cancelUpload()
    }
  }

  return (
    <div>
      <motion.h1
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        Dashboard
      </motion.h1>
      
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '24px' }}>
          <div>
            <h2 style={{ fontSize: '14px', color: 'var(--text-dim)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              System Status
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className={`status-badge ${isUploading ? 'status-running' : ''}`} 
                   style={{ background: isUploading ? 'rgba(255, 102, 0, 0.1)' : 'rgba(0, 200, 83, 0.1)', color: isUploading ? '#ff6600' : 'var(--success)' }}>
                {isUploading ? 'Uploading...' : 'Idle'}
              </div>
              <span style={{ color: '#fff', fontSize: '15px', fontWeight: 500 }}>
                {isUploading ? 'Active Upload' : 'Scanner Operational'}
              </span>
            </div>
          </div>

          <div style={{ width: '1px', background: 'var(--border)', alignSelf: 'stretch' }} />

          <div>
            <h2 style={{ fontSize: '14px', color: 'var(--text-dim)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Uptime
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', fontSize: '15px', fontWeight: 500 }}>
              <Clock size={16} color="var(--accent)" />
              {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <AnimatePresence>
            {isUploading && (
              <motion.button 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="btn btn-secondary" 
                style={{ borderColor: 'var(--error)', color: 'var(--error)', background: 'rgba(255, 69, 58, 0.05)' }}
                onClick={cancelCurrentUpload}
              >
                <XCircle size={16} />
                Cancel Upload
              </motion.button>
            )}
          </AnimatePresence>

          <button 
            className="btn btn-primary" 
            onClick={triggerManualScan}
            disabled={isUploading}
            style={{ opacity: isUploading ? 0.5 : 1 }}
          >
            <Play size={16} fill="white" />
            Scan & Upload Now
          </button>
        </div>
      </div>

      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px', borderRadius: '8px' }}>
              <Terminal size={18} color="var(--accent)" />
            </div>
            <h2 style={{ margin: 0 }}>Activity Log</h2>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-dim)' }}>
            <Activity size={14} className={isUploading ? "pulse" : ""} />
            {isUploading ? 'Transferring data...' : 'Live monitoring'}
          </div>
        </div>
        
        <div className="log-container">
          {logs.length === 0 && (
            <div style={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: '#333',
              gap: '12px'
            }}>
              <Info size={40} />
              <div style={{ fontSize: '15px', fontWeight: 500 }}>No activity recorded yet.</div>
              <div style={{ fontSize: '13px' }}>Trigger a scan to see real-time updates.</div>
            </div>
          )}
          {logs.map((log, i) => (
            <div key={i} className="log-entry">
              <span className="log-timestamp">[{log.timestamp}]</span>
              <span className={`log-${log.type}`}>{log.message}</span>
            </div>
          ))}
          <div ref={logEndRef} />
        </div>
      </div>
    </div>
  )
}

export default Dashboard

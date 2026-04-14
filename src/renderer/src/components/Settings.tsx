import { useState, useEffect } from 'react'
import { Save, Folder, Hash, Globe, Bell, Shield, Clock, Calendar, ExternalLink, ShieldCheck, CheckCircle2, Zap } from 'lucide-react'
import { motion } from 'framer-motion'

const Settings = ({ config, onChange }: { config: any, onChange: (cfg: any) => void }) => {
  const [formData, setFormData] = useState<any>(config || {})

  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    if (config) setFormData(config)
  }, [config])

  const handleChange = (key: string, value: any) => {
    setFormData({ ...formData, [key]: value })
  }

  const handleScheduleChange = (field: 'type' | 'value' | 'enabled', value: any) => {
    setFormData({
      ...formData,
      schedule: {
        ...formData.schedule,
        [field]: value
      }
    })
  }

  const handleSelectFolder = async () => {
    if ((window as any).api) {
      const folder = await (window as any).api.selectFolder()
      if (folder) {
        handleChange('watchFolder', folder)
      }
    }
  }

  const handleSave = () => {
    onChange(formData)
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2000)
  }

  return (
    <div>
      <motion.h1 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        Settings
      </motion.h1>

      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
          <div style={{ background: 'rgba(62, 166, 255, 0.1)', padding: '10px', borderRadius: '12px' }}>
            <Folder size={24} color="var(--accent)" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px' }}>Automation Core</h2>
            <p style={{ color: 'var(--text-dim)', fontSize: '13px' }}>Configure where to look for videos and how to handle them.</p>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Watch Folder Path</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input 
              className="form-input" 
              style={{ flex: 1 }}
              type="text" 
              value={formData.watchFolder || ''}
              onChange={(e) => handleChange('watchFolder', e.target.value)}
              placeholder="Select folder..."
              readOnly
            />
            <button 
              className="btn btn-secondary" 
              style={{ whiteSpace: 'nowrap' }}
              onClick={handleSelectFolder}
            >
              <ExternalLink size={16} />
              Browse...
            </button>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Trigger Keywords (comma separated)</label>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }}>
              <Hash size={16} />
            </div>
            <input 
              className="form-input" 
              style={{ paddingLeft: '44px' }}
              type="text" 
              value={formData.keywords?.join(', ') || ''}
              onChange={(e) => handleChange('keywords', e.target.value.split(',').map((s: string) => s.trim()))}
              placeholder="highlight, export, final"
            />
          </div>
        </div>
      </div>

      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
          <div style={{ background: 'rgba(255, 0, 0, 0.1)', padding: '10px', borderRadius: '12px' }}>
            <Bell size={24} color="var(--primary)" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px' }}>Smart Scheduler</h2>
            <p style={{ color: 'var(--text-dim)', fontSize: '13px' }}>Set when the application should scan and upload content.</p>
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: '24px', padding: '16px', borderRadius: '12px', background: 'rgba(255,165,0,0.05)', border: '1px solid rgba(255,165,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Zap size={20} color={formData.schedule?.enabled ? "orange" : "var(--text-dim)"} className={formData.schedule?.enabled ? "pulse" : ""} />
              <div>
                <div style={{ fontWeight: 600 }}>Enable Automatic Scanning</div>
                <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>Run the scanner automatically on the schedule below.</div>
              </div>
            </div>
            <div 
              style={{ 
                width: '48px', 
                height: '24px', 
                background: formData.schedule?.enabled ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                borderRadius: '12px',
                cursor: 'pointer',
                position: 'relative',
                transition: 'all 0.3s ease'
              }}
              onClick={() => handleScheduleChange('enabled', !formData.schedule?.enabled)}
            >
              <div style={{ 
                position: 'absolute', 
                left: formData.schedule?.enabled ? '26px' : '2px', 
                top: '2px', 
                width: '20px', 
                height: '20px', 
                background: '#fff', 
                borderRadius: '50%',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }} />
            </div>
          </div>
        </div>

        <div className="form-group" style={{ opacity: formData.schedule?.enabled ? 1 : 0.5, pointerEvents: formData.schedule?.enabled ? 'all' : 'none', transition: 'opacity 0.3s ease' }}>
          <label className="form-label">Schedule Frequency</label>
          <div style={{ display: 'flex', gap: '12px' }}>
            <select 
              className="form-input" 
              style={{ flex: 1 }}
              value={formData.schedule?.type || 'interval'}
              onChange={(e) => handleScheduleChange('type', e.target.value)}
            >
              <option value="interval">Every X Hours/Minutes</option>
              <option value="daily">Daily at specific time</option>
              <option value="weekly">Weekly on specific day</option>
              <option value="monthly">Monthly on specific date</option>
              <option value="cron">Advanced (Cron Expression)</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Configuration</label>
          
          {formData.schedule?.type === 'interval' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <select 
                className="form-input"
                value={formData.schedule?.value}
                onChange={(e) => handleScheduleChange('value', e.target.value)}
              >
                <option value="30">Every 30 Minutes</option>
                <option value="60">Every 1 Hour</option>
                <option value="120">Every 2 Hours</option>
                <option value="240">Every 4 Hours</option>
                <option value="480">Every 8 Hours</option>
                <option value="720">Every 12 Hours</option>
                <option value="1440">Every 24 Hours</option>
              </select>
            </div>
          )}

          {formData.schedule?.type === 'daily' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Clock size={18} color="var(--text-dim)" />
              <input 
                className="form-input"
                type="time"
                value={formData.schedule?.value || '21:00'}
                onChange={(e) => handleScheduleChange('value', e.target.value)}
              />
            </div>
          )}

          {formData.schedule?.type === 'weekly' && (
            <div style={{ display: 'flex', gap: '12px' }}>
              <select 
                className="form-input"
                value={formData.schedule?.value?.split('|')[0] || '1'}
                onChange={(e) => handleScheduleChange('value', `${e.target.value}|${formData.schedule?.value?.split('|')[1] || '00:00'}`)}
              >
                <option value="1">Monday</option>
                <option value="2">Tuesday</option>
                <option value="3">Wednesday</option>
                <option value="4">Thursday</option>
                <option value="5">Friday</option>
                <option value="6">Saturday</option>
                <option value="0">Sunday</option>
              </select>
              <input 
                className="form-input"
                type="time"
                value={formData.schedule?.value?.split('|')[1] || '00:00'}
                onChange={(e) => handleScheduleChange('value', `${formData.schedule?.value?.split('|')[0] || '1'}|${e.target.value}`)}
              />
            </div>
          )}

          {formData.schedule?.type === 'monthly' && (
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                <Calendar size={16} color="var(--text-dim)" />
                <input 
                  className="form-input"
                  type="number"
                  min="1"
                  max="31"
                  value={formData.schedule?.value?.split('|')[0] || '1'}
                  onChange={(e) => handleScheduleChange('value', `${e.target.value}|${formData.schedule?.value?.split('|')[1] || '00:00'}`)}
                  placeholder="Day (1-31)"
                />
              </div>
              <input 
                className="form-input"
                type="time"
                style={{ flex: 1 }}
                value={formData.schedule?.value?.split('|')[1] || '00:00'}
                onChange={(e) => handleScheduleChange('value', `${formData.schedule?.value?.split('|')[0] || '1'}|${e.target.value}`)}
              />
            </div>
          )}

          {formData.schedule?.type === 'cron' && (
            <input 
              className="form-input"
              type="text"
              value={formData.schedule?.value || ''}
              onChange={(e) => handleScheduleChange('value', e.target.value)}
              placeholder="e.g. 0 21 * * *"
            />
          )}
        </div>
      </div>

      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
          <div style={{ background: 'rgba(43, 166, 64, 0.1)', padding: '10px', borderRadius: '12px' }}>
            <Shield size={24} color="var(--success)" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px' }}>Global Defaults</h2>
            <p style={{ color: 'var(--text-dim)', fontSize: '13px' }}>Privacy settings for new uploads.</p>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">YouTube Privacy Status</label>
          <div style={{ position: 'relative' }}>
             <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }}>
              <Globe size={16} />
            </div>
            <select 
              className="form-input" 
              style={{ paddingLeft: '44px', appearance: 'none', background: 'rgba(0,0,0,0.3)' }}
              value={formData.privacyStatus || 'private'}
              onChange={(e) => handleChange('privacyStatus', e.target.value)}
            >
              <option value="private">🔒 Private</option>
              <option value="unlisted">🔗 Unlisted</option>
              <option value="public">🌐 Public</option>
            </select>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '32px' }}>
        <button 
          className="btn btn-primary" 
          onClick={handleSave}
          style={{ 
            background: isSaved ? 'var(--success)' : 'var(--primary)',
            transition: 'all 0.3s ease'
          }}
        >
          {isSaved ? <ShieldCheck size={18} /> : <Save size={18} />}
          {isSaved ? 'Settings Saved!' : 'Save Application Config'}
        </button>
      </div>
    </div>
  )
}

export default Settings

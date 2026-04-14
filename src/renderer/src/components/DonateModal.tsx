import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Copy, ExternalLink, X, CreditCard, Wallet, QrCode, Globe } from 'lucide-react'
import SuperQiQR from '../assets/super_qi_qr.jpg'
import UsdtQR from '../assets/usdt_qr.jpg'

const DonateModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [activeTab, setActiveTab] = useState<'payoneer' | 'wire' | 'qi' | 'crypto'>('payoneer')

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    alert(`${label} copied to clipboard!`)
  }

  const handlePayoneerProceed = () => {
    window.open('https://login.payoneer.com/', '_blank')
    copyToClipboard('alixghostt@gmail.com', 'Payoneer Email')
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div 
        style={{ 
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', 
          zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(8px)', padding: '20px'
        }}
        onClick={onClose}
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="glass-card"
          style={{ 
            maxWidth: '440px', width: '100%', padding: '0', 
            overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          {/* Header */}
          <div style={{ padding: '32px 32px 24px', textAlign: 'center', position: 'relative' }}>
            <button 
              onClick={onClose}
              style={{ 
                position: 'absolute', top: '20px', right: '20px', background: 'none', 
                border: 'none', color: 'var(--text-dim)', cursor: 'pointer' 
              }}
            >
              <X size={20} />
            </button>

            <div style={{ 
              width: '64px', height: '64px', background: 'linear-gradient(135deg, #ff4e4e 0%, #ff0000 100%)',
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px', boxShadow: '0 8px 24px rgba(255,0,0,0.3)'
            }}>
              <Heart size={32} color="white" fill="white" />
            </div>
            
            <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Support Development</h3>
            <p style={{ color: 'var(--text-dim)', fontSize: '14px' }}>Choose your preferred way to support me!</p>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', padding: '0 20px' }}>
            {[
              { id: 'payoneer', label: 'Payoneer', icon: Globe },
              { id: 'wire', label: 'Wire (NBI)', icon: CreditCard },
              { id: 'qi', label: 'Super Qi', icon: QrCode },
              { id: 'crypto', label: 'USDT', icon: Wallet },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{ 
                  flex: 1, padding: '12px 0', background: 'none', border: 'none',
                  color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-dim)',
                  fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                  borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : '2px solid transparent',
                  transition: 'all 0.3s', display: 'flex', flexDirection: 'column', 
                  alignItems: 'center', gap: '4px'
                }}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div style={{ padding: '32px', minHeight: '300px' }}>
            {activeTab === 'payoneer' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <p style={{ color: 'var(--text-dim)', fontSize: '13px', marginBottom: '16px', textAlign: 'center' }}>
                  Login to Payoneer and send to my email.
                </p>
                <div 
                  onClick={() => copyToClipboard('alixghostt@gmail.com', 'Email')}
                  style={{ 
                    background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '12px',
                    border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', cursor: 'pointer', marginBottom: '24px'
                  }}
                >
                  <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>Email:</span>
                  <span style={{ fontWeight: 600, color: '#fff' }}>alixghostt@gmail.com</span>
                  <Copy size={14} color="var(--text-dim)" />
                </div>
                <button 
                  className="btn btn-primary" 
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={handlePayoneerProceed}
                >
                  Proceed to Payoneer <ExternalLink size={16} />
                </button>
              </motion.div>
            )}

            {activeTab === 'wire' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Bank Name</span>
                    <span style={{ fontWeight: 700, color: '#fff' }}>NBI</span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '8px' }}>IBAN</p>
                  <div 
                    onClick={() => copyToClipboard('IQ89NBIQ859002100061176', 'IBAN')}
                    style={{ 
                      background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer'
                    }}
                  >
                    <span style={{ fontFamily: 'monospace', color: 'var(--accent)', fontSize: '13px', wordBreak: 'break-all' }}>
                      IQ89NBIQ859002100061176
                    </span>
                    <Copy size={14} color="var(--text-dim)" />
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'qi' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center' }}>
                <div style={{ 
                  background: 'white', padding: '12px', borderRadius: '16px', 
                  display: 'inline-block', marginBottom: '16px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <img src={SuperQiQR} alt="Super Qi QR Code" style={{ width: '180px', height: '180px', display: 'block', borderRadius: '8px' }} />
                </div>
                <p style={{ color: 'var(--text-dim)', fontSize: '14px' }}>Scan with Super Qi App</p>
              </motion.div>
            )}

            {activeTab === 'crypto' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center' }}>
                <p style={{ color: 'var(--text-dim)', fontSize: '12px', marginBottom: '12px' }}>USDT (TRC20) Address</p>
                <div style={{ 
                  background: 'white', padding: '12px', borderRadius: '16px', 
                  display: 'inline-block', marginBottom: '16px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <img src={UsdtQR} alt="USDT QR Code" style={{ width: '180px', height: '180px', display: 'block', borderRadius: '8px' }} />
                </div>
                <div 
                  onClick={() => copyToClipboard('TUUeqeUP5ZAr7V8KVciHfBfvUVj8TsTtTL', 'USDT Address')}
                  style={{ 
                    background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                    cursor: 'pointer', marginBottom: '16px', textAlign: 'left'
                  }}
                >
                  <span style={{ fontFamily: 'monospace', color: 'var(--success)', fontSize: '11px', wordBreak: 'break-all' }}>
                    TUUeqeUP5ZAr7V8KVciHfBfvUVj8TsTtTL
                  </span>
                  <Copy size={14} color="var(--text-dim)" />
                </div>
                <button 
                  style={{ 
                    width: '100%', background: '#3375BB', color: 'white', border: 'none',
                    padding: '14px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                  }}
                  onClick={() => window.open('https://link.trustwallet.com/send?coin=195&address=TUUeqeUP5ZAr7V8KVciHfBfvUVj8TsTtTL&token_id=TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t', '_blank')}
                >
                  <Wallet size={18} /> Pay with Trust Wallet
                </button>
              </motion.div>
            )}
          </div>

          <div style={{ padding: '0 32px 32px', textAlign: 'center' }}>
            <button 
              onClick={onClose}
              style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: '13px', textDecoration: 'underline', cursor: 'pointer' }}
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default DonateModal

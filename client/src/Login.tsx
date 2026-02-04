import { useState, useEffect, useRef } from 'react'
import './Login.css'

interface LoginProps {
  onSuccess: () => void;
}

function Login({ onSuccess }: LoginProps) {
  const [passcode, setPasscode] = useState(['', '', '', '', '', ''])
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [shake, setShake] = useState(false)
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, delay: number}>>([])
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const CORRECT_CODE = '686868'

  useEffect(() => {
    // Generate random particles
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5
    }))
    setParticles(newParticles)
  }, [])

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return
    
    const newPasscode = [...passcode]
    newPasscode[index] = value
    setPasscode(newPasscode)
    setStatus('idle')

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Check if complete
    const code = newPasscode.join('')
    if (code.length === 6) {
      if (code === CORRECT_CODE) {
        setStatus('success')
        setTimeout(() => {
          onSuccess()
        }, 1000)
      } else {
        setStatus('error')
        setShake(true)
        setTimeout(() => setShake(false), 500)
        setTimeout(() => {
          setPasscode(['', '', '', '', '', ''])
          inputRefs.current[0]?.focus()
        }, 1000)
      }
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !passcode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  return (
    <div className="login-container">
      {/* Animated Background */}
      <div className="bg-animation">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>

      {/* Floating Particles */}
      <div className="particles">
        {particles.map(p => (
          <div
            key={p.id}
            className="particle"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              animationDelay: `${p.delay}s`
            }}
          />
        ))}
      </div>

      {/* Grid Lines */}
      <div className="grid-lines"></div>

      {/* Main Card */}
      <div className={`login-card ${shake ? 'shake' : ''} ${status === 'success' ? 'success-glow' : ''}`}>
        {/* Logo / Avatar */}
        <div className="logo-container">
          <div className="logo-ring ring-1"></div>
          <div className="logo-ring ring-2"></div>
          <div className="logo-ring ring-3"></div>
          <div className="logo-core">
            <span className="brain-icon">🧠</span>
          </div>
        </div>

        {/* Title */}
        <h1 className="title">
          <span className="title-gradient">Timmy</span>
          <span className="title-outline">OS</span>
        </h1>
        <p className="subtitle">Enter access code to continue</p>

        {/* Passcode Input */}
        <div className="passcode-container">
          {passcode.map((digit, index) => (
            <input
              key={index}
              ref={el => { inputRefs.current[index] = el }}
              type="password"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className={`passcode-input ${status === 'success' ? 'success' : ''} ${status === 'error' ? 'error' : ''}`}
              disabled={status === 'success'}
            />
          ))}
        </div>

        {/* Status Messages */}
        {status === 'success' && (
          <div className="status-message success-message">
            <span className="checkmark">✓</span>
            Access Granted
          </div>
        )}
        {status === 'error' && (
          <div className="status-message error-message">
            <span className="xmark">✕</span>
            Invalid Code
          </div>
        )}

        {/* Hints */}
        <div className="hints">
          <div className="hint-dot"></div>
          <span className="hint-text">Secure Connection</span>
          <div className="encrypt-icon">🔒</div>
        </div>
      </div>

      {/* Footer */}
      <div className="footer">
        <p>Powered by Clawdbot</p>
      </div>
    </div>
  )
}

export default Login

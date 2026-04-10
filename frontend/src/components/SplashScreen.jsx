import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const LOADING_STEPS = [
  { pct: 18,  msg: 'Initializing workout engine...' },
  { pct: 42,  msg: 'Loading your gains data...' },
  { pct: 67,  msg: 'Connecting to training services...' },
  { pct: 85,  msg: 'Calibrating personal records...' },
  { pct: 100, msg: "You're ready to crush it." },
]

export default function SplashScreen({ onComplete }) {
  const [step,    setStep]    = useState(0)
  const [pct,     setPct]     = useState(0)
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    LOADING_STEPS.forEach(({ pct: p }, i) => {
      setTimeout(() => {
        setPct(p)
        setStep(i)
      }, 300 + i * 420)
    })
    setTimeout(() => {
      setExiting(true)
      setTimeout(onComplete, 550)
    }, 300 + LOADING_STEPS.length * 420 + 300)
  }, [onComplete])

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          key="splash"
          exit={{ opacity: 0, scale: 1.04, filter: 'blur(12px)' }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: '#0d0d0d',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0,
          }}
        >
          {/* Radial gradient backdrop */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse at 50% 60%, rgba(255,69,0,0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <div style={{ position: 'relative', textAlign: 'center', maxWidth: 500, padding: '0 40px', width: '100%' }}>
            {/* Logo */}
            <motion.div
              initial={{ scale: 0.6, opacity: 0, y: 20 }}
              animate={{ scale: 1,   opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 18 }}
              style={{ marginBottom: 12 }}
            >
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(4rem, 14vw, 8rem)',
                letterSpacing: '0.06em',
                lineHeight: 1,
                color: '#fff',
              }}>
                FIT<span style={{ color: 'var(--orange)' }}>TRACK</span>
              </div>
              <div style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                letterSpacing: '0.35em',
                textTransform: 'uppercase',
                color: 'var(--text-faint)',
                marginTop: 6,
              }}>
                Forge Your Physique
              </div>
            </motion.div>

            {/* Animated dumbbell */}
            <motion.div
              animate={{ rotate: [-5, 5, -5], y: [0, -6, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              style={{ fontSize: '3rem', marginBottom: 48, display: 'block' }}
            >
              🏋️
            </motion.div>

            {/* Progress bar */}
            <div style={{
              height: 4,
              background: 'rgba(255,255,255,0.08)',
              borderRadius: 99,
              overflow: 'hidden',
              marginBottom: 16,
            }}>
              <motion.div
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                style={{
                  height: '100%',
                  background: 'linear-gradient(90deg, var(--orange), var(--gold))',
                  borderRadius: 99,
                  boxShadow: '0 0 12px rgba(255,69,0,0.6)',
                }}
              />
            </div>

            {/* Step message */}
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
                style={{
                  fontSize: '0.82rem',
                  color: step === LOADING_STEPS.length - 1 ? 'var(--orange)' : 'var(--text-faint)',
                  fontWeight: step === LOADING_STEPS.length - 1 ? 700 : 400,
                  letterSpacing: '0.04em',
                }}
              >
                {LOADING_STEPS[step]?.msg}
              </motion.div>
            </AnimatePresence>

            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.15)', marginTop: 8 }}>
              {pct}%
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

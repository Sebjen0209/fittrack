import { useEffect } from 'react'
import { motion } from 'framer-motion'

const ICONS = {
  success: '✅',
  error:   '❌',
  pr:      '🏆',
  info:    '💡',
}

export default function Toast({ msg, type = 'success', onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3800)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <motion.div
      className="toast"
      initial={{ x: 120, opacity: 0 }}
      animate={{ x: 0,   opacity: 1 }}
      exit={{ x: 120, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
      style={{
        borderLeft: `3px solid ${type === 'error' ? 'var(--red)' : type === 'pr' ? 'var(--gold)' : 'var(--green)'}`,
      }}
    >
      <span style={{ fontSize: '1.2rem' }}>{ICONS[type] || ICONS.success}</span>
      <div>
        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>{msg}</div>
      </div>
    </motion.div>
  )
}

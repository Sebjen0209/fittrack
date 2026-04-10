import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

function useCountUp(target, duration = 1100) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!target) return
    let start = null
    const step = (ts) => {
      if (!start) start = ts
      const p = Math.min((ts - start) / duration, 1)
      const ease = 1 - Math.pow(1 - p, 4)
      setVal(Math.round(ease * target))
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration])
  return val
}

export default function StatCard({ label, value, unit = '', icon, color = 'orange', delay = 0, highlight = false }) {
  const isNum = typeof value === 'number'
  const animated = useCountUp(isNum ? value : 0, 1200)

  const palette = {
    orange: { c: 'var(--orange)', bg: 'var(--orange-dim)' },
    gold:   { c: 'var(--gold)',   bg: 'var(--gold-dim)'   },
    green:  { c: 'var(--green)',  bg: 'var(--green-dim)'  },
    blue:   { c: 'var(--blue)',   bg: 'var(--blue-dim)'   },
    red:    { c: 'var(--red)',    bg: 'var(--red-dim)'    },
    purple: { c: 'var(--purple)', bg: 'var(--purple-dim)' },
  }
  const { c, bg } = palette[color] || palette.orange

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0,  scale: 1 }}
      transition={{ delay, type: 'spring', stiffness: 260, damping: 22 }}
      className="card"
      style={{
        padding: '18px 20px',
        borderLeft: `3px solid ${c}`,
        background: highlight
          ? `linear-gradient(135deg, ${bg} 0%, var(--card) 70%)`
          : 'var(--card)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Icon */}
      {icon && (
        <div style={{
          position: 'absolute', top: 14, right: 16,
          fontSize: '1.6rem',
          opacity: 0.18,
        }}>
          {icon}
        </div>
      )}

      <div style={{
        fontSize: '0.68rem',
        fontWeight: 700,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: 'var(--text-faint)',
        marginBottom: 6,
      }}>
        {label}
      </div>

      <div style={{
        fontFamily: 'var(--font-display)',
        fontSize: '2.4rem',
        letterSpacing: '0.04em',
        lineHeight: 1,
        color: highlight ? c : 'var(--text)',
      }}>
        {isNum ? animated : value}
        {unit && (
          <span style={{ fontSize: '1rem', color: 'var(--text-dim)', marginLeft: 4 }}>
            {unit}
          </span>
        )}
      </div>

      {/* Bottom accent */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: delay + 0.3, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'absolute', bottom: 0, left: 0,
          height: 2, width: '100%',
          background: `linear-gradient(90deg, ${c}, transparent)`,
          transformOrigin: 'left',
        }}
      />
    </motion.div>
  )
}

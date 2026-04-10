import { useRef } from 'react'
import { motion } from 'framer-motion'

/**
 * HoloButton — a cyberpunk holographic button
 * Props: onClick, children, color ('green'|'pink'|'blue'|'yellow'), disabled, fullWidth, size ('sm'|'md'|'lg')
 */
export default function HoloButton({
  children,
  onClick,
  color    = 'green',
  disabled = false,
  fullWidth = false,
  size     = 'md',
  type     = 'button',
  style,
}) {
  const rippleRef = useRef([])
  const btnRef    = useRef(null)

  const palette = {
    green:  { c: '#00ff88', g: 'rgba(0,255,136,',  glow: 'var(--glow-green)'  },
    pink:   { c: '#ff0080', g: 'rgba(255,0,128,',  glow: 'var(--glow-pink)'   },
    blue:   { c: '#00d4ff', g: 'rgba(0,212,255,',  glow: 'var(--glow-blue)'   },
    yellow: { c: '#ffcc00', g: 'rgba(255,204,0,',  glow: 'var(--glow-yellow)' },
    red:    { c: '#ff2244', g: 'rgba(255,34,68,',   glow: 'var(--glow-pink)'   },
  }
  const { c, g, glow } = palette[color] || palette.green

  const sizes = {
    sm: { padding: '7px 18px',  fontSize: '0.75rem' },
    md: { padding: '10px 24px', fontSize: '0.85rem' },
    lg: { padding: '14px 36px', fontSize: '1rem'    },
  }
  const sz = sizes[size] || sizes.md

  const handleClick = (e) => {
    if (disabled) return
    // Ripple
    const btn  = btnRef.current
    const rect = btn.getBoundingClientRect()
    const x    = e.clientX - rect.left
    const y    = e.clientY - rect.top

    const el = document.createElement('span')
    el.style.cssText = `
      position:absolute;
      left:${x}px; top:${y}px;
      width:8px; height:8px;
      border-radius:50%;
      background:${c};
      transform:translate(-50%,-50%) scale(0);
      opacity:0.8;
      pointer-events:none;
      animation: holo-ripple 0.6s ease-out forwards;
    `
    btn.appendChild(el)
    setTimeout(() => el.remove(), 700)
    onClick?.(e)
  }

  return (
    <>
      <style>{`
        @keyframes holo-ripple {
          to { transform: translate(-50%,-50%) scale(30); opacity: 0; }
        }
      `}</style>

      <motion.button
        ref={btnRef}
        type={type}
        disabled={disabled}
        onClick={handleClick}
        whileHover={!disabled ? { scale: 1.04, boxShadow: glow } : {}}
        whileTap={!disabled ? { scale: 0.96 } : {}}
        style={{
          position: 'relative',
          overflow: 'hidden',
          background: `linear-gradient(135deg, ${g}0.08) 0%, ${g}0.03) 100%)`,
          border: `1px solid ${c}`,
          borderRadius: 8,
          color: c,
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.4 : 1,
          width: fullWidth ? '100%' : 'auto',
          textShadow: `0 0 10px ${c}`,
          transition: 'background 0.3s',
          ...sz,
          ...style,
        }}
      >
        {/* Holographic shimmer */}
        <span style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(120deg, transparent 20%, ${g}0.12) 50%, transparent 80%)`,
          backgroundSize: '200% 100%',
          animation: 'shimmer 3s ease-in-out infinite',
          pointerEvents: 'none',
        }} />

        {/* Corner accents */}
        <span style={{ position:'absolute', top:3, left:3,  width:6, height:6, borderTop:`1px solid ${c}`, borderLeft:`1px solid ${c}` }} />
        <span style={{ position:'absolute', top:3, right:3, width:6, height:6, borderTop:`1px solid ${c}`, borderRight:`1px solid ${c}` }} />
        <span style={{ position:'absolute', bottom:3, left:3,  width:6, height:6, borderBottom:`1px solid ${c}`, borderLeft:`1px solid ${c}` }} />
        <span style={{ position:'absolute', bottom:3, right:3, width:6, height:6, borderBottom:`1px solid ${c}`, borderRight:`1px solid ${c}` }} />

        <span style={{ position: 'relative', zIndex: 1 }}>{children}</span>
      </motion.button>
    </>
  )
}

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useApp } from '../App'
import { COACH_QUOTES } from '../utils/fitness'

const TrackIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/>
    <line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6"  y1="20" x2="6"  y2="14"/>
  </svg>
)
const ServerIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="8" rx="2"/>
    <rect x="2" y="14" width="20" height="8" rx="2"/>
    <line x1="6" y1="6" x2="6.01" y2="6"/>
    <line x1="6" y1="18" x2="6.01" y2="18"/>
  </svg>
)
const ZapIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
)
const AwardIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="6"/>
    <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
  </svg>
)

const FEATURES = [
  { Icon: TrackIcon,  title: 'Track Everything', desc: 'Every rep, every set, every kg. Nothing escapes the log.' },
  { Icon: ServerIcon, title: 'Microservices',    desc: 'Dedicated user service and workout service, running independently.' },
  { Icon: ZapIcon,    title: 'Real-Time Stats',  desc: 'Live volume calculation, muscle group detection, intensity ratings.' },
  { Icon: AwardIcon,  title: 'PR Detection',     desc: 'Personal records tracked automatically. Celebrate every breakthrough.' },
]

export default function Home() {
  const { navigate, userId, userName } = useApp()
  const [quoteIdx, setQuoteIdx] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setQuoteIdx(i => (i + 1) % COACH_QUOTES.length), 5000)
    return () => clearInterval(t)
  }, [])

  return (
    <div style={{ minHeight: '100vh' }}>

      {/* ── Hero ── */}
      <div style={{
        position: 'relative',
        minHeight: '82vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '60px 40px',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: `
            radial-gradient(ellipse at 20% 50%, rgba(255,69,0,0.07) 0%, transparent 60%),
            radial-gradient(ellipse at 80% 30%, rgba(255,184,0,0.05) 0%, transparent 60%)
          `,
        }} />

        {/* Pre-title badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'var(--orange-dim)', border: '1px solid rgba(255,69,0,0.3)',
            borderRadius: 999, padding: '5px 16px',
            fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.14em',
            textTransform: 'uppercase', color: 'var(--orange)', marginBottom: 20,
          }}
        >
          {userId
            ? `Welcome back, ${userName?.split(' ')[0] || 'Athlete'}`
            : 'Your Gains. Tracked. Owned.'}
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30, scale: 0.94 }}
          animate={{ opacity: 1, y: 0,  scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 180, damping: 18 }}
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(4rem, 13vw, 10rem)',
            letterSpacing: '0.04em',
            lineHeight: 0.92,
            color: '#fff',
            marginBottom: 8,
          }}
        >
          FORGE<br />
          <span style={{ color: 'var(--orange)', textShadow: '0 0 60px rgba(255,69,0,0.4)' }}>
            YOUR<br />PHYSIQUE
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{
            fontSize: '1.05rem', color: 'var(--text-dim)',
            maxWidth: 480, lineHeight: 1.65, marginBottom: 40, fontWeight: 400,
          }}
        >
          {userId
            ? 'Ready to put in the work? Head to your dashboard or log a new session.'
            : 'The fitness tracker that refuses to be boring. Log workouts, track volume, detect muscle groups — watch your stats grow.'}
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}
        >
          <button
            className="btn btn-primary btn-lg"
            onClick={() => navigate('dashboard')}
            style={{
              animation: userId ? 'none' : 'pulse-orange 3s ease-in-out infinite',
              fontSize: '1rem',
              padding: '16px 44px',
            }}
          >
            {userId ? 'Dashboard' : 'Get Started'}
          </button>
          <button
            className="btn btn-secondary btn-lg"
            onClick={() => navigate('create')}
            style={{ fontSize: '1rem', padding: '16px 32px' }}
          >
            Log a Workout
          </button>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ position: 'absolute', bottom: 32, fontSize: '1.2rem', color: 'var(--text-faint)' }}
        >
          ↓
        </motion.div>
      </div>

      {/* ── Features ── */}
      <div style={{ padding: '80px 40px', maxWidth: 960, margin: '0 auto' }}>
        <div style={{
          textAlign: 'center',
          fontFamily: 'var(--font-display)',
          fontSize: '3rem',
          letterSpacing: '0.04em',
          marginBottom: 8,
        }}>
          EVERYTHING YOU NEED
        </div>
        <div style={{ textAlign: 'center', color: 'var(--text-dim)', marginBottom: 48, fontSize: '0.95rem' }}>
          Two microservices. One clean dashboard.
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20 }}>
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, type: 'spring', stiffness: 260, damping: 22 }}
              className="card card-orange"
              style={{ padding: '24px 20px' }}
            >
              <div style={{ color: 'var(--orange)', marginBottom: 12 }}><f.Icon /></div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 6 }}>{f.title}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)', lineHeight: 1.6 }}>{f.desc}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Coach quote ── */}
      <div style={{ padding: '0 40px 80px', maxWidth: 700, margin: '0 auto' }}>
        <motion.div
          key={quoteIdx}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="coach-quote"
          style={{
            textAlign: 'center',
            borderLeft: 'none',
            borderBottom: '3px solid var(--orange)',
            borderRadius: 'var(--radius)',
            padding: '24px 32px',
          }}
        >
          <div style={{
            fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.14em',
            color: 'var(--orange)', marginBottom: 8, textTransform: 'uppercase',
          }}>
            Coach Says
          </div>
          "{COACH_QUOTES[quoteIdx]}"
        </motion.div>
      </div>

      {/* ── Final CTA ── */}
      <div style={{ textAlign: 'center', padding: '0 40px 100px' }}>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(2rem, 6vw, 4rem)',
          letterSpacing: '0.04em',
          marginBottom: 20,
        }}>
          READY TO <span style={{ color: 'var(--orange)' }}>CRUSH IT?</span>
        </div>
        <button
          className="btn btn-primary btn-lg"
          onClick={() => navigate('create')}
          style={{ fontSize: '1.1rem', padding: '18px 56px' }}
        >
          Log Your First Workout
        </button>
      </div>
    </div>
  )
}

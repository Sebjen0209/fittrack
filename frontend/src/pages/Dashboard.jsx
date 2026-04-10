import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../App'
import { userApi, workoutApi } from '../api/client'
import StatCard from '../components/StatCard'
import WorkoutCard from '../components/WorkoutCard'
import {
  calcVolume, calcTotalSets, calcTotalReps, estimateCalories,
  getLevel, calcStreak, topMuscleGroup, fmtWeight, COACH_QUOTES,
} from '../utils/fitness'

// ─── Auth form ────────────────────────────────────────────────────
function AuthForm({ onAuth }) {
  const [mode,    setMode]    = useState('login')
  const [uid,     setUid]     = useState('')
  const [name,    setName]    = useState('')
  const [email,   setEmail]   = useState('')
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!uid.trim()) { setError('User ID is required'); return }
    setLoading(true); setError('')
    try {
      const user = await userApi.get(uid.trim())
      onAuth(user.id, user.name)
    } catch { setError('User not found. Check your ID or create an account.') }
    finally { setLoading(false) }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    if (!name.trim() || !email.trim()) { setError('Name and email are required'); return }
    setLoading(true); setError('')
    try {
      const user = await userApi.create(name.trim(), email.trim())
      onAuth(user.id, user.name)
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  return (
    <div style={{
      minHeight: '90vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 40,
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 24 }}
        animate={{ opacity: 1, scale: 1,    y: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 20 }}
        style={{
          background: 'var(--card)',
          border: '1px solid var(--card-border)',
          borderRadius: 'var(--radius-lg)',
          borderTop: '3px solid var(--orange)',
          padding: '40px 44px',
          maxWidth: 440,
          width: '100%',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2rem',
            letterSpacing: '0.06em',
          }}>
            GET IN THE GYM
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)', marginTop: 4 }}>
            Sign in or create your athlete profile
          </div>
        </div>

        {/* Toggle */}
        <div style={{
          display: 'flex',
          background: 'var(--surface)',
          borderRadius: 8,
          padding: 3,
          marginBottom: 24,
        }}>
          {['login', 'register'].map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setError('') }}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: 6,
                border: 'none',
                background: mode === m ? 'var(--orange)' : 'transparent',
                color: mode === m ? '#fff' : 'var(--text-dim)',
                fontSize: '0.78rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: mode === m ? '0 2px 12px rgba(255,69,0,0.35)' : 'none',
              }}
            >
              {m === 'login' ? 'Log In' : 'Register'}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {mode === 'login' ? (
            <motion.form
              key="login"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              onSubmit={handleLogin}
              style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
            >
              <div>
                <label className="field-label">Your User ID</label>
                <input
                  className="input"
                  value={uid}
                  onChange={e => setUid(e.target.value)}
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  disabled={loading}
                />
                <div style={{ fontSize: '0.7rem', color: 'var(--text-faint)', marginTop: 5 }}>
                  Find your ID on your Profile page after registering.
                </div>
              </div>
              {error && <div style={{ fontSize: '0.78rem', color: 'var(--red)', background: 'var(--red-dim)', borderRadius: 6, padding: '8px 12px' }}>⚠ {error}</div>}
              <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', marginTop: 4 }}>
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </motion.form>
          ) : (
            <motion.form
              key="register"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              onSubmit={handleRegister}
              style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
            >
              <div>
                <label className="field-label">Your Name</label>
                <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Arnold" disabled={loading} />
              </div>
              <div>
                <label className="field-label">Email</label>
                <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="gains@example.com" disabled={loading} />
              </div>
              {error && <div style={{ fontSize: '0.78rem', color: 'var(--red)', background: 'var(--red-dim)', borderRadius: 6, padding: '8px 12px' }}>⚠ {error}</div>}
              <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', marginTop: 4 }}>
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

// ─── Weekly progress bar ──────────────────────────────────────────
function WeekBar({ workouts }) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const now   = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - ((now.getDay() + 6) % 7))
  weekStart.setHours(0, 0, 0, 0)

  const dayWorkouts = days.map((_, i) => {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() + i)
    return workouts.filter(w => {
      const wd = new Date(w.created_at)
      return wd.toDateString() === d.toDateString()
    })
  })

  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 60 }}>
      {days.map((day, i) => {
        const count = dayWorkouts[i].length
        const isToday = i === (now.getDay() + 6) % 7
        return (
          <div key={day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: count > 0 ? Math.min(count * 20 + 12, 48) : 4 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: i * 0.04 }}
              style={{
                width: '100%',
                background: count > 0 ? 'var(--orange)' : 'rgba(255,255,255,0.07)',
                borderRadius: 4,
                boxShadow: count > 0 ? '0 0 10px rgba(255,69,0,0.4)' : 'none',
              }}
            />
            <div style={{
              fontSize: '0.6rem',
              fontWeight: isToday ? 800 : 400,
              color: isToday ? 'var(--orange)' : 'var(--text-faint)',
              letterSpacing: '0.06em',
            }}>
              {day}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────
export default function Dashboard() {
  const { userId, userName, setUserId, navigate, showToast } = useApp()
  const [workouts, setWorkouts] = useState([])
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [quoteIdx, setQuoteIdx] = useState(() => Math.floor(Math.random() * COACH_QUOTES.length))

  useEffect(() => {
    const t = setInterval(() => setQuoteIdx(i => (i + 1) % COACH_QUOTES.length), 6000)
    return () => clearInterval(t)
  }, [])

  const load = useCallback(async (uid) => {
    if (!uid) return
    setLoading(true); setError('')
    try {
      const data = await workoutApi.getByUser(uid)
      setWorkouts(Array.isArray(data) ? data : [])
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load(userId) }, [userId, load])

  const handleDeleted = useCallback((id) => {
    setWorkouts(ws => ws.filter(w => w.id !== id))
    showToast('Workout deleted.', 'info')
  }, [showToast])

  if (!userId) {
    return <AuthForm onAuth={(id, name) => { setUserId(id, name); showToast(`Welcome back, ${name}!`, 'success') }} />
  }

  // Aggregate stats
  const totalVol   = workouts.reduce((a, w) => a + calcVolume(w.exercises || []), 0)
  const totalSets  = workouts.reduce((a, w) => a + calcTotalSets(w.exercises || []), 0)
  const totalReps  = workouts.reduce((a, w) => a + calcTotalReps(w.exercises || []), 0)
  const totalKcal  = estimateCalories(totalVol)
  const streak     = calcStreak(workouts)
  const level      = getLevel(workouts.length)
  const topMuscle  = topMuscleGroup(workouts)

  // This week's workouts
  const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7)
  const weekWorkouts = workouts.filter(w => new Date(w.created_at) > weekAgo)

  return (
    <div style={{ padding: '0 0 80px' }}>
      {/* ── Header ── */}
      <div style={{
        background: 'var(--surface)',
        borderBottom: '1px solid var(--card-border)',
        padding: '20px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2rem',
            letterSpacing: '0.04em',
            lineHeight: 1,
          }}>
            {userName ? `WELCOME BACK, ${userName.split(' ')[0].toUpperCase()}` : 'COMMAND CENTER'}
            <span style={{ color: 'var(--orange)' }}>.</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: 4 }}>
            {workouts.length} total workouts · {weekWorkouts.length} this week
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Streak */}
          {streak > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(255,69,0,0.1)',
              border: '1px solid rgba(255,69,0,0.3)',
              borderRadius: 999,
              padding: '6px 14px',
            }}>
              <span style={{
                fontSize: '1.1rem',
                animation: 'fire-flicker 1.5s ease-in-out infinite',
                display: 'inline-block',
              }}>🔥</span>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.1rem',
                color: 'var(--orange)',
                letterSpacing: '0.06em',
                animation: 'streak-pulse 2s ease-in-out infinite',
              }}>
                {streak} DAY STREAK
              </span>
            </div>
          )}

          {/* Level */}
          <div className="level-chip">
            LVL {level.tier}: {level.label.toUpperCase()}
          </div>

          <button
            className="btn btn-secondary"
            onClick={() => { setUserId(null, null); setWorkouts([]) }}
            style={{ fontSize: '0.75rem', padding: '7px 14px' }}
          >
            Log Out
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div style={{ padding: '24px 32px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 12 }}>
        <StatCard label="Total Workouts"   value={workouts.length}          icon="🏋️" color="orange" delay={0}    highlight />
        <StatCard label="This Week"        value={weekWorkouts.length}       icon="📅" color="blue"   delay={0.06} />
        <StatCard label="Total Volume"     value={Math.round(totalVol)}      icon="⚖️" color="green"  delay={0.12} unit="kg" />
        <StatCard label="Total Sets"       value={totalSets}                 icon="🔁" color="purple" delay={0.18} />
        <StatCard label="Total Reps"       value={totalReps}                 icon="💪" color="orange" delay={0.24} />
        <StatCard label="Kcal Burned ~"    value={totalKcal}                 icon="🔥" color="red"    delay={0.30} />
        <StatCard label="Avg Vol/Workout"  value={workouts.length ? Math.round(totalVol / workouts.length) : 0} icon="📊" color="gold" delay={0.36} unit="kg" />
        <StatCard label="Day Streak"       value={streak}                    icon="🔥" color="orange" delay={0.42} highlight={streak >= 3} />
      </div>

      {/* ── This week + Quote ── */}
      <div style={{ padding: '0 32px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28 }}>
        {/* Week activity */}
        <div className="card" style={{ padding: '18px 20px' }}>
          <div className="section-label">This Week's Activity</div>
          <WeekBar workouts={workouts} />
        </div>

        {/* Coach quote + top muscle */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={quoteIdx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
              className="coach-quote"
              style={{ flex: 1 }}
            >
              <div style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.14em', color: 'var(--orange)', marginBottom: 6, textTransform: 'uppercase' }}>
                Coach Says
              </div>
              "{COACH_QUOTES[quoteIdx]}"
            </motion.div>
          </AnimatePresence>

          {topMuscle && (
            <div className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ fontSize: '2rem' }}>{topMuscle.emoji}</span>
              <div>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-faint)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>
                  Most Trained Muscle
                </div>
                <div style={{ fontWeight: 800, fontSize: '1rem', color: topMuscle.color }}>{topMuscle.name}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Workouts ── */}
      <div style={{ padding: '0 32px' }}>
        <div className="section-label">
          All Workouts
          <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-body)', fontSize: '0.7rem', fontWeight: 400, color: 'var(--text-faint)', letterSpacing: 0, textTransform: 'none' }}>
            {workouts.length} logged
          </span>
        </div>

        {error && (
          <div style={{ padding: '12px 16px', background: 'var(--red-dim)', border: '1px solid rgba(255,45,85,0.25)', borderRadius: 8, color: 'var(--red)', fontSize: '0.82rem', marginBottom: 16 }}>
            ⚠ {error}
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '40px 0', color: 'var(--text-dim)', fontSize: '0.9rem' }}>
            <div className="spinner" style={{ color: 'var(--orange)' }} />
            Loading your gains...
          </div>
        ) : workouts.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', letterSpacing: '0.04em' }}>NO WORKOUTS YET</div>
            <div style={{ color: 'var(--text-dim)', fontSize: '0.88rem' }}>Your gains are waiting. Log your first workout.</div>
            <button className="btn btn-primary" onClick={() => navigate('create')} style={{ marginTop: 8 }}>
              Log a Workout
            </button>
          </div>
        ) : (
          <div className="workout-grid">
            <AnimatePresence>
              {workouts.map((w, i) => (
                <WorkoutCard key={w.id} workout={w} onDeleted={handleDeleted} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* FAB */}
      <motion.button
        className="fab"
        onClick={() => navigate('create')}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.92 }}
        title="Log a Workout"
      >
        +
      </motion.button>
    </div>
  )
}

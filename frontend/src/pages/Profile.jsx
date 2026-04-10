import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../App'
import { userApi, workoutApi } from '../api/client'
import StatCard from '../components/StatCard'
import {
  calcVolume, calcTotalSets, calcTotalReps, estimateCalories,
  getLevel, calcStreak, detectMuscleGroups, MUSCLE_MAP_ALL, fmtWeight,
} from '../utils/fitness'

const ACHIEVEMENTS = [
  { id: 'first_blood', icon: '🩸', label: 'First Blood',    desc: 'Log your first workout',       check: (ws) => ws.length >= 1 },
  { id: 'week_warrior',icon: '📅', label: 'Week Warrior',   desc: '7 workouts logged',             check: (ws) => ws.length >= 7 },
  { id: 'centurion',   icon: '💯', label: 'Centurion',      desc: '100 total sets',                check: (_, sets) => sets >= 100 },
  { id: 'ton_up',      icon: '⚖️', label: 'Ton Up',         desc: '1,000 kg total volume',         check: (_, __, vol) => vol >= 1000 },
  { id: 'iron_will',   icon: '🔱', label: 'Iron Will',      desc: '5,000 kg total volume',         check: (_, __, vol) => vol >= 5000 },
  { id: 'beast_mode',  icon: '🦁', label: 'Beast Mode',     desc: '10,000 kg total volume',        check: (_, __, vol) => vol >= 10000 },
  { id: 'streak_fire', icon: '🔥', label: 'On Fire',        desc: '3-day training streak',         check: (ws, _,__,streak) => streak >= 3 },
  { id: 'variety',     icon: '🌈', label: 'Variety Pack',   desc: 'Train 4 different muscle groups',check: (ws) => {
    const muscles = new Set(ws.flatMap(w => (w.exercises||[]).flatMap(ex => detectMuscleGroups(ex.name).map(m => m.name))))
    return muscles.size >= 4
  }},
  { id: 'dedicated',   icon: '🏅', label: 'Dedicated',      desc: '20 workouts logged',            check: (ws) => ws.length >= 20 },
  { id: 'legend',      icon: '🏆', label: 'Legend',         desc: '50 workouts logged',            check: (ws) => ws.length >= 50 },
  { id: 'thousand_reps',icon:'💪', label: '1K Reps',        desc: '1,000 total reps',              check: (_, __, ___, ____, reps) => reps >= 1000 },
  { id: 'kcal_king',   icon: '🔥', label: 'Kcal King',      desc: '5,000 kcal estimated burned',   check: (_, __, vol) => estimateCalories(vol) >= 5000 },
]

function AchievementBadge({ ach, earned }) {
  return (
    <motion.div
      whileHover={earned ? { scale: 1.06, y: -3 } : {}}
      className="card"
      style={{
        padding: '14px 12px',
        textAlign: 'center',
        opacity: earned ? 1 : 0.3,
        cursor: 'default',
        borderTop: earned ? '2px solid var(--gold)' : '2px solid transparent',
        background: earned ? 'linear-gradient(160deg, var(--gold-dim), var(--card))' : 'var(--card)',
      }}
    >
      <div style={{ fontSize: '1.8rem', marginBottom: 6, filter: earned ? 'none' : 'grayscale(1)' }}>
        {ach.icon}
      </div>
      <div style={{ fontWeight: 800, fontSize: '0.75rem', color: earned ? 'var(--gold)' : 'var(--text-faint)', marginBottom: 3, letterSpacing: '0.04em' }}>
        {ach.label}
      </div>
      <div style={{ fontSize: '0.63rem', color: 'var(--text-faint)', lineHeight: 1.4 }}>
        {ach.desc}
      </div>
      {earned && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.3 }}
          style={{
            width: 6, height: 6, borderRadius: '50%',
            background: 'var(--gold)',
            boxShadow: 'var(--gold-glow)',
            margin: '6px auto 0',
            animation: 'pulse-gold 2.5s ease-in-out infinite',
          }}
        />
      )}
    </motion.div>
  )
}

function MuscleBreakdown({ workouts }) {
  const counts = {}
  for (const w of workouts) {
    for (const ex of w.exercises || []) {
      for (const m of detectMuscleGroups(ex.name)) {
        counts[m.name] = (counts[m.name] || 0) + 1
      }
    }
  }
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1])
  const max = entries[0]?.[1] || 1

  if (!entries.length) return (
    <div style={{ color: 'var(--text-faint)', fontSize: '0.82rem', padding: '12px 0' }}>
      No muscle data yet — log workouts with named exercises.
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {entries.map(([name, count], i) => {
        const muscle = MUSCLE_MAP_ALL.find(m => m.name === name)
        if (!muscle) return null
        return (
          <div key={name}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: muscle.color }}>
                {muscle.emoji} {name}
              </span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-faint)', fontWeight: 600 }}>
                {count} exercise{count !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="intensity-bar-track" style={{ height: 6 }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(count / max) * 100}%` }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: i * 0.05 }}
                style={{ height: '100%', borderRadius: 99, background: muscle.color, boxShadow: `0 0 8px ${muscle.color}50` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function Profile() {
  const { userId, userName, setUserId, navigate, showToast } = useApp()
  const [user,    setUser]    = useState(null)
  const [workouts,setWorkouts]= useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [newName, setNewName] = useState('')
  const [error,   setError]   = useState('')

  useEffect(() => {
    if (!userId) { setLoading(false); return }
    Promise.all([userApi.get(userId), workoutApi.getByUser(userId)])
      .then(([u, ws]) => { setUser(u); setNewName(u.name); setWorkouts(Array.isArray(ws) ? ws : []) })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [userId])

  const handleUpdateName = async () => {
    if (!newName.trim()) return
    try {
      await userApi.update(userId, newName.trim())
      setUser(u => ({ ...u, name: newName.trim() }))
      setUserId(userId, newName.trim())
      setEditing(false)
      showToast('Name updated.', 'success')
    } catch (err) { setError(err.message) }
  }

  if (!userId) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: 8 }}>NOT LOGGED IN</div>
          <div style={{ color: 'var(--text-dim)', fontSize: '0.88rem', marginBottom: 24 }}>Log in from the Dashboard to see your profile.</div>
          <button className="btn btn-primary" onClick={() => navigate('dashboard')}>Go to Dashboard</button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', gap: 12, color: 'var(--text-dim)' }}>
        <div className="spinner" style={{ color: 'var(--orange)' }} />
        Loading your dossier...
      </div>
    )
  }

  // Stats
  const totalVol  = workouts.reduce((a, w) => a + calcVolume(w.exercises || []), 0)
  const totalSets = workouts.reduce((a, w) => a + calcTotalSets(w.exercises || []), 0)
  const totalReps = workouts.reduce((a, w) => a + calcTotalReps(w.exercises || []), 0)
  const kcal      = estimateCalories(totalVol)
  const streak    = calcStreak(workouts)
  const level     = getLevel(workouts.length)
  const nextLevel = getLevel(workouts.length + 1)
  const earnedAch = ACHIEVEMENTS.filter(a => a.check(workouts, totalSets, totalVol, streak, totalReps))
  const initials  = (user?.name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1000, margin: '0 auto', paddingBottom: 60 }}>
      {/* Header */}
      <div style={{
        fontFamily: 'var(--font-display)',
        fontSize: '2.8rem',
        letterSpacing: '0.04em',
        lineHeight: 1,
        marginBottom: 28,
      }}>
        YOUR <span style={{ color: 'var(--orange)' }}>DOSSIER</span>
      </div>

      {error && (
        <div style={{ padding: '10px 16px', background: 'var(--red-dim)', border: '1px solid rgba(255,45,85,0.2)', borderRadius: 8, color: 'var(--red)', fontSize: '0.82rem', marginBottom: 20 }}>
          ⚠ {error}
        </div>
      )}

      {/* Profile card + level */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20, marginBottom: 28 }}>
        {/* Identity */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 20 }}
          className="card"
          style={{ padding: '28px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', borderTop: '3px solid var(--orange)' }}
        >
          {/* Avatar */}
          <motion.div
            animate={{ boxShadow: ['0 0 20px rgba(255,69,0,0.3)', '0 0 40px rgba(255,69,0,0.5)', '0 0 20px rgba(255,69,0,0.3)'] }}
            transition={{ duration: 3, repeat: Infinity }}
            style={{
              width: 90, height: 90,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--orange), rgba(255,184,0,0.8))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)',
              fontSize: '2.2rem',
              letterSpacing: '0.06em',
              color: '#fff',
              marginBottom: 14,
              border: '3px solid rgba(255,69,0,0.5)',
            }}
          >
            {initials}
          </motion.div>

          {/* Name */}
          <AnimatePresence mode="wait">
            {editing ? (
              <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <input className="input" value={newName} onChange={e => setNewName(e.target.value)} style={{ textAlign: 'center', fontWeight: 700 }} autoFocus />
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-primary" style={{ flex: 1, fontSize: '0.8rem', padding: '8px' }} onClick={handleUpdateName}>Save</button>
                  <button className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '8px 12px' }} onClick={() => setEditing(false)}>✕</button>
                </div>
              </motion.div>
            ) : (
              <motion.div key="display" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div style={{ fontWeight: 800, fontSize: '1.15rem', marginBottom: 2 }}>{user?.name}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)', marginBottom: 14, wordBreak: 'break-all' }}>{user?.email}</div>
                <button className="btn btn-secondary" style={{ fontSize: '0.72rem', padding: '6px 14px', marginBottom: 10 }} onClick={() => setEditing(true)}>
                  ✎ Edit Name
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="level-chip" style={{ marginBottom: 12 }}>
            Level {level.tier}: {level.label}
          </div>

          {/* UUID */}
          <div style={{
            background: 'var(--surface)', borderRadius: 6, padding: '8px 10px',
            width: '100%', textAlign: 'left',
          }}>
            <div style={{ fontSize: '0.58rem', fontWeight: 700, color: 'var(--text-faint)', letterSpacing: '0.1em', marginBottom: 3 }}>USER ID</div>
            <div style={{ fontSize: '0.58rem', color: 'var(--orange)', wordBreak: 'break-all', fontFamily: 'monospace' }}>{userId}</div>
          </div>

          <button
            className="btn btn-secondary"
            style={{ width: '100%', marginTop: 12, fontSize: '0.78rem' }}
            onClick={() => { setUserId(null, null); navigate('home'); showToast('Logged out.', 'info') }}
          >
            Log Out
          </button>
        </motion.div>

        {/* Stats panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            <StatCard label="Workouts"   value={workouts.length}     icon="🏋️" color="orange" delay={0}    highlight />
            <StatCard label="Volume"     value={Math.round(totalVol)} icon="⚖️" color="green"  delay={0.06} unit="kg" />
            <StatCard label="Day Streak" value={streak}               icon="🔥" color="red"    delay={0.12} highlight={streak >= 3} />
            <StatCard label="Total Sets" value={totalSets}            icon="🔁" color="blue"   delay={0.18} />
            <StatCard label="Total Reps" value={totalReps}            icon="💪" color="purple" delay={0.24} />
            <StatCard label="Kcal ~"     value={kcal}                 icon="⚡" color="gold"   delay={0.30} />
          </div>

          {/* Muscle breakdown */}
          <div className="card" style={{ padding: '18px 20px' }}>
            <div className="section-label" style={{ marginBottom: 14 }}>Muscle Group Breakdown</div>
            <MuscleBreakdown workouts={workouts} />
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div style={{ marginBottom: 32 }}>
        <div className="section-label">
          Achievements
          <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-body)', fontSize: '0.72rem', fontWeight: 600, letterSpacing: 0, textTransform: 'none', color: 'var(--gold)' }}>
            {earnedAch.length}/{ACHIEVEMENTS.length} unlocked
          </span>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
          gap: 12,
        }}>
          {ACHIEVEMENTS.map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04, type: 'spring', stiffness: 260, damping: 22 }}
            >
              <AchievementBadge ach={a} earned={earnedAch.some(e => e.id === a.id)} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent workouts */}
      {workouts.length > 0 && (
        <div>
          <div className="section-label">Recent Sessions</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {workouts.slice(0, 10).map((w, i) => {
              const vol = calcVolume(w.exercises || [])
              const muscles = [...new Map(
                (w.exercises || []).flatMap(ex => detectMuscleGroups(ex.name)).map(m => [m.name, m])
              ).values()].slice(0, 3)
              return (
                <motion.div
                  key={w.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 0',
                    borderBottom: '1px solid var(--card-border)',
                    gap: 12,
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                    <div style={{
                      width: 4, height: 32, borderRadius: 2,
                      background: 'var(--orange)',
                      flexShrink: 0,
                    }} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{w.name}</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-faint)' }}>
                        {new Date(w.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        {' · '}{w.exercises?.length || 0} exercises
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    {muscles.map(m => (
                      <span key={m.name} className="muscle-badge" style={{ color: m.color, borderColor: `${m.color}40`, background: m.bg, fontSize: '0.58rem' }}>
                        {m.emoji} {m.name}
                      </span>
                    ))}
                    <span style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.1rem',
                      color: 'var(--orange)',
                      letterSpacing: '0.04em',
                    }}>
                      {Math.round(vol)}kg
                    </span>
                  </div>
                </motion.div>
              )
            })}
            {workouts.length > 10 && (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)', padding: '12px 0' }}>
                +{workouts.length - 10} more sessions...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

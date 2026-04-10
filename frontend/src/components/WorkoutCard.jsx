import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { detectMuscleGroups, calcVolume, getIntensity, estimateCalories } from '../utils/fitness'
import { workoutApi } from '../api/client'

export default function WorkoutCard({ workout, onDeleted }) {
  const [expanded, setExpanded] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirm,  setConfirm]  = useState(false)

  const volume    = calcVolume(workout.exercises || [])
  const intensity = getIntensity(volume)
  const calories  = estimateCalories(volume)
  const totalSets = (workout.exercises || []).reduce((a, ex) => a + (ex.sets?.length || 0), 0)
  const muscles   = [...new Map(
    (workout.exercises || [])
      .flatMap(ex => detectMuscleGroups(ex.name))
      .map(m => [m.name, m])
  ).values()].slice(0, 4)

  const date = new Date(workout.created_at)
  const dateStr = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  const timeStr = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await workoutApi.delete(workout.id)
      onDeleted(workout.id)
    } catch { setDeleting(false); setConfirm(false) }
  }

  return (
    <AnimatePresence>
      {!deleting && (
        <motion.div
          layout
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, filter: 'blur(8px)', transition: { duration: 0.3 } }}
          transition={{ type: 'spring', stiffness: 280, damping: 24 }}
          className="card"
          style={{ position: 'relative', overflow: 'hidden' }}
        >
          {/* Intensity color stripe */}
          <div style={{
            height: 3,
            background: `linear-gradient(90deg, ${intensity.color}, transparent)`,
            boxShadow: `0 0 12px ${intensity.color}60`,
          }} />

          <div style={{ padding: '16px 18px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.3rem',
                  letterSpacing: '0.04em',
                  color: 'var(--text)',
                  lineHeight: 1.1,
                  textTransform: 'uppercase',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {workout.name}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-faint)', marginTop: 3 }}>
                  {dateStr} · {timeStr}
                </div>
              </div>

              {/* Intensity badge */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                background: `${intensity.color}18`,
                border: `1px solid ${intensity.color}40`,
                borderRadius: 999,
                padding: '3px 10px',
                fontSize: '0.65rem',
                fontWeight: 800,
                color: intensity.color,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                flexShrink: 0,
                marginLeft: 8,
              }}>
                {intensity.emoji} {intensity.label}
              </div>
            </div>

            {/* Stats row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 6,
              marginBottom: 12,
            }}>
              {[
                { label: 'EXERCISES',   val: workout.exercises?.length || 0 },
                { label: 'SETS',        val: totalSets },
                { label: 'VOL (KG)',    val: Math.round(volume) },
                { label: 'KCAL ~',      val: calories },
              ].map(s => (
                <div key={s.label} style={{
                  background: 'var(--surface)',
                  borderRadius: 6,
                  padding: '6px 0',
                  textAlign: 'center',
                }}>
                  <div style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.1rem',
                    letterSpacing: '0.04em',
                    color: 'var(--text)',
                    lineHeight: 1,
                  }}>
                    {s.val}
                  </div>
                  <div style={{ fontSize: '0.52rem', fontWeight: 700, color: 'var(--text-faint)', letterSpacing: '0.1em', marginTop: 2 }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Intensity bar */}
            <div style={{ marginBottom: 12 }}>
              <div className="intensity-bar-track">
                <motion.div
                  className="intensity-bar-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${intensity.pct}%` }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  style={{ background: intensity.color, boxShadow: `0 0 8px ${intensity.color}60` }}
                />
              </div>
            </div>

            {/* Muscle groups */}
            {muscles.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 12 }}>
                {muscles.map(m => (
                  <span
                    key={m.name}
                    className="muscle-badge"
                    style={{ color: m.color, borderColor: `${m.color}40`, background: m.bg }}
                  >
                    {m.emoji} {m.name}
                  </span>
                ))}
              </div>
            )}

            {/* Exercise list (collapsed) */}
            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  style={{ overflow: 'hidden', marginBottom: 12 }}
                >
                  <div style={{
                    background: 'var(--surface)',
                    borderRadius: 8,
                    padding: '10px 14px',
                  }}>
                    {(workout.exercises || []).map((ex, i) => (
                      <div key={ex.id} style={{
                        paddingBottom: i < workout.exercises.length - 1 ? 8 : 0,
                        marginBottom: i < workout.exercises.length - 1 ? 8 : 0,
                        borderBottom: i < workout.exercises.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                      }}>
                        <div style={{
                          fontWeight: 600,
                          fontSize: '0.82rem',
                          color: 'var(--text)',
                          marginBottom: 4,
                        }}>
                          {ex.name}
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {(ex.sets || []).map((s, si) => (
                            <span key={s.id} style={{
                              background: 'rgba(255,255,255,0.06)',
                              borderRadius: 4,
                              padding: '2px 7px',
                              fontSize: '0.7rem',
                              color: 'var(--text-dim)',
                            }}>
                              {s.reps}×{s.weight}kg
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setExpanded(e => !e)}
                style={{ flex: 1, fontSize: '0.75rem', padding: '7px 0' }}
              >
                {expanded ? '▲ Collapse' : '▼ View Sets'}
              </button>

              <AnimatePresence mode="wait">
                {confirm ? (
                  <motion.div
                    key="confirm"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    style={{ display: 'flex', gap: 4 }}
                  >
                    <button className="btn btn-danger" onClick={handleDelete} style={{ fontSize: '0.72rem', padding: '7px 12px' }}>
                      Confirm
                    </button>
                    <button className="btn btn-secondary" onClick={() => setConfirm(false)} style={{ fontSize: '0.72rem', padding: '7px 10px' }}>
                      Cancel
                    </button>
                  </motion.div>
                ) : (
                  <motion.button
                    key="delete"
                    className="btn btn-danger"
                    onClick={() => setConfirm(true)}
                    style={{ fontSize: '0.72rem', padding: '7px 14px' }}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                  >
                    🗑
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

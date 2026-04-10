import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../App'
import { workoutApi } from '../api/client'
import Confetti from '../components/Confetti'
import {
  detectMuscleGroups, calcVolume, calcTotalReps, calcTotalSets,
  estimateCalories, getIntensity, COACH_QUOTES,
} from '../utils/fitness'

const PRESETS = ['Chest Day', 'Leg Day', 'Back & Biceps', 'Push Day', 'Pull Day', 'Full Body', 'Shoulder & Traps', 'Arm Day']

let _id = 0
const uid = () => ++_id
const newSet = ()      => ({ _id: uid(), reps: '', weight: '' })
const newExercise = () => ({ _id: uid(), name: '', sets: [newSet()] })

// ─── Live stats panel ─────────────────────────────────────────────
function LiveStats({ exercises }) {
  const volume    = calcVolume(exercises)
  const reps      = calcTotalReps(exercises)
  const sets      = calcTotalSets(exercises)
  const kcal      = estimateCalories(volume)
  const intensity = getIntensity(volume)

  const muscles = [...new Map(
    exercises.flatMap(ex => detectMuscleGroups(ex.name)).map(m => [m.name, m])
  ).values()]

  return (
    <div style={{
      background: 'var(--surface)',
      borderRadius: 'var(--radius)',
      border: '1px solid var(--card-border)',
      padding: '20px',
      position: 'sticky',
      top: 24,
    }}>
      <div style={{
        fontFamily: 'var(--font-display)',
        fontSize: '1rem',
        letterSpacing: '0.08em',
        color: 'var(--text-dim)',
        marginBottom: 14,
        textTransform: 'uppercase',
      }}>
        Live Stats
      </div>

      {/* Big volume number */}
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <motion.div
          key={Math.round(volume / 10)}
          initial={{ scale: 1.3, color: 'var(--orange)' }}
          animate={{ scale: 1,   color: '#fff' }}
          transition={{ duration: 0.4 }}
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '3.5rem',
            letterSpacing: '0.04em',
            lineHeight: 1,
          }}
        >
          {Math.round(volume)}
        </motion.div>
        <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-faint)', letterSpacing: '0.14em', marginTop: 2 }}>
          KG TOTAL VOLUME
        </div>
      </div>

      {/* Intensity bar */}
      <div style={{ marginBottom: 14 }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '0.68rem',
          fontWeight: 700,
          letterSpacing: '0.08em',
          marginBottom: 5,
          color: intensity.color,
        }}>
          <span>{intensity.emoji} {intensity.label}</span>
          <span>{intensity.pct}%</span>
        </div>
        <div className="intensity-bar-track" style={{ height: 6 }}>
          <motion.div
            animate={{ width: `${intensity.pct}%` }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{
              height: '100%',
              borderRadius: 99,
              background: intensity.color,
              boxShadow: `0 0 10px ${intensity.color}60`,
            }}
          />
        </div>
      </div>

      {/* Mini stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
        {[
          { label: 'Sets',      val: sets },
          { label: 'Reps',      val: reps },
          { label: 'Exercises', val: exercises.length },
          { label: 'Kcal ~',    val: kcal },
        ].map(s => (
          <div key={s.label} className="live-stat">
            <div className="val" style={{ color: 'var(--text)' }}>{s.val}</div>
            <div className="lab">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Muscle groups */}
      {muscles.length > 0 && (
        <div>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-faint)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 7 }}>
            Targeting
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            <AnimatePresence>
              {muscles.map(m => (
                <motion.span
                  key={m.name}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="muscle-badge"
                  style={{ color: m.color, borderColor: `${m.color}40`, background: m.bg, animation: 'badge-pop 0.4s var(--ease-spring)' }}
                >
                  {m.emoji} {m.name}
                </motion.span>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {muscles.length === 0 && (
        <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)', textAlign: 'center', padding: '8px 0' }}>
          Add exercises to detect muscle groups
        </div>
      )}
    </div>
  )
}

// ─── Set row ──────────────────────────────────────────────────────
function SetRow({ set, idx, onSetChange, onRemove, exIdx }) {
  const vol = (parseFloat(set.reps) || 0) * (parseFloat(set.weight) || 0)
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 16, scale: 0.92 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      style={{
        display: 'grid',
        gridTemplateColumns: '28px 1fr 1fr auto auto',
        gap: 6,
        alignItems: 'center',
        padding: '5px 0',
      }}
    >
      <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-faint)', textAlign: 'center' }}>
        {idx + 1}
      </div>
      <input
        className="input"
        type="number" min="1" placeholder="Reps"
        value={set.reps}
        onChange={e => onSetChange(exIdx, idx, 'reps', e.target.value)}
        style={{ padding: '7px 10px', fontSize: '0.85rem' }}
      />
      <input
        className="input"
        type="number" min="0" step="0.5" placeholder="kg"
        value={set.weight}
        onChange={e => onSetChange(exIdx, idx, 'weight', e.target.value)}
        style={{ padding: '7px 10px', fontSize: '0.85rem' }}
      />
      <div style={{ fontSize: '0.65rem', color: 'var(--text-faint)', whiteSpace: 'nowrap', textAlign: 'right', minWidth: 36 }}>
        {vol > 0 ? `${Math.round(vol)}kg` : '—'}
      </div>
      <button
        onClick={() => onRemove(exIdx, idx)}
        style={{ background: 'none', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', fontSize: '1rem', padding: '0 2px', transition: 'color 0.15s' }}
        onMouseEnter={e => e.target.style.color = 'var(--red)'}
        onMouseLeave={e => e.target.style.color = 'var(--text-faint)'}
      >
        ×
      </button>
    </motion.div>
  )
}

// ─── Exercise block ───────────────────────────────────────────────
function ExerciseBlock({ exercise, exIdx, onNameChange, onSetChange, onAddSet, onRemoveSet, onRemove }) {
  const muscles = detectMuscleGroups(exercise.name)
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, filter: 'blur(4px)' }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      className="card"
      style={{ padding: '14px 16px', marginBottom: 12, borderLeft: '3px solid var(--orange)' }}
    >
      {/* Exercise name + remove */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        <div style={{ flex: 1 }}>
          <input
            className="input"
            placeholder="Exercise name (e.g. Bench Press)"
            value={exercise.name}
            onChange={e => onNameChange(exIdx, e.target.value)}
            style={{ fontSize: '0.9rem', fontWeight: 600 }}
          />
        </div>
        <button className="btn btn-danger btn-icon" onClick={() => onRemove(exIdx)}>✕</button>
      </div>

      {/* Detected muscle groups */}
      {muscles.length > 0 && (
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 8 }}>
          {muscles.map(m => (
            <span key={m.name} className="muscle-badge" style={{ color: m.color, borderColor: `${m.color}40`, background: m.bg, fontSize: '0.6rem' }}>
              {m.emoji} {m.name}
            </span>
          ))}
        </div>
      )}

      {/* Set headers */}
      {exercise.sets.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '28px 1fr 1fr auto auto',
          gap: 6,
          marginBottom: 2,
        }}>
          <div />
          <div style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-faint)', letterSpacing: '0.1em' }}>REPS</div>
          <div style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-faint)', letterSpacing: '0.1em' }}>WEIGHT</div>
          <div style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-faint)', letterSpacing: '0.1em', textAlign: 'right' }}>VOL</div>
          <div />
        </div>
      )}

      <AnimatePresence>
        {exercise.sets.map((s, si) => (
          <SetRow
            key={s._id} set={s} idx={si} exIdx={exIdx}
            onSetChange={onSetChange} onRemove={onRemoveSet}
          />
        ))}
      </AnimatePresence>

      <button
        onClick={() => onAddSet(exIdx)}
        style={{
          width: '100%', marginTop: 8,
          background: 'rgba(255,69,0,0.06)',
          border: '1px dashed rgba(255,69,0,0.3)',
          borderRadius: 6, color: 'var(--orange)',
          fontSize: '0.75rem', fontWeight: 700,
          letterSpacing: '0.08em', textTransform: 'uppercase',
          padding: '7px', cursor: 'pointer', transition: 'all 0.2s',
        }}
        onMouseEnter={e => { e.target.style.background = 'rgba(255,69,0,0.12)' }}
        onMouseLeave={e => { e.target.style.background = 'rgba(255,69,0,0.06)' }}
      >
        + Add Set
      </button>
    </motion.div>
  )
}

// ─── Completion screen ────────────────────────────────────────────
function CompletionScreen({ exercises, workoutName, onDone, onAnother }) {
  const volume    = calcVolume(exercises)
  const sets      = calcTotalSets(exercises)
  const reps      = calcTotalReps(exercises)
  const kcal      = estimateCalories(volume)
  const intensity = getIntensity(volume)
  const quote     = COACH_QUOTES[Math.floor(Math.random() * COACH_QUOTES.length)]

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '60px 40px',
    }}>
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 14 }}
        style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'rgba(255,69,0,0.12)',
          border: '2px solid rgba(255,69,0,0.35)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 20, color: 'var(--orange)',
        }}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(2.5rem, 8vw, 5rem)',
          letterSpacing: '0.04em',
          lineHeight: 0.95,
          marginBottom: 4,
        }}>
          WORKOUT<br />
          <span style={{ color: 'var(--orange)' }}>COMPLETE!</span>
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', letterSpacing: '0.04em', color: 'var(--text-dim)', marginBottom: 28 }}>
          {workoutName.toUpperCase()}
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 12,
          maxWidth: 560,
          margin: '0 auto 28px',
        }}>
          {[
            { val: `${Math.round(volume)}kg`, label: 'Volume' },
            { val: sets,  label: 'Sets' },
            { val: reps,  label: 'Reps' },
            { val: kcal,  label: 'Kcal ~' },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.35 + i * 0.08, type: 'spring', stiffness: 280, damping: 20 }}
              className="card"
              style={{ padding: '14px 8px' }}
            >
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', letterSpacing: '0.04em', color: 'var(--orange)', lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-faint)', letterSpacing: '0.1em', marginTop: 4 }}>{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Intensity */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.7, type: 'spring', stiffness: 240 }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: `${intensity.color}18`,
            border: `1px solid ${intensity.color}50`,
            borderRadius: 999,
            padding: '8px 20px',
            marginBottom: 28,
            fontWeight: 700,
            letterSpacing: '0.08em',
            color: intensity.color,
            fontSize: '0.9rem',
          }}
        >
          {intensity.emoji} {intensity.label.toUpperCase()} INTENSITY
        </motion.div>

        <div style={{ fontStyle: 'italic', color: 'var(--text-dim)', fontSize: '0.88rem', maxWidth: 400, margin: '0 auto 32px', lineHeight: 1.65 }}>
          "{quote}"
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-primary btn-lg" onClick={onDone}>
            View Dashboard
          </button>
          <button className="btn btn-secondary btn-lg" onClick={onAnother}>
            Log Another
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────
export default function CreateWorkout() {
  const { userId, navigate, showToast } = useApp()
  const [workoutName, setWorkoutName] = useState('')
  const [exercises,   setExercises]   = useState([newExercise()])
  const [error,       setError]       = useState('')
  const [submitting,  setSubmitting]  = useState(false)
  const [done,        setDone]        = useState(false)
  const [confetti,    setConfetti]    = useState(false)
  const [savedExercises, setSavedExercises] = useState([])

  const addExercise  = () => setExercises(es => [...es, newExercise()])
  const removeExercise = (i) => setExercises(es => es.length > 1 ? es.filter((_, idx) => idx !== i) : es)
  const addSet       = (ei) => setExercises(es => es.map((e, i) => i === ei ? { ...e, sets: [...e.sets, newSet()] } : e))
  const removeSet    = (ei, si) => setExercises(es => es.map((e, i) => i === ei ? { ...e, sets: e.sets.length > 1 ? e.sets.filter((_, s) => s !== si) : e.sets } : e))
  const changeName   = (ei, v) => setExercises(es => es.map((e, i) => i === ei ? { ...e, name: v } : e))
  const changeSet    = (ei, si, field, v) => setExercises(es => es.map((e, i) => i === ei ? { ...e, sets: e.sets.map((s, j) => j === si ? { ...s, [field]: v } : s) } : e))

  const handleSubmit = async () => {
    setError('')
    if (!workoutName.trim())         { setError('Give your workout a name!'); return }
    if (!userId)                     { setError('You must be logged in. Go to the Dashboard first.'); return }
    const valid = exercises.every(ex =>
      ex.name.trim() && ex.sets.length > 0 &&
      ex.sets.every(s => parseFloat(s.reps) > 0 && parseFloat(s.weight) >= 0)
    )
    if (!valid) { setError('All exercises need a name and valid sets (reps > 0, weight ≥ 0).'); return }

    setSubmitting(true)
    try {
      await workoutApi.create({
        user_id: userId,
        name: workoutName.trim(),
        exercises: exercises.map(ex => ({
          name: ex.name.trim(),
          sets: ex.sets.map(s => ({ reps: parseInt(s.reps), weight: parseFloat(s.weight) })),
        })),
      })
      setSavedExercises(exercises)
      setConfetti(true)
      setTimeout(() => setDone(true), 600)
    } catch (err) {
      setError('Failed to save: ' + err.message)
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setWorkoutName(''); setExercises([newExercise()])
    setDone(false); setSubmitting(false); setError('')
    setConfetti(false); setSavedExercises([])
  }

  if (done) {
    return (
      <>
        <Confetti active={confetti} count={120} />
        <CompletionScreen
          exercises={savedExercises}
          workoutName={workoutName}
          onDone={() => navigate('dashboard')}
          onAnother={resetForm}
        />
      </>
    )
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1100, margin: '0 auto' }}>
      <Confetti active={confetti} count={120} />

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: '2.8rem',
          letterSpacing: '0.04em',
          lineHeight: 1,
          marginBottom: 4,
        }}>
          LOG A <span style={{ color: 'var(--orange)' }}>WORKOUT</span>
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
          {userId ? 'Build your session, watch the stats update live.' : '⚠ You need to log in first — go to the Dashboard.'}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24, alignItems: 'start' }}>
        {/* Left: form */}
        <div>
          {/* Workout name */}
          <div style={{ marginBottom: 20 }}>
            <label className="field-label">Workout Name</label>
            <input
              className="input"
              value={workoutName}
              onChange={e => setWorkoutName(e.target.value)}
              placeholder="e.g. Chest Day, Upper Body Destruction..."
              style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 10 }}
            />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {PRESETS.map(p => (
                <button
                  key={p}
                  onClick={() => setWorkoutName(p)}
                  style={{
                    background: workoutName === p ? 'var(--orange)' : 'var(--surface)',
                    border: `1px solid ${workoutName === p ? 'var(--orange)' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: 6,
                    color: workoutName === p ? '#fff' : 'var(--text-dim)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    padding: '5px 12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Exercises */}
          <div className="section-label" style={{ marginBottom: 12 }}>Exercises</div>

          <AnimatePresence>
            {exercises.map((ex, i) => (
              <ExerciseBlock
                key={ex._id}
                exercise={ex}
                exIdx={i}
                onNameChange={changeName}
                onSetChange={changeSet}
                onAddSet={addSet}
                onRemoveSet={removeSet}
                onRemove={removeExercise}
              />
            ))}
          </AnimatePresence>

          <button
            onClick={addExercise}
            className="btn btn-secondary"
            style={{ width: '100%', padding: '12px', marginBottom: 20, fontSize: '0.85rem' }}
          >
            + Add Exercise
          </button>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  padding: '10px 16px',
                  background: 'var(--red-dim)',
                  border: '1px solid rgba(255,45,85,0.3)',
                  borderRadius: 8,
                  color: 'var(--red)',
                  fontSize: '0.82rem',
                  marginBottom: 16,
                }}
              >
                ⚠ {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit */}
          <motion.button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={submitting || !userId}
            whileHover={!submitting && userId ? { scale: 1.02 } : {}}
            whileTap={!submitting && userId ? { scale: 0.97 } : {}}
            style={{ width: '100%', padding: '16px', fontSize: '1rem' }}
          >
            {submitting ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
                <div className="spinner" />
                Saving your gains...
              </span>
            ) : (
              'Save Workout'
            )}
          </motion.button>
        </div>

        {/* Right: live stats */}
        <LiveStats exercises={exercises} />
      </div>
    </div>
  )
}

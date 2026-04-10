/* ================================================================
   FITNESS UTILITY FUNCTIONS
   ================================================================ */

// ─── Muscle group detection ───────────────────────────────────────
const MUSCLE_MAP = [
  { name: 'Chest',     emoji: '🫀', color: '#FF4500', bg: 'rgba(255,69,0,0.12)',    keywords: ['bench','chest','fly','flye','push up','pushup','pec','dip','cable cross'] },
  { name: 'Back',      emoji: '🦾', color: '#0A84FF', bg: 'rgba(10,132,255,0.12)',  keywords: ['row','pull','lat','deadlift','back','chin','pulldown','t-bar','shrug'] },
  { name: 'Legs',      emoji: '🦵', color: '#10D48E', bg: 'rgba(16,212,142,0.12)',  keywords: ['squat','leg','quad','hamstring','lunge','calf','glute','hip thrust','rdl','leg press','leg curl','leg extension'] },
  { name: 'Shoulders', emoji: '⚡', color: '#FFB800', bg: 'rgba(255,184,0,0.12)',   keywords: ['shoulder','overhead','lateral raise','front raise','rear delt','arnold','military press','ohp'] },
  { name: 'Biceps',    emoji: '💪', color: '#BF5AF2', bg: 'rgba(191,90,242,0.12)',  keywords: ['curl','bicep','hammer','preacher','concentration'] },
  { name: 'Triceps',   emoji: '🔱', color: '#FF9F0A', bg: 'rgba(255,159,10,0.12)', keywords: ['tricep','extension','pushdown','skull','close grip','overhead tri','dip'] },
  { name: 'Core',      emoji: '🔥', color: '#FF2D55', bg: 'rgba(255,45,85,0.12)',  keywords: ['core','ab','plank','crunch','sit up','situp','cable twist','russian','leg raise','hollow'] },
  { name: 'Cardio',    emoji: '🏃', color: '#34C759', bg: 'rgba(52,199,89,0.12)',  keywords: ['run','cardio','bike','swim','jump','burpee','box jump','sprint','treadmill','elliptical'] },
]

export function detectMuscleGroups(name) {
  if (!name?.trim()) return []
  const lower = name.toLowerCase()
  return MUSCLE_MAP.filter(m => m.keywords.some(kw => lower.includes(kw)))
}

export const MUSCLE_MAP_ALL = MUSCLE_MAP

// ─── Volume calculation ───────────────────────────────────────────
export function calcVolume(exercises) {
  return exercises.reduce((total, ex) =>
    total + (ex.sets || []).reduce((s, set) =>
      s + (parseFloat(set.reps) || 0) * (parseFloat(set.weight) || 0), 0), 0)
}

export function calcTotalReps(exercises) {
  return exercises.reduce((t, ex) =>
    t + (ex.sets || []).reduce((s, set) => s + (parseInt(set.reps) || 0), 0), 0)
}

export function calcTotalSets(exercises) {
  return exercises.reduce((t, ex) => t + (ex.sets?.length || 0), 0)
}

// Rough estimate: 1 kg·rep ≈ 0.045 kcal (very hand-wavy but fun)
export function estimateCalories(volume) {
  return Math.round(volume * 0.045 + 80)
}

// ─── Intensity rating ─────────────────────────────────────────────
export function getIntensity(volume) {
  if (volume < 500)  return { label: 'Warm Up',       pct: 15,  color: '#34C759', emoji: '🌱' }
  if (volume < 1500) return { label: 'Light',         pct: 35,  color: '#10D48E', emoji: '💧' }
  if (volume < 3000) return { label: 'Moderate',      pct: 55,  color: '#FFB800', emoji: '⚡' }
  if (volume < 5000) return { label: 'Intense',       pct: 75,  color: '#FF6B35', emoji: '🔥' }
  if (volume < 8000) return { label: 'Extreme',       pct: 90,  color: '#FF4500', emoji: '💥' }
  return                    { label: 'GODLIKE',        pct: 100, color: '#FF2D55', emoji: '☠️' }
}

// ─── Level system ─────────────────────────────────────────────────
const LEVELS = [
  { min: 0,   label: 'Fresh Meat',      tier: 1 },
  { min: 3,   label: 'Getting Started', tier: 2 },
  { min: 7,   label: 'Committed',       tier: 3 },
  { min: 15,  label: 'Dedicated',       tier: 4 },
  { min: 25,  label: 'Warrior',         tier: 5 },
  { min: 40,  label: 'Beast',           tier: 6 },
  { min: 60,  label: 'Legend',          tier: 7 },
  { min: 90,  label: 'Elite',           tier: 8 },
  { min: 130, label: 'Absolute Unit',   tier: 9 },
]

export function getLevel(workoutCount) {
  let level = LEVELS[0]
  for (const l of LEVELS) {
    if (workoutCount >= l.min) level = l
    else break
  }
  return level
}

// ─── Most hit muscle group ─────────────────────────────────────────
export function topMuscleGroup(workouts) {
  const counts = {}
  for (const w of workouts) {
    for (const ex of w.exercises || []) {
      for (const m of detectMuscleGroups(ex.name)) {
        counts[m.name] = (counts[m.name] || 0) + 1
      }
    }
  }
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]
  return top ? MUSCLE_MAP.find(m => m.name === top[0]) : null
}

// ─── Coach quotes ─────────────────────────────────────────────────
export const COACH_QUOTES = [
  "The only bad workout is the one that didn't happen.",
  "Your future self is watching you right now through memories. Make them proud.",
  "Pain is temporary. Quitting lasts forever.",
  "Every rep is a vote for the person you want to become.",
  "You don't get the body you wish for. You get the body you work for.",
  "When your legs give out, run with your heart.",
  "Strength doesn't come from what you can do. It comes from overcoming what you thought you couldn't.",
  "One more set. Always one more set.",
  "The weight doesn't know how tired you are.",
  "Excuses are for people who don't want it bad enough.",
  "Fall down seven times, get up eight. Then do a set of eight.",
  "Your only competition is who you were yesterday.",
]

// ─── Format weight nicely ─────────────────────────────────────────
export function fmtWeight(kg) {
  if (kg >= 1000) return `${(kg / 1000).toFixed(1)}T`
  return `${Math.round(kg)}`
}

// ─── Streak calculation ───────────────────────────────────────────
export function calcStreak(workouts) {
  if (!workouts.length) return 0
  const dates = [...new Set(
    workouts.map(w => new Date(w.created_at).toDateString())
  )].map(d => new Date(d)).sort((a, b) => b - a)

  let streak = 1
  for (let i = 0; i < dates.length - 1; i++) {
    const diff = (dates[i] - dates[i + 1]) / (1000 * 60 * 60 * 24)
    if (diff <= 1.5) streak++
    else break
  }
  return streak
}

/* ================================================
   FITTRACK API CLIENT
   user-service  → localhost:8080/api/users
   workout-service → localhost:8081/api/workouts
   ================================================ */

const USER_BASE    = '/api/users'
const WORKOUT_BASE = '/api/workouts'

async function request(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `HTTP ${res.status}`)
  }
  // 204 No Content
  if (res.status === 204) return null
  return res.json()
}

/* ─── USER SERVICE ─── */

export const userApi = {
  create: (name, email) =>
    request(USER_BASE, { method: 'POST', body: JSON.stringify({ id: crypto.randomUUID(), name, email }) }),

  get: (id) => request(`${USER_BASE}/${id}`),

  update: (id, name) =>
    request(`${USER_BASE}/${id}`, { method: 'PUT', body: JSON.stringify({ name }) }),

  delete: (id) =>
    request(`${USER_BASE}/${id}`, { method: 'DELETE' }),
}

/* ─── WORKOUT SERVICE ─── */

export const workoutApi = {
  create: (payload) =>
    request(WORKOUT_BASE, { method: 'POST', body: JSON.stringify(payload) }),

  get: (id) => request(`${WORKOUT_BASE}/${id}`),

  getByUser: (userId) => request(`${WORKOUT_BASE}/user/${userId}`),

  delete: (id) =>
    request(`${WORKOUT_BASE}/${id}`, { method: 'DELETE' }),
}

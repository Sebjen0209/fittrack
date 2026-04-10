import { useState, useCallback, createContext, useContext } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Sidebar from './components/Sidebar'
import SplashScreen from './components/SplashScreen'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import CreateWorkout from './pages/CreateWorkout'
import Profile from './pages/Profile'
import Toast from './components/Toast'

export const AppCtx = createContext(null)
export const useApp = () => useContext(AppCtx)

const PAGE_VARIANTS = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
  exit:    { opacity: 0, y: -12, transition: { duration: 0.22 } },
}

const PAGES = { home: Home, dashboard: Dashboard, create: CreateWorkout, profile: Profile }

export default function App() {
  const [page,       setPage]       = useState('home')
  const [splashDone, setSplashDone] = useState(false)
  const [userId,     setUserIdRaw]  = useState(() => localStorage.getItem('ft_uid') || null)
  const [userName,   setUserNameRaw]= useState(() => localStorage.getItem('ft_name') || null)
  const [toast,      setToast]      = useState(null)

  const setUserId = useCallback((id, name) => {
    setUserIdRaw(id)
    if (name) setUserNameRaw(name)
    if (id)   localStorage.setItem('ft_uid', id)
    else      localStorage.removeItem('ft_uid')
    if (name) localStorage.setItem('ft_name', name)
  }, [])

  const navigate = useCallback((dest) => setPage(dest), [])

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type, id: Date.now() })
  }, [])

  const CurrentPage = PAGES[page] || Home

  return (
    <AppCtx.Provider value={{ page, navigate, userId, userName, setUserId, showToast }}>
      <AnimatePresence>
        {!splashDone && (
          <SplashScreen key="splash" onComplete={() => setSplashDone(true)} />
        )}
      </AnimatePresence>

      {splashDone && (
        <div className="app-shell">
          <Sidebar />
          <div className="page-content">
            <AnimatePresence mode="wait">
              <motion.div
                key={page}
                variants={PAGE_VARIANTS}
                initial="initial"
                animate="animate"
                exit="exit"
                style={{ minHeight: '100vh', paddingBottom: 60 }}
              >
                <CurrentPage />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      )}

      <AnimatePresence>
        {toast && (
          <Toast key={toast.id} msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />
        )}
      </AnimatePresence>
    </AppCtx.Provider>
  )
}

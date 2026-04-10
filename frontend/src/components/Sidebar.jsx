import { motion } from 'framer-motion'
import { useApp } from '../App'

const HomeIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
)
const ChartIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/>
    <line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6"  y1="20" x2="6"  y2="14"/>
  </svg>
)
const PlusIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5"  y1="12" x2="19" y2="12"/>
  </svg>
)
const UserIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
)

const NAV = [
  { key: 'home',      Icon: HomeIcon,  label: 'Home'    },
  { key: 'dashboard', Icon: ChartIcon, label: 'Gains'   },
  { key: 'create',    Icon: PlusIcon,  label: 'Log'     },
  { key: 'profile',   Icon: UserIcon,  label: 'Profile' },
]

export default function Sidebar() {
  const { page, navigate } = useApp()

  return (
    <div className="sidebar">
      {/* Logo mark */}
      <div
        onClick={() => navigate('home')}
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1rem',
          letterSpacing: '0.06em',
          color: 'var(--orange)',
          cursor: 'pointer',
          marginBottom: 16,
          lineHeight: 1,
          userSelect: 'none',
        }}
      >
        FT
      </div>

      <div style={{ width: 28, height: 1, background: 'rgba(255,255,255,0.08)', marginBottom: 8 }} />

      {NAV.map(({ key, Icon, label }) => (
        <motion.button
          key={key}
          onClick={() => navigate(key)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.93 }}
          className={`nav-item ${page === key ? 'active' : ''}`}
          title={label}
        >
          <Icon />
          <span className="nav-label">{label}</span>
          {page === key && <span className="nav-active-bar" />}
        </motion.button>
      ))}
    </div>
  )
}

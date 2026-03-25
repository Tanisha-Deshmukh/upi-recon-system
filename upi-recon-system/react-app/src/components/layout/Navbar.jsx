import { useState, useMemo, useRef, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Bell, Search, ChevronDown, Monitor, Moon, Sun, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../../context/ThemeContext'

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/payments': 'Payments',
  '/notifications': 'Notifications',
  '/reports': 'Reports & Analytics',
  '/banks': 'Bank Connections',
  '/settings': 'Settings',
}

const THEME_OPTIONS = [
  {
    id: 'default',
    label: 'Default',
    desc: 'System default (light)',
    Icon: Monitor,
    preview: 'bg-gradient-to-br from-slate-100 to-white border border-slate-300',
  },
  {
    id: 'dark',
    label: 'Dark',
    desc: 'Dark navy & light blue',
    Icon: Moon,
    preview: 'bg-gradient-to-br from-[#0f172a] to-[#1e293b] border border-[#1e3a5f]',
  },
  {
    id: 'light',
    label: 'Light',
    desc: 'Clean bright white',
    Icon: Sun,
    preview: 'bg-gradient-to-br from-white to-blue-50 border border-blue-100',
  },
]

export default function Navbar() {
  const location = useLocation()
  const [showNotif, setShowNotif] = useState(false)
  const [showTheme, setShowTheme] = useState(false)
  const title = pageTitles[location.pathname] || 'Dashboard'
  const themeRef = useRef(null)

  const { theme, setTheme } = useTheme()

  // ── Read real user name from localStorage ──
  const user = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('user')) || {} } catch { return {} }
  }, [])
  const fullName = user.fullName || 'User'
  const initials = fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('')

  // Close theme dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (themeRef.current && !themeRef.current.contains(e.target)) {
        setShowTheme(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const activeThemeOption = THEME_OPTIONS.find(t => t.id === theme) || THEME_OPTIONS[0]

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
      {/* Search */}
      <div className="flex items-center flex-1 max-w-xl">
        <div className="relative w-full">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search transactions, customers..."
            className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-custom text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-slate-50 transition-all"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotif(!showNotif)}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
          </button>
          <AnimatePresence>
            {showNotif && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-custom shadow-lg z-50 overflow-hidden"
                onClick={e => e.stopPropagation()}
              >
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <span className="font-semibold text-sm">Notifications</span>
                  <button
                    className="text-xs text-primary font-medium hover:underline"
                    onClick={() => setShowNotif(false)}
                  >
                    Clear all
                  </button>
                </div>
                <ul className="divide-y divide-slate-50">
                  {[
                    { color: 'bg-green-100 text-green-600', text: 'Reconciliation #TRX-9482 matched successfully.', time: 'Just now' },
                    { color: 'bg-amber-100 text-amber-600', text: 'HSBC sync is 85% complete.', time: '5m ago' },
                    { color: 'bg-red-100 text-red-600', text: 'Mismatch of $120 in Stripe batch #944.', time: '12m ago' },
                  ].map((n, i) => (
                    <li key={i} className="flex gap-3 px-4 py-3 hover:bg-slate-50 transition-colors">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${n.color}`}>!</span>
                      <div>
                        <p className="text-xs text-slate-700">{n.text}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{n.time}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Theme Switcher ── */}
        <div className="relative" ref={themeRef}>
          <button
            onClick={() => setShowTheme(prev => !prev)}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
            title="Change Theme"
          >
            <activeThemeOption.Icon className="w-5 h-5" />
          </button>

          <AnimatePresence>
            {showTheme && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ duration: 0.18 }}
                className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-custom shadow-xl z-50 overflow-hidden"
              >
                {/* Header */}
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Choose Theme</p>
                </div>

                {/* Options */}
                <ul className="p-2 space-y-1">
                  {THEME_OPTIONS.map(({ id, label, desc, Icon, preview }) => {
                    const isActive = theme === id
                    return (
                      <li key={id}>
                        <button
                          onClick={() => { setTheme(id); setShowTheme(false) }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left ${
                            isActive
                              ? 'bg-primary/10 text-primary'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          {/* Colour swatch */}
                          <div className={`w-8 h-8 rounded-lg flex-shrink-0 ${preview}`} />

                          {/* Labels */}
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-semibold leading-none mb-0.5 ${isActive ? 'text-primary' : 'text-slate-800'}`}>
                              {label}
                            </p>
                            <p className="text-[11px] text-slate-400 truncate">{desc}</p>
                          </div>

                          {/* Active tick */}
                          {isActive && <Check className="w-4 h-4 text-primary flex-shrink-0" />}
                        </button>
                      </li>
                    )
                  })}
                </ul>

                {/* Footer */}
                <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50">
                  <p className="text-[10px] text-slate-400 text-center">
                    Current: <span className="font-semibold text-slate-500 capitalize">{activeThemeOption.label}</span>
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="h-8 w-px bg-slate-200" />

        {/* User Info */}
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-800">{fullName}</p>
            <p className="text-xs text-slate-500">Finance Manager</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-primary-light flex items-center justify-center text-primary font-bold text-sm ring-2 ring-slate-100 flex-shrink-0">
            {initials}
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
        </div>
      </div>
    </header>
  )
}

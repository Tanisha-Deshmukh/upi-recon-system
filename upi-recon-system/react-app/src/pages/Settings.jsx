import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { User, Bell, ShieldCheck, Code2, Plus, Trash2, Eye, EyeOff } from 'lucide-react'

const settingsNav = [
  { id: 'profile',       label: 'Profile',           Icon: User },
  { id: 'notifications', label: 'Notifications',     Icon: Bell },
  { id: 'security',      label: 'Security',          Icon: ShieldCheck },
  { id: 'api',           label: 'API & Integration', Icon: Code2 },
]

function Toggle({ checked, onChange }) {
  return (
    <label className="toggle">
      <input type="checkbox" checked={checked} onChange={onChange} />
      <div className="toggle-track" />
      <div className="toggle-thumb absolute top-[2px] left-[2px]" style={{ transform: checked ? 'translateX(20px)' : 'translateX(0)' }} />
    </label>
  )
}

export default function Settings() {
  const [activeSection, setActiveSection] = useState('profile')
  const [showPassword, setShowPassword] = useState(false)

  // ── Read real user from localStorage ──
  const userData = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('user')) || {} } catch { return {} }
  }, [])
  const fullName = userData.fullName || 'User'
  const userEmail = userData.email || ''
  const initials = fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('')

  const [notifPrefs, setNotifPrefs] = useState({
    mismatch: true,
    digest: false,
    system: true,
  })

  const togglePref = (key) => setNotifPrefs((p) => ({ ...p, [key]: !p[key] }))

  const integrations = [
    { short: 'ST', name: 'Stripe Connector',     connected: 'Dec 12, 2023', bg: 'bg-indigo-100 text-indigo-700' },
    { short: 'QB', name: 'QuickBooks Integration', connected: 'Nov 28, 2023', bg: 'bg-orange-100 text-orange-700' },
  ]

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Settings Sidebar */}
        <aside className="w-full md:w-56 flex-shrink-0">
          <nav className="flex flex-col gap-1">
            {settingsNav.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-custom transition-colors text-left ${
                  activeSection === id
                    ? 'bg-primary-light text-primary border-r-2 border-primary'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Settings Content */}
        <div className="flex-1 space-y-8">
          {/* === Profile === */}
          {activeSection === 'profile' && (
            <motion.section
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="card overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100">
                <h2 className="text-lg font-semibold text-slate-900">Profile Settings</h2>
                <p className="text-sm text-slate-500 mt-0.5">Manage your public information and account details.</p>
              </div>
              <div className="p-6 space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold border-2 border-slate-200 flex-shrink-0">
                    {initials}
                  </div>
                  <div className="flex gap-2">
                    <button className="btn-primary text-sm">Change Avatar</button>
                    <button className="btn-secondary text-sm">Remove</button>
                  </div>
                </div>

                {/* Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                    <input type="text" defaultValue={fullName} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                    <input type="email" defaultValue={userEmail} className="input-field" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                    <input type="text" value="Lead Financial Controller" disabled className="input-field bg-slate-50 text-slate-400 cursor-not-allowed italic" readOnly />
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 bg-slate-50 flex justify-end border-t border-slate-100">
                <button className="btn-primary">Save Profile</button>
              </div>
            </motion.section>
          )}

          {/* === Notifications === */}
          {activeSection === 'notifications' && (
            <motion.section
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="card overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100">
                <h2 className="text-lg font-semibold text-slate-900">Notification Preferences</h2>
                <p className="text-sm text-slate-500 mt-0.5">Control how and when you receive reconciliation alerts.</p>
              </div>
              <div className="p-6 space-y-4">
                {[
                  { key: 'mismatch', title: 'Reconciliation Mismatch Alerts',   desc: 'Immediate notification when a discrepancy is detected.' },
                  { key: 'digest',   title: 'Daily Reconciliation Digest',       desc: 'A summary of all activities sent at 9:00 AM UTC.' },
                  { key: 'system',   title: 'System Performance Updates',        desc: 'Occasional updates about new features and improvements.' },
                ].map(({ key, title, desc }) => (
                  <div key={key} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                    </div>
                    <Toggle checked={notifPrefs[key]} onChange={() => togglePref(key)} />
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          {/* === Security === */}
          {activeSection === 'security' && (
            <motion.section
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="card overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100">
                <h2 className="text-lg font-semibold text-slate-900">Security</h2>
                <p className="text-sm text-slate-500 mt-0.5">Keep your account secure with MFA and password management.</p>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">Change Password</h3>
                  <div className="space-y-3 max-w-md">
                    <input type="password" placeholder="Current Password" className="input-field" />
                    <div className="relative">
                      <input type={showPassword ? 'text' : 'password'} placeholder="New Password" className="input-field pr-10" />
                      <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <button className="btn-secondary text-sm">Update Password</button>
                  </div>
                </div>

                <hr className="border-slate-100" />

                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-800">Two-Factor Authentication (MFA)</p>
                    <p className="text-xs text-slate-500 max-w-sm mt-1">Add an extra layer of security using an authenticator app or SMS.</p>
                  </div>
                  <button className="px-4 py-2 bg-primary/10 text-primary text-sm font-semibold rounded-custom hover:bg-primary/20 transition-colors flex-shrink-0">
                    Setup MFA
                  </button>
                </div>
              </div>
            </motion.section>
          )}

          {/* === API & Integration === */}
          {activeSection === 'api' && (
            <motion.section
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="card overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">API Connection</h2>
                  <p className="text-sm text-slate-500 mt-0.5">Connect your payment gateways and accounting software.</p>
                </div>
                <button className="btn-primary flex items-center gap-2 text-sm">
                  <Plus className="w-4 h-4" />
                  Generate API Key
                </button>
              </div>
              <div className="p-6 space-y-4">
                {integrations.map((int) => (
                  <div key={int.short} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-custom hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-custom flex items-center justify-center font-bold text-sm flex-shrink-0 ${int.bg}`}>
                        {int.short}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{int.name}</p>
                        <p className="text-xs text-slate-500">Connected: {int.connected}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="badge-active">Active</span>
                      <button className="text-slate-400 hover:text-red-500 transition-colors p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>
          )}
        </div>
      </div>
    </div>
  )
}

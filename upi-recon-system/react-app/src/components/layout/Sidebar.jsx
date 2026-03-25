import { NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  FileText,
  Bell,
  BarChart3,
  ArrowLeftRight,
  Settings,
  DollarSign,
  Zap,
  LogOut,
} from 'lucide-react'

const navItems = [
  { to: '/dashboard',  label: 'Dashboard',        Icon: LayoutDashboard },
  { to: '/payments',   label: 'Statements',        Icon: FileText },
  { to: '/notifications', label: 'Notifications', Icon: Bell },
  { to: '/reports',    label: 'Reports',           Icon: BarChart3 },
  { to: '/banks',      label: 'Bank Connections',  Icon: ArrowLeftRight },
  { to: '/fastpay',    label: 'FastPay',           Icon: Zap },
  { to: '/settings',   label: 'Settings',          Icon: Settings },
]

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200 fixed h-full z-20 flex flex-col shadow-sm">
      {/* Logo */}
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center gap-2.5 text-primary font-bold text-xl">
          <div className="w-8 h-8 bg-primary rounded-custom flex items-center justify-center flex-shrink-0">
            <DollarSign className="w-5 h-5 text-white" />
          </div>
          <span>ReconPay</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              isActive ? 'sidebar-link-active' : 'sidebar-link'
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-primary' : 'text-slate-500'}`}
                />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto">

        {/* Logout Button */}
        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-custom transition-colors"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </aside>
  )
}

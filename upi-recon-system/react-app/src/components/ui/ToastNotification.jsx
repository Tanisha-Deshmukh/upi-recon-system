import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react'

const icons = {
  success: { Icon: CheckCircle, cls: 'text-green-500' },
  warning: { Icon: AlertTriangle, cls: 'text-amber-500' },
  error:   { Icon: XCircle,       cls: 'text-red-500'   },
  info:    { Icon: Info,           cls: 'text-blue-500'  },
}

export default function ToastNotification({ notifications, onDismiss }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full">
      <AnimatePresence>
        {notifications.map((n) => {
          const { Icon, cls } = icons[n.type] || icons.info
          return (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: 40, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className="bg-white border border-slate-200 rounded-custom shadow-lg p-4 flex items-start gap-3"
            >
              <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${cls}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900">{n.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
              </div>
              <button
                onClick={() => onDismiss(n.id)}
                className="text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

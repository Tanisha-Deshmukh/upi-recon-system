import { motion } from 'framer-motion'

export default function StatCard({ icon: Icon, iconBg, iconColor, label, value, badge, badgeColor, trend = null }) {
  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="glass-card p-6 relative overflow-hidden group border border-white/40 shadow-xl"
    >
      {/* glowing background effect */}
      <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br from-white/30 to-transparent blur-2xl pointer-events-none group-hover:scale-150 group-hover:bg-white/40 transition-all duration-700 ease-out" />
      <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-primary/5 blur-2xl pointer-events-none" />

      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className={`p-3 rounded-2xl ${iconBg} shadow-inner backdrop-blur-md border border-white/50 group-hover:shadow-lg transition-all duration-300`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        {badge && (
          <div className={`px-3 py-1.5 rounded-full text-xs font-bold tracking-wide shadow-sm border border-white/30 backdrop-blur-md ${badgeColor}`}>
            {badge}
          </div>
        )}
      </div>
      
      <div className="relative z-10 mt-6">
        <p className="text-slate-500 text-sm font-semibold tracking-wide uppercase mb-1">{label}</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-3xl font-extrabold bg-gradient-to-br from-slate-900 to-slate-600 bg-clip-text text-transparent drop-shadow-sm">
            {value}
          </h3>
          {trend && (
            <span className={`text-sm font-bold ${trend > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

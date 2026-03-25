const statusStyles = {
  Matched:   'badge-matched',
  Pending:   'badge-pending',
  Failed:    'badge-failed',
  'Failed (Glass)': 'badge-failed-glass',
  Active:    'badge-active',
  Connected: 'badge-matched',
  Syncing:   'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800',
  High:   'text-rose-500 font-semibold',
  Medium: 'text-amber-500 font-semibold',
  Low:    'text-slate-500 font-semibold',
}

export default function StatusBadge({ status }) {
  const cls = statusStyles[status] || 'badge-pending'
  return <span className={cls}>{status}</span>
}

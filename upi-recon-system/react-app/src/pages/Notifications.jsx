import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { DollarSign, ClipboardList, AlertTriangle, CheckCircle, ExternalLink, RefreshCw } from 'lucide-react'
import axios from 'axios'

export default function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('All Activity')
  const [pushStatus, setPushStatus] = useState('idle'); // idle, loading, error, success
  const [pushErrorMsg, setPushErrorMsg] = useState('');

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const apiUrl = import.meta.env.VITE_RECON_API_URL || 'http://localhost:8001/api/v1'
      const res = await axios.get(`${apiUrl}/users/payments/history`, {
        withCredentials: true
      })

      if (res.data?.success) {
        const rawTxns = res.data.data;
        
        // Transform transactions into Notification items
        const items = rawTxns.map(txn => {
          const isReconciled = txn.status === 'SUCCESS';
          const senderName = txn.senderId?.fullName || 'a sender';
          
          return {
            id: txn._id,
            icon: isReconciled ? CheckCircle : AlertTriangle,
            iconBg: isReconciled ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600',
            title: isReconciled ? 'Payment Reconciled ✅' : 'Payment Status: ' + txn.status,
            message: isReconciled 
              ? `Success! ₹${txn.amount} from ${senderName} was recovered and credited via Bank UTR: ${txn.utr}.`
              : `Transaction of ₹${txn.amount} with ${senderName} is currently ${txn.status.toLowerCase()}.`,
            time: new Date(txn.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            date: new Date(txn.createdAt).toLocaleDateString([], { day: 'numeric', month: 'short' }),
            isRead: true,
            category: isReconciled ? 'Reconciliations' : 'Payments',
            utr: txn.utr
          }
        });

        // Group by Date (Today, Yesterday, etc)
        const groups = [];
        const today = new Date().toLocaleDateString();
        
        const todayItems = items.filter(i => i.date === new Date().toLocaleDateString([], { day: 'numeric', month: 'short' }));
        if (todayItems.length > 0) groups.push({ label: 'Today', items: todayItems });

        const olderItems = items.filter(i => i.date !== new Date().toLocaleDateString([], { day: 'numeric', month: 'short' }));
        if (olderItems.length > 0) groups.push({ label: 'Previous Activity', items: olderItems });

        setNotifications(groups);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchNotifications();
  }, []);

  const filterCategories = ['All Activity', 'Payments', 'Reconciliations']
  
  const filteredGroups = notifications.map((g) => ({
    ...g,
    items: g.items.filter((i) => activeCategory === 'All Activity' || i.category === activeCategory),
  })).filter((g) => g.items.length > 0)

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
          <p className="text-slate-500 text-sm mt-1">Real-time alerts from the PaySync Reconciliation Engine.</p>
        </div>
        <div className="flex items-center gap-4">
          {!window.pushSubscription && (
            <div className="flex flex-col items-end gap-2">
              <button 
                onClick={async () => {
                  setPushStatus('loading');
                  setPushErrorMsg('');
                  
                  // Early check before even triggering
                  if (Notification.permission === 'denied') {
                    setPushStatus('error');
                    setPushErrorMsg('Notifications are blocked. Please click the lock icon in your browser URL bar to allow them.');
                    return;
                  }

                  const result = await window.triggerPushSubscription?.();
                  
                  if (result === 'denied') {
                    setPushStatus('error');
                    setPushErrorMsg('Permission denied. Please allow notifications in your browser settings (URL bar).');
                    return;
                  } else if (result && result.endpoint) {
                    try {
                      const RECON_API = (import.meta.env.VITE_RECON_API_URL || 'http://localhost:8001/api/v1');
                      await axios.post(`${RECON_API}/users/subscribe-push`, { subscription: result }, { withCredentials: true });
                      setPushStatus('success');
                      setTimeout(() => window.location.reload(), 1500);
                    } catch (e) {
                       setPushStatus('error');
                       setPushErrorMsg('Failed to sync subscription to server.');
                       console.error("Sync failed:", e);
                    }
                  } else {
                     setPushStatus('error');
                     setPushErrorMsg('Failed to enable push notifications. Check console.');
                  }
                }}
                disabled={pushStatus === 'loading' || pushStatus === 'success'}
                className="text-xs flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-full font-semibold hover:bg-primary-hover transition-all shadow-sm disabled:opacity-50"
              >
                {pushStatus === 'loading' ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : pushStatus === 'success' ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                )}
                <span className="hidden sm:inline">
                  {pushStatus === 'loading' ? 'Enabling...' : pushStatus === 'success' ? 'Enabled!' : 'Enable Notifications'}
                </span>
                <span className="sm:hidden">Enable</span>
              </button>
              
              {pushStatus === 'error' && (
                <div className="text-xs text-red-500 max-w-[250px] text-right font-medium animate-pulse">
                  {pushErrorMsg}
                </div>
              )}
            </div>
          )}
          <button 
            onClick={fetchNotifications}
            className="p-2 text-slate-500 bg-white border border-slate-200 rounded-full hover:text-primary hover:border-primary transition-colors flex-shrink-0"
            title="Refresh"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {filterCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all ${
              activeCategory === cat
                ? 'bg-primary text-white shadow-md'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Notification Groups */}
      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading your alerts...</div>
        ) : filteredGroups.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-custom border border-dashed border-slate-200 text-slate-400">
            No recent notifications found.
          </div>
        ) : filteredGroups.map((group) => (
          <div key={group.label}>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">{group.label}</h3>
            <div className="space-y-3">
              {group.items.map((item, idx) => {
                const Icon = item.icon
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white border border-slate-200 rounded-custom p-4 flex items-start gap-4 hover:border-primary/30 transition-all shadow-sm group"
                  >
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${item.iconBg}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-bold text-slate-900">{item.title}</p>
                        <span className="text-xs text-slate-400 whitespace-nowrap flex-shrink-0">{item.time}</span>
                      </div>
                      <p className="text-sm text-slate-600 mt-1 leading-relaxed">{item.message}</p>
                      
                      {item.utr && (
                        <div className="mt-3 flex items-center gap-2 text-[10px] font-mono bg-slate-50 px-2 py-1 rounded inline-block text-slate-500 uppercase">
                          Ref: {item.utr}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

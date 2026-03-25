import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { DollarSign, Clock, CheckCircle, AlertTriangle, Download, RefreshCw, ArrowUpRight, ArrowDownLeft } from 'lucide-react'
import StatCard from '../components/ui/StatCard'
import StatusBadge from '../components/ui/StatusBadge'
import ToastNotification from '../components/ui/ToastNotification'
import axios from 'axios'

export default function Dashboard() {
  const [toasts, setToasts] = useState([])
  const [activityFeed, setActivityFeed] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  
  // keeping stats here
  const [stats, setStats] = useState({
    totalAmount: 0,
    pendingCount: 0,
    successCount: 0,
    failedCount: 0
  })

  // using a ref so we can actually tell when the cron fixes a txn
  const prevTxnsRef = useRef([])

  useEffect(() => {
    const RECON_API = (import.meta.env.VITE_RECON_API_URL || 'http://localhost:8001/api/v1')
        
    const fetchHistory = async () => {
      try {
        const res = await axios.get(`${RECON_API}/users/payments/history`, {
          withCredentials: true
        })
        
        if (res.data?.success) {
          const rawTxns = res.data.data;

          // 1. Calculate Real-Time Dashboard Stats
          const newStats = {
            totalAmount: rawTxns.filter(t => t.status === 'SUCCESS').reduce((acc, curr) => acc + curr.amount, 0),
            pendingCount: rawTxns.filter(t => t.status === 'PENDING').length,
            successCount: rawTxns.filter(t => t.status === 'SUCCESS').length,
            failedCount: rawTxns.filter(t => t.status === 'FAILED').length,
          }
          setStats(newStats);

          // 2. Format for the Table
          const currentUser = JSON.parse(localStorage.getItem('user'));
          const formatted = [...rawTxns].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(txn => {
            const isIncoming = txn.receiverId?.email === currentUser?.email;
            const name = isIncoming ? (txn.senderId?.fullName || 'Sender') : (txn.receiverId?.fullName || 'Receiver');
            const initials = name.substring(0, 2).toUpperCase();
            
            let displayStatus = txn.status === 'SUCCESS' ? 'Matched' : txn.status === 'PENDING' ? 'Pending' : 'Failed';
            if (txn.status === 'FAILED') displayStatus = 'Failed (Glass)';

            return {
              id: txn.utr || txn._id.slice(-8).toUpperCase(),
              rawId: txn._id,
              customer: name,
              initials,
              amount: txn.amount,
              isIncoming,
              bankRef: txn.senderAccount || 'N/A',
              status: displayStatus,
              time: new Date(txn.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          })
          setTransactions(formatted);

          // 3. checking if the background worker matched anything
          const prevTxns = prevTxnsRef.current;
          if (prevTxns.length > 0) {
            rawTxns.forEach(newTxn => {
              const oldTxn = prevTxns.find(pt => pt._id === newTxn._id);
              
              // if the cron job fixed it while we were looking
        if (oldTxn && oldTxn.status === 'PENDING' && newTxn.status === 'SUCCESS') {
          const displayId = newTxn.utr || newTxn._id.slice(-6).toUpperCase();
          
          // Fire a Toast Notification
          setToasts(prev => [...prev, {
            id: Date.now(),
            type: 'success',
            title: 'Reconciliation Engine Match',
            message: `Payment ${displayId} (₹${newTxn.amount}) was successfully synced with the bank!`
          }]);

          // Push to Activity Feed
          setActivityFeed(prev => [{
            type: 'success', 
            icon: CheckCircle, 
            bg: 'bg-green-100 text-green-600', 
            title: 'Auto-Reconciliation Successful',  
            detail: `Recovered and matched transaction ${displayId} via Bank API verification.`, 
            time: 'Just now' 
          }, ...prev].slice(0, 10)); // Keep only the latest 10
        }
            });
          }

          // Update the ref for the next cycle
          prevTxnsRef.current = rawTxns;
        }
      } catch (error) {
        console.error('Error fetching transactions:', error)
      } finally {
        setLoading(false)
      }
    }

    // Initial Fetch
    fetchHistory()

    // Set up our "Live Polling" every 5 seconds to watch for Cron Job updates
    const intervalId = setInterval(fetchHistory, 5000);

    return () => clearInterval(intervalId);
  }, [])

  // push notifications setup
  useEffect(() => {
    const syncPushSubscription = async () => {
      try {
        // Wait up to 5 seconds for App.jsx to attach triggerPushSubscription
        let attempts = 0;
        while (!window.triggerPushSubscription && attempts < 10) {
          await new Promise(res => setTimeout(res, 500));
          attempts++;
        }

        if (window.triggerPushSubscription) {
          const sub = await window.triggerPushSubscription();
          if (sub) {
            const apiUrl = import.meta.env.VITE_RECON_API_URL || 'http://localhost:8001/api/v1';
            await axios.post(`${apiUrl}/users/subscribe-push`, {
              subscription: sub
            }, {
              withCredentials: true
            });
            console.log('✅ [Bridge] Push subscription synced with backend successfully.');
          }
        }
      } catch (error) {
        console.error('Failed to sync push subscription:', error);
      }
    };

    syncPushSubscription();
  }, []);

  const dismissToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id))
  const clearFeed = () => setActivityFeed([])

  return (
    <div className="space-y-8 pb-12">
      
      {/* hero section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-gradient-to-r from-slate-900 to-slate-800 p-8 rounded-3xl text-white shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 blur-3xl rounded-full -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10">
          <p className="text-slate-300 text-sm font-medium tracking-wider uppercase mb-1">Overview</p>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Dashboard
          </h1>
          <p className="text-slate-400 mt-2 max-w-md">
            Monitor real-time transaction reconciliation, engine health, and active payment volumes.
          </p>
        </div>
        <div className="relative z-10 flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <span className="text-sm font-semibold tracking-wide">Live Sync Active</span>
        </div>
      </motion.div>

      {/* top stats row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={DollarSign}    iconBg="bg-blue-500/10"   iconColor="text-blue-500"  label="Total Payments" value={`₹${stats.totalAmount.toLocaleString('en-IN')}`} badge="Live" badgeColor="bg-emerald-500/10 text-emerald-500" />
        <StatCard icon={Clock}         iconBg="bg-amber-500/10"  iconColor="text-amber-500" label="Pending Recon" value={stats.pendingCount} />
        <StatCard icon={CheckCircle}   iconBg="bg-emerald-500/10"  iconColor="text-emerald-500" label="Success Matches"  value={stats.successCount} trend={12} />
        <StatCard icon={AlertTriangle} iconBg="bg-rose-500/10"    iconColor="text-rose-500"   label="Failed Txns"  value={stats.failedCount} trend={-2} />
      </div>

      {/* ── Main Bento Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Ledger (Spans 2 cols on lg screens) */}
        <section className="lg:col-span-2 glass-card flex flex-col min-h-[500px]">
          <div className="p-6 border-b border-white/20 flex items-center justify-between pb-4">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Live Payment Ledger</h2>
            
            {/* Push Notification Action in Ledger Header */}
            {!window.pushSubscription ? (
              <button 
                onClick={async () => {
                  const sub = await window.triggerPushSubscription?.();
                  if (sub) {
                    try {
                      const apiUrl = (import.meta.env.VITE_RECON_API_URL || 'http://localhost:8001/api/v1');
                      await axios.post(`${apiUrl}/users/subscribe-push`, { subscription: sub }, { withCredentials: true });
                      window.location.reload(); 
                    } catch (e) {
                       console.error("Sync failed:", e);
                    }
                  }
                }}
                className="text-xs flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-full font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                <AlertTriangle className="w-4 h-4" />
                Enable Alerts
              </button>
            ) : (
              <div className="text-xs flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full font-bold border border-emerald-200 shadow-sm">
                <CheckCircle className="w-4 h-4" />
                Alerts Active
              </div>
            )}
          </div>

          <div className="overflow-x-auto flex-1 p-2">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-200/50">
                  {['ID / Ref', 'Customer', 'Amount', 'Status', 'Time'].map((h, i) => (
                    <th key={h} className={`px-4 py-4 font-semibold ${i === 4 ? 'text-right' : ''}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/50 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500 font-medium flex flex-col items-center justify-center">
                      <RefreshCw className="w-6 h-6 animate-spin mb-2 text-primary" />
                      Syncing Matrix...
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500 font-medium">No transactions found.</td>
                  </tr>
                ) : (
                  transactions.slice(0, 8).map((t, idx) => (
                    <motion.tr
                      key={t.id + idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="hover:bg-white/40 transition-colors group"
                    >
                      <td className="px-4 py-4">
                        <div className="font-mono text-slate-700 text-xs font-semibold">{t.id}</div>
                        <div className="font-mono text-slate-400 text-[10px] truncate max-w-[120px]">{t.bankRef}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-sm font-bold shadow-md group-hover:scale-110 transition-transform">
                            {t.initials}
                          </div>
                          <span className="font-bold text-slate-800">{t.customer}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className={`flex items-center gap-1.5 font-extrabold ${t.isIncoming ? 'text-emerald-600' : 'text-slate-700'}`}>
                          {t.isIncoming ? '+' : ''}₹{t.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </div>
                      </td>
                      <td className="px-4 py-4"><StatusBadge status={t.status} /></td>
                      <td className="px-4 py-4 text-right text-slate-500 font-medium text-xs">{t.time}</td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Right Column: Engine Activity (Spans 1 col) */}
        <section className="col-span-1 lg:col-span-1 glass-card flex flex-col min-h-[500px]">
          <div className="p-6 border-b border-white/20 bg-gradient-to-br from-slate-900 to-slate-800 rounded-t-custom">
            <h2 className="text-sm font-extrabold text-white tracking-widest uppercase flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin-slow text-emerald-400" />
              Engine Log
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide bg-white/5">
            {activityFeed.map((item, idx) => {
              const Icon = item.icon
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white/60 backdrop-blur-md border border-white/50 p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-3">
                    <div className={`mt-0.5 w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${item.bg}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{item.title}</p>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.detail}</p>
                      <p className="text-[10px] font-bold text-slate-400 mt-2 tracking-wider uppercase">{item.time}</p>
                    </div>
                  </div>
                </motion.div>
              )
            })}
            
            {activityFeed.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-60 mt-12">
                <div className="w-16 h-16 rounded-full border-4 border-dashed border-slate-300 animate-spin-slow flex items-center justify-center mb-4">
                  <div className="w-8 h-8 rounded-full bg-slate-200" />
                </div>
                <p className="text-sm font-bold text-slate-600 tracking-wide uppercase">Monitoring</p>
                <p className="text-xs text-slate-400 mt-1 max-w-[180px]">Standing by for active reconciliation events...</p>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-white/20 bg-white/10 backdrop-blur-md">
            <button
              onClick={clearFeed}
              disabled={activityFeed.length === 0}
              className="w-full py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-extrabold uppercase tracking-wide rounded-xl shadow-sm hover:bg-slate-50 focus:ring-4 focus:ring-slate-100 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              Clear Log
            </button>
          </div>
        </section>
      </div>

      <ToastNotification notifications={toasts} onDismiss={dismissToast} />
    </div>
  )
}
import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { FileDown, CalendarClock, TrendingUp, Percent, CreditCard, Users, Loader2 } from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ReferenceLine
} from 'recharts'
import StatCard from '../components/ui/StatCard'
import axios from 'axios'

const PIE_COLORS = ['#3b82f6', '#ef4444', '#f59e0b']

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-custom px-3 py-2 shadow-lg text-xs">
        <p className="font-semibold text-slate-700">{label}</p>
        <p className="text-primary mt-0.5">₹{payload[0].value.toLocaleString('en-IN')}</p>
      </div>
    )
  }
  return null
}

export default function Reports() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [dateFilter, setDateFilter] = useState('7D') // 'TODAY', '7D', 'MONTH', 'ALL'

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const UPI_API = import.meta.env.VITE_UPI_API_URL || 'http://localhost:8000/api/v1'
        const res = await axios.get(`${UPI_API}/payments/history`, {
          withCredentials: true
        })
        if (res.data?.success) {
          setTransactions(res.data.data)
        }
      } catch (error) {
        console.error('Error fetching transactions:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchHistory()
  }, [])

  // Derived metrics
  const stats = useMemo(() => {
    let filteredTxns = transactions

    // Apply strict Date Filter
    if (dateFilter !== 'ALL') {
      const now = new Date()
      const cutoff = new Date()
      if (dateFilter === 'TODAY') cutoff.setHours(0, 0, 0, 0)
      else if (dateFilter === '7D') cutoff.setDate(now.getDate() - 7)
      else if (dateFilter === 'MONTH') cutoff.setMonth(now.getMonth() - 1)
      
      filteredTxns = transactions.filter(t => new Date(t.createdAt) >= cutoff)
    }

    let totalRevenue = 0
    let successCount = 0
    let pendingCount = 0
    let failedCount = 0

    const dayVolumes = {}
    const dateRevenues = {}
    const usersSet = new Set()
    
    // Anomaly tracking structures
    const merchantFailures = {}
    const topSendersMap = {}
    const topReceiversMap = {}

    filteredTxns.forEach(txn => {
      // Metric totals
      if (txn.status === 'SUCCESS') {
        totalRevenue += txn.amount
        successCount++
      } else if (txn.status === 'FAILED') {
        failedCount++
      } else {
        pendingCount++
      }
      
      // Active users tracking
      const senderKey = txn.senderId?._id || txn.senderId || 'Unknown'
      const receiverKey = txn.receiverId?._id || txn.receiverId || 'Unknown'

      if (senderKey !== 'Unknown') usersSet.add(senderKey)
      if (receiverKey !== 'Unknown') usersSet.add(receiverKey)

      // Top Senders / Receivers volume tracking (Success only)
      if (txn.status === 'SUCCESS') {
        topSendersMap[senderKey] = (topSendersMap[senderKey] || 0) + txn.amount
        topReceiversMap[receiverKey] = (topReceiversMap[receiverKey] || 0) + txn.amount
      }

      // Anomaly detection: track failures by receiver (simulating merchant)
      if (txn.status === 'FAILED') {
        merchantFailures[receiverKey] = (merchantFailures[receiverKey] || 0) + 1
      }

      // Chart aggregations
      const dateObj = new Date(txn.createdAt)
      const dateStr = dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
      const dayStr = dateObj.toLocaleDateString('en-GB', { weekday: 'short' })
      
      if (!dayVolumes[dayStr]) dayVolumes[dayStr] = 0
      dayVolumes[dayStr] += 1
      
      if (!dateRevenues[dateStr]) dateRevenues[dateStr] = 0
      if (txn.status === 'SUCCESS') {
        dateRevenues[dateStr] += txn.amount
      }
    })

    const totalTxns = filteredTxns.length || 1 // prevent divide by 0
    const successRate = ((successCount / totalTxns) * 100).toFixed(1)
    const avgTxn = successCount > 0 ? (totalRevenue / successCount).toFixed(2) : 0

    // Prepare arrays for Recharts
    const lineData = Object.keys(dateRevenues).map(date => ({ date, revenue: dateRevenues[date] }))
    
    // Add Predictive Forecast to lineChart (Mock simple moving avg for next 3 data points)
    if (lineData.length > 2) {
      const last3 = lineData.slice(-3).map(d => d.revenue)
      const avg = last3.reduce((a, b) => a + b, 0) / last3.length
      lineData.push({ date: 'Forecast 1', revenue: null, forecast: avg * 1.05 })
      lineData.push({ date: 'Forecast 2', revenue: null, forecast: avg * 1.1 })
      lineData.push({ date: 'Forecast 3', revenue: null, forecast: avg * 1.08 })
      
      // bridge the gap from last real data point
      lineData[lineData.length - 4].forecast = lineData[lineData.length - 4].revenue
    }

    const barData = Object.keys(dayVolumes).map(day => ({ day, transactions: dayVolumes[day] }))
    
    const pieData = [
      { name: 'Matched', value: successCount },
      { name: 'Failed', value: failedCount },
      { name: 'Pending', value: pendingCount }
    ]

    // Calculate real dynamic anomalies
    const anomalies = []
    Object.keys(merchantFailures).forEach(merchant => {
      const fails = merchantFailures[merchant]
      if (fails >= 3) {
        anomalies.push({
          merchant: `ID: ${merchant.slice(-6)}`,
          issue: `High Failure Rate (${fails} failed txns)`,
          impact: fails > 5 ? 'High' : 'Medium',
          impactColor: fails > 5 ? 'text-red-500' : 'text-amber-500'
        })
      }
    })

    // Calculate Top Entities
    const topEntities = {
       senders: Object.entries(topSendersMap).sort((a,b) => b[1] - a[1]).slice(0, 3),
       receivers: Object.entries(topReceiversMap).sort((a,b) => b[1] - a[1]).slice(0, 3)
    }

    return { totalRevenue, successRate, avgTxn, activeUsers: usersSet.size, lineData, barData, pieData, anomalies, successCount, topEntities }
  }, [transactions, dateFilter])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
          <p className="text-slate-500 font-medium">Computing analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Analytics Overview</h1>
          <p className="text-slate-500 text-sm mt-1">Track your payment performance and transaction trends.</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary flex items-center gap-2">
            <FileDown className="w-4 h-4" />
            Export PDF
          </button>
          <button className="btn-primary flex items-center gap-2">
            <CalendarClock className="w-4 h-4" />
            Schedule Report
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={TrendingUp} iconBg="bg-blue-50" iconColor="text-blue-600" label="Total Revenue" value={`₹${stats.totalRevenue.toLocaleString('en-IN')}`} badge="Live aggregated data" badgeColor="text-emerald-600 text-xs font-medium" />
        <StatCard icon={Percent} iconBg="bg-green-50" iconColor="text-green-600" label="Success Rate" value={`${stats.successRate}%`} badge={`${stats.successCount} matches confirmed`} badgeColor="text-emerald-600 text-xs font-medium" />
        <StatCard icon={CreditCard} iconBg="bg-violet-50" iconColor="text-violet-600" label="Avg Transaction" value={`₹${stats.avgTxn}`} />
        <StatCard icon={Users} iconBg="bg-amber-50" iconColor="text-amber-600" label="Active Actors" value={stats.activeUsers} badge="Senders & Receivers" badgeColor="text-slate-500 text-xs" />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Line Chart */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h4 className="text-lg font-semibold text-slate-900">Revenue & Forecast</h4>
            <div className="flex items-center bg-slate-100 rounded-md p-1">
              {['TODAY', '7D', 'MONTH', 'ALL'].map(filter => (
                <button 
                  key={filter}
                  onClick={() => setDateFilter(filter)} 
                  className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${dateFilter === filter ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
          {stats.lineData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={stats.lineData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="revenue" stroke="#24adbf" strokeWidth={3} dot={{ fill: '#24adbf', r: 4 }} activeDot={{ r: 6 }} name="Actual" />
                <Line type="monotone" dataKey="forecast" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Forecast" />
                <Legend iconType="plainline" wrapperStyle={{ fontSize: '12px' }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-slate-400 text-sm">No trend data available</div>
          )}
        </motion.section>

        {/* Bar Chart */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-semibold text-slate-900">Daily Volume</h4>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="w-2 h-2 bg-blue-500 rounded-full" />
              Transactions
            </div>
          </div>
          {stats.barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stats.barData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
                <Bar dataKey="transactions" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
             <div className="h-[280px] flex items-center justify-center text-slate-400 text-sm">No volume data available</div>
          )}
        </motion.section>

        {/* Pie Chart */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-6"
        >
          <h4 className="text-lg font-semibold text-slate-900 mb-6">Success vs Failed Payments</h4>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={stats.pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {stats.pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.section>

        {/* Anomalies Table */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-semibold text-slate-900">Algorithmic Anomalies</h4>
            <span className="text-xs font-semibold bg-red-100 text-red-600 px-2 py-1 rounded-full">Scanned Live</span>
          </div>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-slate-400 border-b border-slate-100">
                <th className="pb-3 font-medium">Entity/Origin</th>
                <th className="pb-3 font-medium">Issue Detected</th>
                <th className="pb-3 font-medium text-right">Impact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {stats.anomalies.length > 0 ? stats.anomalies.map((a, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 font-medium text-slate-800">{a.merchant}</td>
                  <td className="py-4 text-slate-600">{a.issue}</td>
                  <td className={`py-4 text-right font-semibold ${a.impactColor}`}>{a.impact}</td>
                </tr>
              )) : (
                 <tr>
                  <td colSpan="3" className="py-8 text-center text-emerald-500 font-medium text-sm bg-emerald-50/50 rounded-lg mt-4">
                    ✓ No algorithmic anomalies detected in current range.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </motion.section>

        {/* Top Entities Section */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card p-6 md:col-span-2 lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          <div>
            <h4 className="text-lg font-semibold text-slate-900 mb-4 border-b pb-2">Top Volume Senders</h4>
            <ul className="space-y-4">
              {stats.topEntities.senders.length > 0 ? stats.topEntities.senders.map(([id, vol], idx) => (
                <li key={id} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">User ID: {id.slice(-6)}</span>
                  <span className="text-sm font-bold text-green-600">₹{vol.toLocaleString('en-IN')}</span>
                </li>
              )) : <li className="text-sm text-slate-400">No sufficient data.</li>}
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-slate-900 mb-4 border-b pb-2">Top Volume Receivers</h4>
            <ul className="space-y-4">
              {stats.topEntities.receivers.length > 0 ? stats.topEntities.receivers.map(([id, vol], idx) => (
                <li key={id} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">User/Merchant: {id.slice(-6)}</span>
                  <span className="text-sm font-bold text-blue-600">₹{vol.toLocaleString('en-IN')}</span>
                </li>
              )) : <li className="text-sm text-slate-400">No sufficient data.</li>}
            </ul>
          </div>
        </motion.section>
      </div>
    </div>
  )
}

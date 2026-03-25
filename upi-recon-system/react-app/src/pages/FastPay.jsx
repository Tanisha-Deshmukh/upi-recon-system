import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send, ArrowDownLeft, ArrowUpRight, ArrowLeftRight,
  User, CreditCard, Clock, Smartphone, CheckCircle,
  Loader2, LogOut, X, ChevronRight, ScanLine,
  TrendingUp, Bell, Settings, Plus, Copy, Check,
  Wallet, Building2, RefreshCw, AlertCircle, Info
} from 'lucide-react'
import axios from 'axios'

const UPI_API = (import.meta.env.VITE_UPI_API_URL || 'http://localhost:8000/api/v1')
const RECON_API = (import.meta.env.VITE_RECON_API_URL || 'http://localhost:8001/api/v1')

// helpers
const getAuthConfig = (isFpActive) => {
  const fpToken  = localStorage.getItem('fastPayToken')
  const mainToken = localStorage.getItem('token') ||
                    JSON.parse(localStorage.getItem('user') || '{}')?.token
  const token = (isFpActive && fpToken) ? fpToken : mainToken
  return {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    withCredentials: true
  }
}

const fmt = (n) =>
  `₹${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

// send money component
function SendMoney({ contacts, onBack, onSuccess }) {
  const [step, setStep]       = useState('form') // 'form' | 'confirm' | 'success'
  const [upiId, setUpiId]     = useState('')
  const [amount, setAmount]   = useState('')
  const [note, setNote]       = useState('')
  const [pin, setPin]         = useState('')
  const [requestId, setRequestId] = useState(() => crypto.randomUUID())
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [result, setResult]   = useState(null)
  const quickAmounts = [100, 200, 500, 1000, 2000, 5000]

  const handleSend = async () => {
    setLoading(true); setError('')
    try {
      const fpToken = localStorage.getItem('fastPayToken')
      const res = await axios.post(`${UPI_API}/payments/send`, {
        amount: Number(amount), 
        receiverUpi: upiId, 
        note,
        fastpayPin: pin,
        requestId
      }, {
        headers: { ...(fpToken && { Authorization: `Bearer ${fpToken}` }) },
        withCredentials: true
      })
      if (res.data.success) {
        setResult(res.data.data)
        setStep('success')
        setRequestId(crypto.randomUUID())
        setTimeout(() => { onSuccess(); onBack() }, 3000)
      }
    } catch (err) {
      if (err.response?.status === 503) {
        setResult({ pending: true })
        setStep('success')
        setTimeout(() => { onSuccess(); onBack() }, 3500)
      } else {
        setError(err.response?.data?.message || 'Payment failed. Please try again.')
      }
    } finally { setLoading(false) }
  }

  if (step === 'success') {
    const isPending = result?.pending
    return (
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center justify-center min-h-[400px] space-y-6 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}
          className={`w-28 h-28 rounded-full flex items-center justify-center ${isPending ? 'bg-amber-100' : 'bg-green-100'}`}>
          {isPending
            ? <Clock className="w-14 h-14 text-amber-500" />
            : <CheckCircle className="w-14 h-14 text-green-500" />}
        </motion.div>
        <div>
          <h2 className={`text-2xl font-black ${isPending ? 'text-amber-700' : 'text-green-700'}`}>
            {isPending ? 'Payment Queued' : 'Payment Successful!'}
          </h2>
          {!isPending && result?.amount && (
            <p className="text-4xl font-black text-slate-900 mt-1">{fmt(result.amount)}</p>
          )}
          <p className="text-slate-500 mt-2 text-sm">
            {isPending
              ? 'Bank is busy. Your payment will be auto-processed shortly.'
              : `Sent to ${result?.receiver || upiId}`}
          </p>
          {result?.utr && (
            <p className="text-xs text-slate-400 font-mono mt-1">UTR: {result.utr}</p>
          )}
        </div>
        <p className="text-xs text-slate-400 animate-pulse">Redirecting in 3 seconds...</p>
      </motion.div>
    )
  }

  if (step === 'confirm') {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-3 py-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
            <span className="text-xl font-black text-blue-700">{upiId[0]?.toUpperCase()}</span>
          </div>
          <div>
            <p className="font-bold text-slate-900 text-lg">{upiId}</p>
            <p className="text-4xl font-black text-slate-900 mt-3">{fmt(amount)}</p>
            {note && <p className="text-slate-500 text-sm mt-1">"{note}"</p>}
          </div>
        </div>

        <div>
          <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Enter 6-Digit PIN</label>
          <input type="password" value={pin} onChange={e => setPin(e.target.value.replace(/\D/g,'').slice(0,6))}
            placeholder="••••••"
            className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-2xl font-black text-center tracking-[0.5em] focus:ring-2 focus:ring-blue-500 transition-all" />
        </div>
        {error && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm flex gap-2 items-start">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />{error}
          </div>
        )}
        <div className="flex gap-3">
          <button onClick={() => { setStep('form'); setError('') }}
            className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-colors">
            Edit
          </button>
          <button onClick={handleSend} disabled={loading || pin.length !== 6}
            className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-black hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {loading ? 'Processing...' : `Pay ${fmt(amount)}`}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Quick Contacts */}
      {contacts.length > 0 && (
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Recent Contacts</p>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {contacts.slice(0, 6).map((c, i) => (
              <button key={i} onClick={() => setUpiId(c.upiId)}
                className={`flex flex-col items-center gap-1.5 flex-shrink-0 transition-transform hover:scale-105 ${upiId === c.upiId ? 'opacity-100' : 'opacity-70 hover:opacity-100'}`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xs font-black text-white transition-all ${upiId === c.upiId ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
                  style={{ background: `hsl(${(i * 60) % 360}, 70%, 55%)` }}>
                  {c.fullName.substring(0, 2).toUpperCase()}
                </div>
                <p className="text-[10px] font-semibold text-slate-600 max-w-[52px] truncate">{c.fullName.split(' ')[0]}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* UPI ID Input */}
      <div>
        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Pay to UPI ID</label>
        <input type="text" value={upiId} onChange={e => setUpiId(e.target.value.toLowerCase())}
          placeholder="mobilenum@fastpay or name@bank"
          className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" />
      </div>

      {/* Amount */}
      <div>
        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Amount</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-400">₹</span>
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
            placeholder="0"
            className="w-full pl-10 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-2xl font-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" />
        </div>
        {/* Quick amounts */}
        <div className="flex gap-2 mt-2 flex-wrap">
          {quickAmounts.map(qa => (
            <button key={qa} onClick={() => setAmount(String(qa))}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${amount == qa ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              ₹{qa}
            </button>
          ))}
        </div>
      </div>

      {/* Note */}
      <div>
        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Note (optional)</label>
        <input type="text" value={note} onChange={e => setNote(e.target.value)}
          placeholder="Add a message"
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 transition-all" />
      </div>

      <button onClick={() => { setError(''); setStep('confirm') }}
        disabled={!upiId || !amount || Number(amount) <= 0}
        className="w-full py-4 bg-blue-600 text-white rounded-xl font-black text-base hover:bg-blue-700 transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2">
        <ChevronRight className="w-5 h-5" />
        Proceed to Pay
      </button>
    </div>
  )
}

// internal transfer stuff
function TransferMoney({ accounts, contacts, onBack, onSuccess }) {
  const [fromAcc, setFromAcc]       = useState('')
  const [receiverUpi, setReceiverUpi] = useState('')
  const [amount, setAmount]   = useState('')
  const [requestId, setRequestId] = useState(() => crypto.randomUUID())
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [done, setDone]       = useState(false)
  const [result, setResult]   = useState(null)
  const quickAmounts = [100, 500, 1000, 2000]

  const handleTransfer = async () => {
    setLoading(true); setError('')
    try {
      const fpToken = localStorage.getItem('fastPayToken')
      const res = await axios.post(`${UPI_API}/payments/send`, {
        amount: Number(amount),
        receiverUpi,
        senderAccountNumber: fromAcc,
        note: `Transfer from ****${String(fromAcc).slice(-4)}`,
        requestId
      }, {
        headers: { ...(fpToken && { Authorization: `Bearer ${fpToken}` }) },
        withCredentials: true
      })
      if (res.data.success) {
        setResult(res.data.data)
        setDone(true)
        setRequestId(crypto.randomUUID())
        setTimeout(() => { onSuccess(); onBack() }, 2500)
      }
    } catch (err) {
      if (err.response?.status === 503) {
        setDone(true)
        setTimeout(() => { onSuccess(); onBack() }, 2500)
      } else {
        setError(err.response?.data?.message || 'Transfer failed.')
      }
    } finally { setLoading(false) }
  }

  if (done) return (
    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
      className="flex flex-col items-center justify-center min-h-[300px] space-y-4 text-center">
      <div className="w-24 h-24 bg-violet-100 rounded-full flex items-center justify-center">
        <CheckCircle className="w-12 h-12 text-violet-600" />
      </div>
      <h2 className="text-xl font-black text-violet-700">Transfer Complete!</h2>
      <p className="text-4xl font-black text-slate-900">{fmt(amount)}</p>
      {result?.receiver && <p className="text-slate-500 text-sm">✓ Sent to {result.receiver}</p>}
    </motion.div>
  )

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">From Account</label>
        <select value={fromAcc} onChange={e => setFromAcc(e.target.value)}
          className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 appearance-none">
          <option value="">Select your account</option>
          {accounts.map(acc => (
            <option key={acc._id} value={acc.accountNumber}>
              {acc.bankName} — ****{String(acc.accountNumber).slice(-4)} ({fmt(acc.balance)})
            </option>
          ))}
        </select>
      </div>
      <div className="flex justify-center">
        <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center">
          <ArrowLeftRight className="w-4 h-4 text-violet-600" />
        </div>
      </div>
      {/* Receiver UPI ID */}
      <div>
        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">To (Receiver's UPI ID)</label>
        {contacts && contacts.length > 0 && (
          <div className="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-hide">
            {contacts.slice(0, 5).map((c, i) => (
              <button key={i} onClick={() => setReceiverUpi(c.upiId)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  receiverUpi === c.upiId
                    ? 'bg-violet-600 text-white border-violet-600'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-violet-300'
                }`}>
                {c.fullName.split(' ')[0]}
              </button>
            ))}
          </div>
        )}
        <div className="relative">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" value={receiverUpi}
            onChange={e => setReceiverUpi(e.target.value.toLowerCase())}
            placeholder="receiver@fastpay"
            className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-violet-500 transition-all" />
        </div>
      </div>
      {/* Amount */}
      <div>
        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Amount</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-400">₹</span>
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0"
            className="w-full pl-10 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-2xl font-black focus:ring-2 focus:ring-violet-500 transition-all" />
        </div>
        <div className="flex gap-2 mt-2 flex-wrap">
          {quickAmounts.map(qa => (
            <button key={qa} onClick={() => setAmount(String(qa))}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${amount == qa ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              ₹{qa}
            </button>
          ))}
        </div>
      </div>
      {error && (
        <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm flex gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />{error}
        </div>
      )}
      <button onClick={handleTransfer} disabled={!fromAcc || !receiverUpi || !amount || loading}
        className="w-full py-4 font-black text-white rounded-xl transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
        style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)' }}>
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowLeftRight className="w-5 h-5" />}
        {loading ? 'Processing...' : `Transfer ${fmt(amount)}`}
      </button>
    </div>
  )
}

// link bank component
function LinkBank({ onBack, onSuccess }) {
  const [bankName, setBankName] = useState('HDFC Bank')
  const [accNum, setAccNum]     = useState('')
  const [ifsc, setIfsc]         = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [ok, setOk]             = useState(false)

  const handleLink = async () => {
    setLoading(true); setError('')
    try {
      const fpToken = localStorage.getItem('fastPayToken')
      const token = localStorage.getItem('token')
      const activeToken = fpToken || token
      const res = await axios.post(`${UPI_API}/users/link-bank`, {
        bankName, accountNumber: accNum, ifscCode: ifsc
      }, {
        headers: { ...(activeToken && { Authorization: `Bearer ${activeToken}` }) },
        withCredentials: true
      })
      if (res.data.success) {
        setOk(true)
        setTimeout(() => { onSuccess(); onBack() }, 1500)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to link account. Check your details.')
    } finally { setLoading(false) }
  }

  if (ok) return (
    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
      className="flex flex-col items-center justify-center min-h-[250px] space-y-4 text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
        <CheckCircle className="w-10 h-10 text-green-500" />
      </div>
      <h2 className="text-lg font-black text-green-700">Bank Linked!</h2>
    </motion.div>
  )

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Select Bank</label>
        <select value={bankName} onChange={e => setBankName(e.target.value)}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm appearance-none focus:ring-2 focus:ring-blue-500">
          {['HDFC Bank','State Bank of India (SBI)','ICICI Bank','Axis Bank','PNB'].map(b => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Account Number</label>
        <input type="text" value={accNum} onChange={e => setAccNum(e.target.value.replace(/\D/g,'').slice(0,18))}
          placeholder="e.g. 1234567890"
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-blue-500" />
      </div>
      <div>
        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">IFSC Code</label>
        <input type="text" value={ifsc} onChange={e => setIfsc(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,11))}
          placeholder="e.g. HDFC0001234"
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono uppercase focus:ring-2 focus:ring-blue-500" />
      </div>
      {error && (
        <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm flex gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />{error}
        </div>
      )}
      <button onClick={handleLink} disabled={loading || !accNum || ifsc.length !== 11}
        className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-black hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Building2 className="w-4 h-4" />}
        {loading ? 'Verifying with Bank...' : 'Link Account'}
      </button>
    </div>
  )
}

// history component
function History({ transactions, onRefresh, loading }) {
  if (loading) return (
    <div className="flex justify-center py-12">
      <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
    </div>
  )
  if (!transactions.length) return (
    <div className="text-center py-16 text-slate-400">
      <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
      <p className="font-semibold">No transactions yet</p>
      <p className="text-sm mt-1">Your payment history will appear here</p>
    </div>
  )
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-black text-slate-900">Transaction History</h3>
        <button onClick={onRefresh} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <RefreshCw className="w-4 h-4 text-slate-500" />
        </button>
      </div>
      <ul className="space-y-2">
        {transactions.slice(0, 20).map((tx, i) => (
          <motion.li key={tx.id || i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
            className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:shadow-sm transition-all">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.isPositive ? 'bg-green-100' : 'bg-red-50'}`}>
                {tx.isPositive
                  ? <ArrowDownLeft className="w-5 h-5 text-green-600" />
                  : <ArrowUpRight className="w-5 h-5 text-red-500" />}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">{tx.desc}</p>
                <p className="text-[11px] text-slate-400">{tx.date}</p>
              </div>
            </div>
            <p className={`font-black ${tx.isPositive ? 'text-green-600' : 'text-slate-800'}`}>{tx.amount}</p>
          </motion.li>
        ))}
      </ul>
    </div>
  )
}

// main layout
export default function FastPay() {
  const [user, setUser]       = useState({})
  const [fpActive, setFpActive] = useState(false)
  const [authMode, setAuthMode] = useState('login') // 'login' | 'signup'
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState('')

  // Signup fields
  const [suName, setSuName]   = useState('')
  const [suUpi, setSuUpi]     = useState('')
  const [suBank, setSuBank]   = useState('')
  const [suPin, setSuPin]     = useState('')

  // Login field
  const [liUpi, setLiUpi]     = useState('')
  const [liPin, setLiPin]     = useState('')

  // Data
  const [accounts, setAccounts]       = useState([])
  const [transactions, setTxns]       = useState([])
  const [contacts, setContacts]       = useState([])
  const [totalBalance, setBalance]    = useState(0)
  const [loading, setLoading]         = useState(true)
  const [dataLoading, setDataLoading] = useState(false)

  // Active screen: 'home' | 'send' | 'transfer' | 'history' | 'linkbank'
  const [screen, setScreen] = useState('home')

  // Copied indicator
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('user') || '{}')
    setUser(u)
    if (u.phone && !suUpi) setSuUpi(`${u.phone}@fastpay`)
    if (u.fullName && !suName) setSuName(u.fullName)
    if (sessionStorage.getItem('fastPaySessionActive') === 'true') setFpActive(true)
  }, [])

  useEffect(() => { fetchData() }, [fpActive])

  const fetchData = async () => {
    setDataLoading(true)
    const isFp = sessionStorage.getItem('fastPaySessionActive') === 'true'
    const cfg  = getAuthConfig(isFp)

    try {
      const accUrl = isFp ? `${UPI_API}/users/accounts` : `${RECON_API}/users/accounts`
      const accRes = await axios.get(accUrl, cfg).catch(() => ({ data: { data: [] } }))
      const accs = accRes.data?.data || accRes.data?.accounts || []
      setAccounts(accs)
      setBalance(accs.reduce((s, a) => s + (Number(a.balance) || 0), 0))

      if (isFp) {
        // History
        const txRes = await axios.get(`${UPI_API}/payments/history`, cfg).catch(() => ({ data: { data: [] } }))
        const u = JSON.parse(localStorage.getItem('user') || '{}')
        const txns = txRes.data?.data || []
        
        setTxns(txns.map(tx => {
          const isCredit = tx.receiverUpi === u.upiId;
          return {
            id: tx._id,
            desc: tx.note || (isCredit ? `Received from ${tx.senderId?.upiId || 'someone'}` : `Paid to ${tx.receiverUpi}`),
            date: new Date(tx.createdAt).toLocaleString('en-IN', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' }),
            amount: `${isCredit ? '+' : '-'}${fmt(tx.amount)}`,
            isPositive: isCredit
          }
        }))
        // Contacts
        const cRes = await axios.get(`${UPI_API}/users/contacts`, cfg).catch(() => ({ data: { data: [] } }))
        if (cRes.data?.success) {
          setContacts((cRes.data.data || []).filter(c => c._id !== uid))
        }
      }
    } catch (e) {
      console.error('FastPay fetch error:', e)
    } finally {
      setLoading(false)
      setDataLoading(false)
    }
  }

  const login = async () => {
    setAuthLoading(true); setAuthError('')
    try {
      const token = localStorage.getItem('token') || user?.token
      const res = await axios.post(`${UPI_API}/users/fastpay/login`, { upiId: liUpi, fastpayPin: liPin }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        withCredentials: true
      })
      if (res.data.success) {
        const d = res.data.data
        const updated = { ...user, upiId: d.upiId, fastpayName: d.fastpayName, fastpayAccount: d.fastpayAccount, _id: d._id || user._id }
        localStorage.setItem('user', JSON.stringify(updated))
        if (d.accessToken) localStorage.setItem('fastPayToken', d.accessToken)
        sessionStorage.setItem('fastPaySessionActive', 'true')
        setUser(updated)
        setFpActive(true)
      }
    } catch (err) {
      setAuthError(err.response?.data?.message || 'Invalid Credentials. Please check your UPI ID and PIN.')
    } finally { setAuthLoading(false) }
  }

  const signup = async () => {
    setAuthLoading(true); setAuthError('')
    try {
      const token = localStorage.getItem('token') || user?.token
      const selectedAcc = accounts.find(a => a._id === suBank || a.id === suBank)
      const res = await axios.post(`${UPI_API}/users/fastpay/signup`, {
        phone: user.phone || user.phoneNumber,
        fullName: user.fullName,
        email: user.email,
        upiId: suUpi,
        fastpayPin: suPin,
        fastpayName: suName,
        bankName: selectedAcc?.bankName,
        accountNumber: selectedAcc?.accountNumber,
        ifscCode: selectedAcc?.ifscCode || selectedAcc?.ifsc
      }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        withCredentials: true
      })
      if (res.data.success) {
        const d = res.data.data
        const updated = { ...user, upiId: d.upiId, fastpayName: d.fastpayName, fastpayAccount: d.fastpayAccount, _id: d._id || user._id }
        localStorage.setItem('user', JSON.stringify(updated))
        if (d.accessToken) localStorage.setItem('fastPayToken', d.accessToken)
        sessionStorage.setItem('fastPaySessionActive', 'true')
        setUser(updated)
        setFpActive(true)
      }
    } catch (err) {
      if (err.response?.status === 409) {
        setAuthError('Account already exists. Please Log In.')
        setTimeout(() => setAuthMode('login'), 1500)
      } else {
        setAuthError(err.response?.data?.message || 'Registration failed. Check details.')
      }
    } finally { setAuthLoading(false) }
  }

  const logout = () => {
    setFpActive(false)
    sessionStorage.removeItem('fastPaySessionActive')
    localStorage.removeItem('fastPayToken')
    setScreen('home')
  }

  const copyUpi = () => {
    navigator.clipboard.writeText(user.upiId || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ── Auth Gate ──────────────────────────────────────────────
  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
      <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      <p className="text-sm font-bold text-slate-400 animate-pulse uppercase tracking-widest">Loading FastPay...</p>
    </div>
  )

  if (!fpActive) return (
    <div className="max-w-md mx-auto">
      <div className="card overflow-hidden shadow-2xl border-0">
        {/* Header */}
        <div className="px-8 pt-10 pb-8 text-center relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg,#1e3b8a 0%,#3b5fc0 60%,#7c3aed 100%)' }}>
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
          <div className="absolute -bottom-8 -left-6 w-32 h-32 bg-white/5 rounded-full" />
          <div className="relative z-10">
            <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-3xl flex items-center justify-center mx-auto mb-4 border border-white/30">
              <Smartphone className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-black text-white">FastPay UPI</h1>
            <p className="text-blue-200 text-sm mt-1">Secure · Instant · Trusted</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100">
          <button onClick={() => { setAuthMode('login'); setAuthError('') }}
            className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all ${authMode === 'login' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-slate-400 hover:text-slate-600'}`}>
            Log In
          </button>
          <button onClick={() => { setAuthMode('signup'); setAuthError('') }}
            className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all ${authMode === 'signup' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-slate-400 hover:text-slate-600'}`}>
            Create Account
          </button>
        </div>

        <div className="p-8 space-y-5">
          {authError && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm flex gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />{authError}
            </div>
          )}

          {authMode === 'login' ? (
            <>
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Your UPI ID</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" value={liUpi}
                    onChange={e => setLiUpi(e.target.value.toLowerCase().replace(/[^a-z0-9@.\-_]/g,''))}
                    placeholder="yournum@fastpay"
                    className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">6-Digit FastPay PIN</label>
                <div className="relative">
                  <ScanLine className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="password" value={liPin}
                    onChange={e => setLiPin(e.target.value.replace(/\D/g,'').slice(0,6))}
                    placeholder="••••••"
                    className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-2xl font-black text-center tracking-[0.5em] focus:ring-2 focus:ring-blue-500 transition-all"
                    onKeyDown={e => e.key === 'Enter' && liUpi && liPin && login()} />
                </div>
              </div>
              <button onClick={login} disabled={authLoading || !liUpi || liPin.length !== 6}
                className="w-full py-4 bg-blue-600 text-white rounded-xl font-black hover:bg-blue-700 transition-all shadow-lg disabled:opacity-60 flex items-center justify-center gap-2">
                {authLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Smartphone className="w-4 h-4" />}
                {authLoading ? 'Verifying...' : 'Enter FastPay'}
              </button>
            </>
          ) : (
            <>
              {accounts.length === 0 ? (
                <div className="p-5 bg-amber-50 border border-amber-100 rounded-xl text-center space-y-2">
                  <Building2 className="w-8 h-8 text-amber-400 mx-auto" />
                  <p className="text-sm font-bold text-amber-800">No bank accounts linked yet.</p>
                  <p className="text-xs text-amber-600">Go to <strong>Bank Connections</strong> in the main dashboard to link a bank first.</p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Source Bank Account</label>
                    <select value={suBank} onChange={e => setSuBank(e.target.value)}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm appearance-none focus:ring-2 focus:ring-blue-500">
                      <option value="" disabled>Select your bank account</option>
                      {accounts.map((a, i) => (
                        <option key={a._id || i} value={a._id || a.id}>
                          {a.bankName} — ****{String(a.accountNumber).slice(-4)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Display Name</label>
                      <input type="text" value={suName} onChange={e => setSuName(e.target.value)}
                        placeholder="Your Name"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">UPI Handle</label>
                      <input type="text" value={suUpi}
                        onChange={e => setSuUpi(e.target.value.toLowerCase().replace(/[^a-z0-9@.\-_]/g,''))}
                        placeholder="you@fastpay"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Set 6-Digit FastPay PIN</label>
                    <input type="password" value={suPin}
                      onChange={e => setSuPin(e.target.value.replace(/\D/g,'').slice(0,6))}
                      placeholder="••••••"
                      className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-2xl font-black text-center tracking-[0.5em] focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <button onClick={signup} disabled={authLoading || !suUpi || !suName || !suBank || suPin.length !== 6}
                    className="w-full py-4 bg-blue-600 text-white rounded-xl font-black hover:bg-blue-700 transition-all shadow-lg disabled:opacity-60 flex items-center justify-center gap-2">
                    {authLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    {authLoading ? 'Setting up...' : 'Create FastPay Profile'}
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )

  // ── Main App Screens ───────────────────────────────────────
  const fpUser = JSON.parse(localStorage.getItem('user') || '{}')
  const fpAccounts = fpUser.fastpayAccount
    ? accounts.filter(a => a._id === fpUser.fastpayAccount || a.id === fpUser.fastpayAccount)
    : accounts

  const displayBalance = fpAccounts.reduce((s, a) => s + (Number(a.balance) || 0), 0)
  const primaryAcc = fpAccounts[0] || accounts[0]

  const quickActions = [
    { label: 'Send Money', icon: Send, color: 'bg-blue-500', screen: 'send' },
    { label: 'Transfer',   icon: ArrowLeftRight, color: 'bg-violet-500', screen: 'transfer' },
    { label: 'Link Bank',  icon: Plus, color: 'bg-green-500', screen: 'linkbank' },
    { label: 'History',   icon: Clock, color: 'bg-orange-500', screen: 'history' },
  ]

  return (
    <div className="max-w-lg mx-auto pb-10 space-y-0">
      {/* Sub-screen overlay */}
      <AnimatePresence>
        {screen !== 'home' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm"
            onClick={() => setScreen('home')} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {screen !== 'home' && (
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
            className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-2xl max-w-lg mx-auto"
            style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-black text-slate-900">
                  {screen === 'send' ? 'Send Money' :
                   screen === 'transfer' ? 'Internal Transfer' :
                   screen === 'linkbank' ? 'Link Bank Account' : 'Transaction History'}
                </h2>
                <button onClick={() => setScreen('home')}
                  className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
                  <X className="w-4 h-4 text-slate-600" />
                </button>
              </div>

              {screen === 'send'     && <SendMoney contacts={contacts} onBack={() => setScreen('home')} onSuccess={fetchData} />}
              {screen === 'transfer' && <TransferMoney accounts={fpAccounts.length ? fpAccounts : accounts} contacts={contacts} onBack={() => setScreen('home')} onSuccess={fetchData} />}
              {screen === 'linkbank' && <LinkBank onBack={() => setScreen('home')} onSuccess={fetchData} />}
              {screen === 'history'  && <History transactions={transactions} onRefresh={fetchData} loading={dataLoading} />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Balance Card */}
      <div className="rounded-3xl p-6 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg,#1e3b8a 0%,#3b5fc0 60%,#7c3aed 100%)' }}>
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full" />
        <div className="absolute -bottom-12 -left-8 w-40 h-40 bg-white/5 rounded-full" />
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-blue-200 text-xs font-bold uppercase tracking-widest">FastPay Balance</p>
              <p className="text-4xl font-black mt-1 tracking-tight">{fmt(displayBalance)}</p>
            </div>
            <button onClick={logout}
              className="p-2 bg-white/15 rounded-xl hover:bg-white/25 transition-colors border border-white/20"
              title="Exit FastPay session">
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* UPI ID */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="w-4 h-4 text-blue-200" />
              <div>
                <p className="text-[10px] text-blue-200 font-bold uppercase tracking-widest">Your UPI ID</p>
                <p className="text-sm font-black text-white">{fpUser.upiId || 'Not set'}</p>
              </div>
            </div>
            <button onClick={copyUpi} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
              {copied ? <Check className="w-4 h-4 text-green-300" /> : <Copy className="w-4 h-4 text-blue-200" />}
            </button>
          </div>

          {/* Primary bank pill */}
          {primaryAcc && (
            <div className="flex items-center gap-2 mt-3">
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-[9px] font-black">
                {(primaryAcc.bankName || 'BK').slice(0,2).toUpperCase()}
              </div>
              <p className="text-[11px] text-blue-200 font-semibold">
                {primaryAcc.bankName} ****{String(primaryAcc.accountNumber).slice(-4)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-3 pt-5">
        {quickActions.map(({ label, icon: Icon, color, screen: s }) => (
          <button key={s} onClick={() => setScreen(s)}
            className="flex flex-col items-center gap-2 p-3 bg-white rounded-2xl shadow-sm hover:shadow-md hover:scale-105 transition-all border border-slate-100">
            <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center shadow-sm`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-[10px] font-black text-slate-700 text-center">{label}</p>
          </button>
        ))}
      </div>

      {/* Recent Transactions (last 5) */}
      <div className="pt-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-black text-slate-900">Recent Activity</h3>
          <button onClick={() => setScreen('history')} className="text-xs font-bold text-blue-600 hover:text-blue-700">View All</button>
        </div>
        {dataLoading ? (
          <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 animate-spin text-blue-400" /></div>
        ) : transactions.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-2xl p-8 text-center text-slate-400 shadow-sm">
            <TrendingUp className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm font-semibold">No transactions yet</p>
            <p className="text-xs mt-1">Send your first payment!</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {transactions.slice(0, 5).map((tx, i) => (
              <li key={tx.id || i} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.isPositive ? 'bg-green-100' : 'bg-red-50'}`}>
                    {tx.isPositive
                      ? <ArrowDownLeft className="w-5 h-5 text-green-600" />
                      : <ArrowUpRight className="w-5 h-5 text-red-500" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 leading-tight">{tx.desc}</p>
                    <p className="text-[11px] text-slate-400">{tx.date}</p>
                  </div>
                </div>
                <p className={`font-black text-sm ${tx.isPositive ? 'text-green-600' : 'text-slate-800'}`}>{tx.amount}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Contacts for quick pay */}
      {contacts.length > 0 && (
        <div className="pt-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-black text-slate-900">Contacts</h3>
            <span className="text-xs font-bold text-slate-400">{contacts.length} users</span>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {contacts.map((c, i) => (
              <button key={i} onClick={() => setScreen('send')}
                className="flex flex-col items-center gap-1.5 flex-shrink-0 hover:scale-105 transition-transform">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-xs font-black text-white shadow-sm"
                  style={{ background: `hsl(${(i * 73) % 360}, 65%, 55%)` }}>
                  {(c.fullName || 'U').substring(0,2).toUpperCase()}
                </div>
                <p className="text-[10px] font-bold text-slate-600 max-w-[52px] truncate">{c.fullName.split(' ')[0]}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ChevronDown, ArrowUpRight, ArrowDownLeft, Loader2, RefreshCw, Building2, FileText } from 'lucide-react'
import axios from 'axios'

const UPI_API      = import.meta.env.VITE_UPI_API_URL      || 'http://localhost:8000/api/v1'
const MOCK_API     = import.meta.env.VITE_MOCK_BANK_API_URL || 'http://localhost:5000/api/v1'
const TYPE_FILTERS = ['All', 'Credit', 'Debit']

export default function Statements() {
  // connected banks
  const [accounts, setAccounts]           = useState([])
  const [accountsLoading, setAccountsLoading] = useState(true)

  // selected acc state
  const [selectedAccount, setSelectedAccount] = useState(null)
  const [dropdownOpen, setDropdownOpen]        = useState(false)

  // statement stuff
  const [statement, setStatement]     = useState([])
  const [stmtLoading, setStmtLoading] = useState(false)
  const [stmtError, setStmtError]     = useState('')

  // --- UI state ---
  const [search, setSearch]           = useState('')
  const [typeFilter, setTypeFilter]   = useState('All')

  // fetch linked accounts on mount
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const token = localStorage.getItem('token')
        const user  = JSON.parse(localStorage.getItem('user') || '{}')
        const activeToken = token || user?.accessToken || user?.token
        const config = {
          withCredentials: true,
          ...(activeToken && { headers: { Authorization: `Bearer ${activeToken}` } })
        }
        const res = await axios.get(`${UPI_API}/users/accounts`, config)
        if (res?.data?.success && Array.isArray(res?.data?.data)) {
          const formatted = res.data.data.map((acc, idx) => ({
            id:            acc._id || idx,
            bankName:      acc.bankName   || 'Unknown Bank',
            accountNumber: acc.accountNumber,
            display:       `${acc.bankName || 'Bank'} — ****${(acc.accountNumber || '0000').slice(-4)}`,
            balance:       (acc.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 }),
            ifsc:          acc.ifscCode || acc.ifsc || 'N/A',
            initial:       (acc.bankName || 'XX').slice(0, 2).toUpperCase(),
          }))
          setAccounts(formatted)
          if (formatted.length > 0) setSelectedAccount(formatted[0])
        }
      } catch (e) {
        console.error('Failed to load accounts', e)
      } finally {
        setAccountsLoading(false)
      }
    }
    fetchAccounts()
  }, [])

  // load entries for selected acc
  useEffect(() => {
    if (!selectedAccount) return
    fetchStatement(selectedAccount)
  }, [selectedAccount])

  const fetchStatement = async (account) => {
    setStmtLoading(true)
    setStmtError('')
    setStatement([])
    try {
      const res = await axios.get(`${MOCK_API}/bank/statement/${account.accountNumber}`)
      if (res.data?.success && Array.isArray(res.data.transactions)) {
        setStatement(res.data.transactions)
      } else {
        setStatement([])
      }
    } catch (e) {
      if (e?.response?.status === 404) {
        setStmtError('No statement entries found for this account yet.')
      } else {
        setStmtError('Could not fetch statement. The bank server may be offline.')
      }
    } finally {
      setStmtLoading(false)
    }
  }

  // ── Filtering ──
  const filtered = statement.filter(tx => {
    const matchType   = typeFilter === 'All' || tx.type?.toLowerCase() === typeFilter.toLowerCase()
    const matchSearch = !search ||
      tx.utrNumber?.toLowerCase().includes(search.toLowerCase()) ||
      tx.remarks?.toLowerCase().includes(search.toLowerCase()) ||
      tx.upiId?.toLowerCase().includes(search.toLowerCase())
    return matchType && matchSearch
  })

  const totalCredit = statement.filter(t => t.type === 'CREDIT').reduce((a, t) => a + t.amount, 0)
  const totalDebit  = statement.filter(t => t.type === 'DEBIT').reduce((a, t)  => a + t.amount, 0)

  return (
    <div className="space-y-6">

      {/* ── Page Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Statements</h1>
          <p className="text-slate-500 text-sm mt-1">
            View your bank account statements and transaction history.
          </p>
        </div>
        <button
          onClick={() => selectedAccount && fetchStatement(selectedAccount)}
          disabled={stmtLoading || !selectedAccount}
          className="btn-secondary flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${stmtLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* ── Bank Selector ── */}
      {accountsLoading ? (
        <div className="flex items-center gap-3 text-slate-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Loading your bank accounts...</span>
        </div>
      ) : accounts.length === 0 ? (
        <div className="card p-8 text-center">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 font-semibold">No bank accounts linked.</p>
          <p className="text-slate-400 text-sm mt-1">
            Go to <strong>Bank Connections</strong> to link an account first.
          </p>
        </div>
      ) : (
        <div className="relative w-full max-w-md">
          <button
            onClick={() => setDropdownOpen(o => !o)}
            className="w-full flex items-center justify-between gap-3 px-5 py-3 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-slate-300 transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-xs font-bold text-blue-700 flex-shrink-0">
                {selectedAccount?.initial}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">{selectedAccount?.bankName}</p>
                <p className="text-xs text-slate-400 font-mono">
                  ****{selectedAccount?.accountNumber?.slice(-4)}
                </p>
              </div>
            </div>
            <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-xl z-30 overflow-hidden"
              >
                {accounts.map(acc => (
                  <button
                    key={acc.id}
                    onClick={() => {
                      setSelectedAccount(acc)
                      setDropdownOpen(false)
                      setSearch('')
                      setTypeFilter('All')
                    }}
                    className={`w-full flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors text-left ${
                      selectedAccount?.id === acc.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-xs font-bold text-blue-700 flex-shrink-0">
                      {acc.initial}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{acc.bankName}</p>
                      <p className="text-xs text-slate-400 font-mono">****{acc.accountNumber?.slice(-4)} · Balance: ₹{acc.balance}</p>
                    </div>
                    {selectedAccount?.id === acc.id && (
                      <span className="ml-auto text-xs font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">Selected</span>
                    )}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ── Summary Cards ── */}
      {selectedAccount && !stmtLoading && statement.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Entries</p>
              <p className="text-2xl font-bold text-slate-900">{statement.length}</p>
            </div>
          </div>
          <div className="card p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
              <ArrowDownLeft className="w-5 h-5 text-slate-700" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Credited</p>
              <p className="text-2xl font-bold text-slate-900">
                ₹{totalCredit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
          <div className="card p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
              <ArrowUpRight className="w-5 h-5 text-slate-500" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Debited</p>
              <p className="text-2xl font-bold text-slate-500">
                ₹{totalDebit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Filters + Search ── */}
      {selectedAccount && (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative w-full md:w-96">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by UTR, UPI ID, or remarks..."
              className="input-field pl-10"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-slate-500 mr-1">Filter:</span>
            {TYPE_FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setTypeFilter(f)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-custom border transition-all ${
                  typeFilter === f
                    ? f === 'Credit'
                      ? 'border-slate-700 text-slate-800 bg-slate-100'
                      : f === 'Debit'
                      ? 'border-slate-400 text-slate-500 bg-slate-50'
                      : 'border-primary text-primary bg-primary-light'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Statement Table ── */}
      {selectedAccount && (
        <div className="card overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Statement — {selectedAccount.bankName}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                Account ****{selectedAccount.accountNumber?.slice(-4)} · IFSC: {selectedAccount.ifsc}
              </p>
            </div>
            {!stmtLoading && !stmtError && (
              <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                {filtered.length} transaction{filtered.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="table-header border-b border-slate-200">
                  {['UTR / Reference', 'Type', 'Amount', 'Remarks / UPI ID', 'Date & Time'].map((h, i) => (
                    <th key={h} className={`px-6 py-4 font-semibold ${i === 2 ? 'text-right' : ''}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {stmtLoading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                      Fetching bank statement...
                    </td>
                  </tr>
                ) : stmtError ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400 text-sm italic">
                      {stmtError}
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400 text-sm">
                      No entries match your search or filter.
                    </td>
                  </tr>
                ) : (
                  filtered.map((tx, idx) => {
                    const isCredit = tx.type === 'CREDIT'
                    const date = new Date(tx.createdAt)
                    return (
                      <motion.tr
                        key={tx._id || idx}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.03 }}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-6 py-4 font-mono text-xs text-slate-600">
                          {tx.utrNumber || '—'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                            isCredit
                              ? 'bg-green-50 text-green-700 border border-green-100'
                              : 'bg-red-50 text-red-600 border border-red-100'
                          }`}>
                            {isCredit
                              ? <ArrowDownLeft className="w-3.5 h-3.5" />
                              : <ArrowUpRight  className="w-3.5 h-3.5" />
                            }
                            {isCredit ? 'Credit' : 'Debit'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={`font-bold text-sm ${isCredit ? 'text-green-700' : 'text-red-600'}`}>
                            {isCredit ? '+' : '−'} ₹{Number(tx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-500 text-xs max-w-xs truncate">
                          <span title={tx.remarks || tx.upiId || '—'}>
                            {tx.remarks || tx.upiId || '—'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-500 text-xs whitespace-nowrap">
                          {date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          <span className="ml-2 text-slate-400">
                            {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </td>
                      </motion.tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {!stmtLoading && filtered.length > 0 && (
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-sm text-slate-500">
                Showing {filtered.length} of {statement.length} entries
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Account: ****{selectedAccount?.accountNumber?.slice(-4)}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, RefreshCw, CheckCircle, Info, X, ChevronDown, ChevronUp, Building2, Wifi, Loader2 } from 'lucide-react'
import axios from 'axios'

export default function BankConnections() {
  const [showModal, setShowModal] = useState(false)
  const [showConnections, setShowConnections] = useState(false)
  const [expandedBankId, setExpandedBankId] = useState(null)
  
  const [banks, setBanks] = useState([])
  const [masterBanks, setMasterBanks] = useState([]) 
  const [loading, setLoading] = useState(true)

  const [bankName, setBankName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [ifscCode, setIfscCode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formMsg, setFormMsg] = useState({ type: '', text: '' })

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createBankId, setCreateBankId] = useState('')
  const [createAccountNumber, setCreateAccountNumber] = useState('')
  const [createIfsc, setCreateIfsc] = useState('')
  const [createPhoneNumber, setCreatePhoneNumber] = useState('')
  const [createHolderName, setCreateHolderName] = useState('')
  const [createPin, setCreatePin] = useState('')
  const [createBalance, setCreateBalance] = useState('')
  
  const [createIsSubmitting, setCreateIsSubmitting] = useState(false)
  const [createFormMsg, setCreateFormMsg] = useState({ type: '', text: '' })

  const UPI_API = (import.meta.env.VITE_UPI_API_URL || 'http://localhost:8000/api/v1')
  const RECON_API = (import.meta.env.VITE_RECON_API_URL || 'http://localhost:8001/api/v1')
  const mockBankApiUrl = import.meta.env.VITE_MOCK_BANK_API_URL || 'http://localhost:5000/api/v1'

  const fetchAccounts = async () => {
    try {
      setLoading(true)

      // Try to pull the token from local storage just in case
      const token = localStorage.getItem('token') 
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      const activeToken = token || user?.accessToken || user?.token

      const config = {
        withCredentials: true, // Keeps cookie support
        ...(activeToken && { headers: { Authorization: `Bearer ${activeToken}` } })
      }

      const res = await axios.get(`${UPI_API}/users/accounts`, config)
      
      if (res?.data?.success && Array.isArray(res?.data?.data)) {
        const formattedBanks = res.data.data.map((acc, index) => {
          const colors = [
            { bg: 'bg-blue-50', text: 'text-blue-700' },
            { bg: 'bg-orange-50', text: 'text-orange-700' },
            { bg: 'bg-red-50', text: 'text-red-700' },
            { bg: 'bg-green-50', text: 'text-green-700' }
          ]
          const theme = colors[index % colors.length]

          return {
           id: acc?._id || index,
    name: acc?.bankName || 'Unknown Bank',
    account: `Account ...${(acc?.accountNumber || '0000').slice(-4)}`,
    fullAccountNumber: acc?.accountNumber, // Added to pass to transactions later
    balance: `₹${(acc?.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
    
    // 🔴 FIX: Look for ifscCode first, fallback to ifsc
    ifsc: acc?.ifscCode || acc?.ifsc || 'N/A', 
    
    transactions: acc?.transactions || [],
    status: 'Connected',
    statusBg: 'bg-green-50 text-green-700 border-green-100',
    dotColor: 'bg-green-500',
    iconBg: theme.bg,
    color: theme.text,
    canSync: true,
    initial: (acc?.bankName || 'UN').slice(0, 2).toUpperCase(),
  }
        })
        setBanks(formattedBanks)
      } else {
        setBanks([]) 
      }
    } catch (error) {
      console.error("Error fetching accounts:", error)
      setBanks([])
    } finally {
      setLoading(false)
    }
  }

  const handleLinkBank = async () => {
    setIsSubmitting(true)
    setFormMsg({ type: '', text: '' })

    try {
      const token = localStorage.getItem('token') 
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      const activeToken = token || user?.accessToken || user?.token

      const res = await axios.post(`${UPI_API}/users/link-bank`, {
        bankName,
        accountNumber,
        ifscCode
      }, { 
        headers: { 
          'Content-Type': 'application/json',
          ...(activeToken && { Authorization: `Bearer ${activeToken}` })
        },
        withCredentials: true 
      })

      if (res?.data?.success) {
        await fetchAccounts()
        setShowModal(false)
        setAccountNumber('')
        setIfscCode('')
        alert("Bank Linked Successfully!")
      }
    } catch (error) {
      if (error?.response?.status === 401) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }
      setFormMsg({
        type: 'error',
        text: error?.response?.data?.message || 'Failed to link account.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }


  const fetchMasterBanks = async () => {
    try {
      const res = await axios.get(`${mockBankApiUrl}/bank/list`);
      let banksArray = res?.data?.banks || res?.data?.data || [];

      if (!Array.isArray(banksArray) || banksArray.length === 0) {
        banksArray = [
          { _id: 'bank_1', name: 'HDFC Bank' },
          { _id: 'bank_2', name: 'State Bank of India' },
          { _id: 'bank_3', name: 'ICICI Bank' },
          { _id: 'bank_4', name: 'Axis Bank' }
        ];
      }

      setMasterBanks(banksArray);
      setCreateBankId(banksArray[0]?._id || ''); 
      setBankName(banksArray[0]?.name || ''); 
      
    } catch (error) {
      console.error("Failed to fetch master banks.", error);
      const offlineBanks = [{ _id: 'offline_1', name: 'HDFC Bank (Offline)' }];
      setMasterBanks(offlineBanks);
      setCreateBankId(offlineBanks[0]._id);
      setBankName(offlineBanks[0].name);
    }
  }

  useEffect(() => {
    fetchAccounts()
    fetchMasterBanks()
  }, [])

 

  const handleCreateAccount = async () => {
    setCreateIsSubmitting(true)
    setCreateFormMsg({ type: '', text: '' })

    if (createPhoneNumber.length !== 10) {
      setCreateFormMsg({ type: 'error', text: 'Phone number must be exactly 10 digits.' })
      setCreateIsSubmitting(false); return;
    }

    if (createIfsc.length !== 11) {
      setCreateFormMsg({ type: 'error', text: 'IFSC must be exactly 11 characters.' })
      setCreateIsSubmitting(false); return;
    }

    try {
      const res = await axios.post(`${mockBankApiUrl}/bank/account/create`, {
        bankId: createBankId, accountNumber: createAccountNumber,
        ifsc: createIfsc, phoneNumber: createPhoneNumber,
        holderName: createHolderName, pin: createPin,
        balance: createBalance || 0
      })

      if (res?.data?.success) {
        setShowCreateModal(false)
        setCreateAccountNumber(''); setCreateIfsc(''); setCreatePhoneNumber('')
        setCreateHolderName(''); setCreatePin(''); setCreateBalance('')
        alert(`Bank Account Created!\nAcc: ${res.data.account.accountNumber}\nIFSC: ${res.data.account.ifsc}`);
      }
    } catch (error) {
      setCreateFormMsg({ type: 'error', text: error?.response?.data?.message || 'Failed to create account.' })
    } finally {
      setCreateIsSubmitting(false)
    }
  }

  const activeCount = (banks || []).filter(b => b?.status === 'Connected' || b?.status === 'Syncing').length

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Bank Connections</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your connected bank accounts and financial institutions.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <motion.button onClick={() => { setFormMsg({ type: '', text: '' }); setShowModal(true) }} className="bg-white border-2 border-dashed border-primary/40 rounded-xl p-6 flex flex-col items-center justify-center gap-3 hover:border-primary hover:bg-blue-50 transition-all group text-left w-full min-h-[140px]">
          <div className="w-14 h-14 rounded-xl bg-blue-50 border-2 border-blue-100 flex items-center justify-center group-hover:bg-blue-600 transition-all"><Plus className="w-7 h-7 text-blue-600 group-hover:text-white transition-colors" /></div>
          <div className="text-center"><p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">Link Existing Bank</p><p className="text-xs text-slate-400 mt-0.5">Connect to Dashboard</p></div>
        </motion.button>

        <motion.button onClick={() => { setCreateFormMsg({ type: '', text: '' }); setShowCreateModal(true) }} className="bg-white border-2 border-solid border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center gap-3 hover:border-slate-400 hover:bg-slate-50 transition-all group text-left w-full min-h-[140px] shadow-sm">
          <div className="w-14 h-14 rounded-xl bg-slate-100 border-2 border-slate-200 flex items-center justify-center group-hover:bg-slate-200 group-hover:border-slate-300 transition-all"><Building2 className="w-7 h-7 text-slate-500 group-hover:text-slate-700 transition-colors" /></div>
          <div className="text-center"><p className="text-sm font-bold text-slate-800 group-hover:text-slate-900 transition-colors">Create New Bank</p><p className="text-xs text-slate-500 mt-0.5">Open an account in Mock API</p></div>
        </motion.button>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <button onClick={() => setShowConnections(!showConnections)} className="w-full p-6 flex flex-col h-full items-start justify-between hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-4 w-full justify-start">
              <div className="w-14 h-14 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center shrink-0"><Wifi className="w-7 h-7 text-green-600" /></div>
              <div className="text-left w-full"><p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Connections</p>
                <div className="flex w-full items-center justify-between mt-1"><p className="text-3xl font-bold text-slate-900">{loading ? '-' : activeCount}</p>
                    <div className="flex items-center gap-1"><span className="text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full whitespace-nowrap">{showConnections ? 'Hide' : 'View All'}</span>{showConnections ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}</div>
                </div></div></div>
          </button>

          <AnimatePresence>
            {showConnections && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25, ease: 'easeInOut' }} className="overflow-hidden">
                <ul className="border-t border-slate-100 divide-y divide-slate-50 max-h-[300px] overflow-y-auto">
                  {banks.length === 0 ? <li className="px-6 py-4 text-center text-sm text-slate-500">No banks connected yet.</li> : (banks || []).map((bank, bIdx) => (
                      <li key={`${bank.id}-${bIdx}`} className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-3"><div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold border border-slate-100 ${bank.iconBg} ${bank.color}`}>{bank.initial}</div><div><p className="text-sm font-semibold text-slate-800">{bank.name}</p><p className="text-xs text-slate-400">{bank.account}</p></div></div>
                        <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${bank.statusBg}`}>{bank.status === 'Syncing' ? <RefreshCw className="w-3 h-3 animate-spin" /> : <span className={`w-1.5 h-1.5 rounded-full ${bank.dotColor}`} />}{bank.status}</div>
                      </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {(banks || []).map((bank, bIdx) => {
            const isExpanded = expandedBankId === bank.id;
            return (
              <motion.div 
                key={`${bank.id}-${bIdx}`} 
                layout
                initial={{ opacity: 0, y: 16 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: bIdx * 0.1, layout: { duration: 0.3 } }} 
                onClick={() => setExpandedBankId(isExpanded ? null : bank.id)}
                className="relative overflow-hidden cursor-pointer bg-gradient-to-br from-blue-500/30 to-blue-300/10 backdrop-blur-xl border-[1.5px] border-white/50 rounded-3xl shadow-[0_8px_32px_rgba(30,58,138,0.15)] hover:bg-gradient-to-br hover:from-blue-500/40 hover:to-blue-300/20 hover:shadow-[0_8px_32px_rgba(30,58,138,0.25)] hover:border-white/70 transition-all duration-500 group"
              >
                {/* Decorative Water-like Glassmorphic Orbs */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-200/30 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-300/40 transition-all duration-700 -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-300/30 transition-all duration-700 translate-y-1/3 -translate-x-1/4"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-transparent pointer-events-none rounded-3xl"></div>

                <div className="relative p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 z-10">
                  
                  {/* Left side: Icon + Name */}
                  <div className="flex items-center gap-5">
                    <div className="h-16 w-16 flex-shrink-0 bg-white/40 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/60 shadow-sm group-hover:scale-105 group-hover:bg-white/50 transition-all duration-300">
                      <span className="text-xl font-black text-blue-700 tracking-widest">{bank.initial}</span>
                    </div>
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-wide">{bank.name}</h3>
                      <p className="text-sm sm:text-base text-blue-900/80 font-medium tracking-wide mt-0.5">{bank.account}</p>
                    </div>
                  </div>

                  {/* Right side: Balance + Synced Status */}
                  <div className="flex flex-col sm:items-end justify-center gap-3">
                    <div className="flex items-center sm:justify-end gap-2">
                      <p className="text-xs text-blue-800 uppercase tracking-widest font-bold flex items-center gap-2">
                        Available Balance
                      </p>
                    </div>
                    <div className="flex items-center sm:justify-end gap-4">
                      <p className="text-3xl font-bold text-slate-900 tracking-tight">
                        {bank.balance}
                      </p>
                    </div>
                  </div>

                  {/* Floating Status Badge & Sync */}
                  <div className="absolute top-6 right-6 sm:relative sm:top-auto sm:right-auto flex items-center gap-3">
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-white/50 text-slate-800 backdrop-blur-md border border-white/70 shadow-sm`}>
                      <span className={`w-2 h-2 rounded-full ${bank.status === 'Syncing' ? 'bg-blue-500 animate-pulse' : 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]'}`} />
                      {bank.status}
                    </div>
                    <button 
                      className={`p-2 rounded-xl transition-all duration-300 ${bank.canSync ? 'bg-white/50 hover:bg-white border border-white shadow-sm text-blue-700 hover:text-blue-800' : 'bg-white/30 text-slate-500 cursor-not-allowed border border-white/50'}`} 
                      disabled={!bank.canSync}
                      onClick={(e) => { e.stopPropagation(); /* Sync logic here if any */ }}
                      title="Sync Account"
                    >
                      <RefreshCw className={`h-4 w-4 sm:h-5 sm:w-5 ${bank.status === 'Syncing' ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Expanded Details Section */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div 
                      key="details"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="relative z-10 border-t border-white/30 px-6 sm:px-8 overflow-hidden"
                    >
                      <div className="py-6 sm:py-8 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                        
                        {/* Account Details */}
                        <div className="space-y-4">
                          <h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest border-b border-white/30 pb-2">
                            Account Details
                          </h4>
                          <ul className="space-y-3">
                            <li className="flex justify-between items-center text-sm">
                              <span className="text-slate-600 font-medium">Bank Name</span>
                              <span className="font-bold text-slate-900">{bank.name}</span>
                            </li>
                            <li className="flex justify-between items-center text-sm">
                              <span className="text-slate-600 font-medium">Account ID</span>
                              <span className="font-bold text-slate-900 font-mono tracking-widest">{bank.account.replace('Account ...', '**** ')}</span>
                            </li>
                            <li className="flex justify-between items-center text-sm">
                              <span className="text-slate-600 font-medium">IFSC Code</span>
                              <span className="font-bold text-slate-900 font-mono">{bank.ifsc}</span>
                            </li>
                            <li className="flex justify-between items-center text-sm">
                              <span className="text-slate-600 font-medium">Status</span>
                              <span className="font-bold text-green-700 bg-green-500/10 px-2 py-0.5 rounded-md">Active</span>
                            </li>
                            <li className="flex justify-between items-center text-sm">
                              <span className="text-slate-600 font-medium">Account Type</span>
                              <span className="font-bold text-slate-900">Savings</span>
                            </li>
                          </ul>
                        </div>

                        {/* Recent Transactions */}
                        <div className="space-y-4">
                          <h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest border-b border-white/30 pb-2">
                            Recent Transactions
                          </h4>
                          <div className="space-y-2">
                            {(!bank.transactions || bank.transactions.length === 0) ? (
                              <div className="p-3 text-center text-slate-500 text-sm italic">
                                No recent transactions found in database.
                              </div>
                            ) : bank.transactions.slice(0, 3).map((tx) => (
                              <div key={tx.id} className="flex justify-between items-center p-3 bg-white/20 hover:bg-white/30 transition-colors rounded-xl border border-white/40 shadow-sm backdrop-blur-md">
                                <div>
                                  <p className="text-sm font-bold text-slate-900 leading-tight">{tx.desc}</p>
                                  <p className="text-xs text-blue-900/70 font-medium">{tx.date}</p>
                                </div>
                                <p className={`text-sm font-black ${tx.isPositive ? 'text-green-700' : 'text-slate-800'}`}>
                                  {tx.amount}
                                </p>
                              </div>
                            ))}
                          </div>
                          <button onClick={(e) => e.stopPropagation()} className="w-full mt-2 py-2.5 bg-white/40 hover:bg-white/60 border border-white/50 rounded-xl text-xs font-bold text-slate-900 shadow-sm transition-all focus:ring-2 focus:ring-blue-500 backdrop-blur-md">
                            View Full Statement
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── LINK EXISTING BANK MODAL ── */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !isSubmitting && setShowModal(false)} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-all" />
            <motion.div initial={{ opacity: 0, y: 60, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 60, scale: 0.97 }} className="fixed inset-x-0 bottom-0 sm:inset-0 sm:flex sm:items-center sm:justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100">
                <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100"><Wifi className="w-5 h-5 text-blue-600" /></div><div><h2 className="text-base font-bold text-slate-900">Link Bank Account</h2><p className="text-xs text-slate-500 mt-0.5">Connect an existing account</p></div></div><button onClick={() => !isSubmitting && setShowModal(false)} className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"><X className="w-5 h-5" /></button></div>
                <div className="p-6 space-y-4">
                  {formMsg.text && (<div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100 font-medium flex items-center gap-2"><Info className="w-4 h-4" />{formMsg.text}</div>)}
                  <div className="space-y-1.5"><label className="block text-sm font-semibold text-slate-700">Select Bank</label><div className="relative"><select className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none pr-10" value={bankName} onChange={(e) => setBankName(e.target.value)} disabled={isSubmitting}>{(masterBanks || []).map((bank) => (<option key={bank._id} value={bank.name}>{bank.name}</option>))}</select><ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" /></div></div>
                  <div className="space-y-1.5"><label className="block text-sm font-semibold text-slate-700">Account Number</label><input type="text" placeholder="Enter account number" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 18))} disabled={isSubmitting} /></div>
                  <div className="space-y-1.5"><label className="block text-sm font-semibold text-slate-700">IFSC Code</label><input type="text" placeholder="e.g. SBIN0001234" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase font-mono" value={ifscCode} onChange={(e) => setIfscCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 11))} disabled={isSubmitting} /></div>
                </div>
                <div className="flex gap-3 px-6 pb-6 pt-2 bg-slate-50 border-t border-slate-100"><button onClick={() => setShowModal(false)} disabled={isSubmitting} className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50">Cancel</button><button onClick={handleLinkBank} disabled={isSubmitting || !accountNumber || ifscCode.length !== 11} className="flex-1 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">{isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}{isSubmitting ? 'Linking...' : 'Connect Bank'}</button></div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── CREATE BANK ACCOUNT MODAL ── */}
      <AnimatePresence>
        {showCreateModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !createIsSubmitting && setShowCreateModal(false)} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-all" />
            <motion.div initial={{ opacity: 0, y: 60, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 60, scale: 0.97 }} className="fixed inset-x-0 bottom-0 sm:inset-0 sm:flex sm:items-center sm:justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100">
                <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center border border-slate-200"><Building2 className="w-5 h-5 text-slate-700" /></div><div><h2 className="text-base font-bold text-slate-900">Create Bank Account</h2><p className="text-xs text-slate-500 mt-0.5">Open a new bank account via Mock API</p></div></div><button onClick={() => !createIsSubmitting && setShowCreateModal(false)} className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button></div>
                <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                  {createFormMsg.text && (<div className={`p-3 text-sm rounded-lg border font-medium flex items-center gap-2 ${createFormMsg.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>{createFormMsg.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <Info className="w-4 h-4" />}{createFormMsg.text}</div>)}
                  <div className="grid grid-cols-2 gap-4"><div className="space-y-1.5"><label className="block text-sm font-semibold text-slate-700">Bank Selection</label><div className="relative"><select className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 appearance-none pr-10" value={createBankId} onChange={(e) => setCreateBankId(e.target.value)} disabled={createIsSubmitting}>{(masterBanks || []).map((bank) => (<option key={bank._id} value={bank._id}>{bank.name}</option>))}</select><ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" /></div></div><div className="space-y-1.5"><label className="block text-sm font-semibold text-slate-700">Account Holder</label><input type="text" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500" value={createHolderName} onChange={(e) => setCreateHolderName(e.target.value)} disabled={createIsSubmitting} /></div></div>
                  <div className="space-y-1.5"><label className="block text-sm font-semibold text-slate-700">Account Number</label><input type="text" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 font-mono tracking-wider" value={createAccountNumber} onChange={(e) => setCreateAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 18))} disabled={createIsSubmitting} /></div>
                  <div className="grid grid-cols-2 gap-4"><div className="space-y-1.5"><label className="block text-sm font-semibold text-slate-700">IFSC Code</label><input type="text" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 uppercase font-mono" value={createIfsc} onChange={(e) => setCreateIfsc(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 11))} disabled={createIsSubmitting} /></div><div className="space-y-1.5"><label className="block text-sm font-semibold text-slate-700">Phone Number</label><input type="text" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 font-mono" value={createPhoneNumber} onChange={(e) => setCreatePhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))} disabled={createIsSubmitting} /></div></div>
                  <div className="grid grid-cols-2 gap-4"><div className="space-y-1.5"><label className="block text-sm font-semibold text-slate-700">UPI PIN</label><input type="password" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 text-center tracking-widest font-mono" value={createPin} onChange={(e) => setCreatePin(e.target.value.replace(/\D/g, '').slice(0, 6))} disabled={createIsSubmitting} /></div><div className="space-y-1.5"><label className="block text-sm font-semibold text-slate-700">Initial Balance</label><div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium text-sm">₹</span><input type="number" className="w-full pl-8 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 font-mono" value={createBalance} onChange={(e) => setCreateBalance(e.target.value)} disabled={createIsSubmitting} /></div></div></div>
                </div>
                <div className="flex gap-3 px-6 pb-6 pt-4 bg-slate-50 border-t border-slate-100"><button onClick={() => setShowCreateModal(false)} disabled={createIsSubmitting} className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50">Cancel</button><button onClick={handleCreateAccount} disabled={createIsSubmitting || !createHolderName || createPin.length < 4 || createAccountNumber.length < 9 || createPhoneNumber.length !== 10 || createIfsc.length !== 11} className="flex-1 px-4 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 disabled:opacity-50 flex items-center justify-center gap-2">{createIsSubmitting ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Plus className="w-4 h-4 text-white" />}{createIsSubmitting ? 'Creating...' : 'Create Account'}</button></div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  )
}
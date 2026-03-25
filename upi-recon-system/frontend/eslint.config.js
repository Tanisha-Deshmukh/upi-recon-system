import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle, 
  BellRing,
  ArrowUpRight
} from 'lucide-react';

// --- 1. INTRO LOADER (The Blue Flower) ---
const IntroLoader = () => (
  <motion.div
    initial={{ opacity: 1 }}
    exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
    className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white"
  >
    <div className="relative flex items-center justify-center">
      {/* Expanding Blue Flower Petals */}
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [1, 2.5, 2.2], opacity: [0, 0.4, 0] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.4,
            ease: "circOut"
          }}
          className="absolute h-32 w-32 rounded-full border-2 border-blue-400 bg-blue-50/50"
        />
      ))}
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="z-10 text-center"
      >
        <div className="bg-blue-600 p-4 rounded-[2rem] shadow-2xl shadow-blue-200 inline-block mb-4">
          <ShieldCheck className="text-white w-12 h-12" />
        </div>
        <h1 className="text-3xl font-bold text-slate-800">SecurePay</h1>
        <p className="text-slate-400 font-medium tracking-wide">Reliable UPI Settlements</p>
      </motion.div>
    </div>
  </motion.div>
);

// --- 2. THE MAIN DASHBOARD ---
const Dashboard = () => {
  // Human-style sample data for the demo
  const [payments] = useState([
    { id: 1, utr: "340912234567", amount: 500.00, source: "SMS", status: "Verified", time: "12:45 PM" },
    { id: 2, utr: "340912234589", amount: 1250.00, source: "Scraper", status: "Recovered", time: "12:40 PM" },
    { id: 3, utr: "340912234612", amount: 45.00, source: "SMS", status: "Verified", time: "12:15 PM" },
  ]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-[#f8fafc]"
    >
      {/* Header / Navbar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 sticky top-0 z-40 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl">
            <ShieldCheck className="text-white w-6 h-6" />
          </div>
          <span className="font-extrabold text-2xl tracking-tighter text-slate-900">
            SECURE<span className="text-blue-600">PAY</span>
          </span>
        </div>

        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 px-4 py-1.5 rounded-full">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-widest">Active Connection</span>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 md:p-10">
        <header className="mb-10">
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Merchant Terminal</h2>
          <p className="text-slate-500 font-medium mt-2">Monitoring 3-Tier Reconciliation Flow</p>
        </header>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <StatCard label="Total Collected" value="₹1,795.00" icon={<CreditCard className="text-blue-600"/>} />
          <StatCard label="Direct Verified" value="2" icon={<CheckCircle2 className="text-emerald-500"/>} />
          <StatCard label="Failure Recoveries" value="1" icon={<BellRing className="text-orange-500"/>} />
        </div>

        {/* Transaction Table */}
        <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
            <h3 className="font-bold text-slate-800 text-lg">Live Transactions</h3>
            <button className="text-blue-600 text-sm font-bold flex items-center gap-1 hover:underline">
               Export CSV <ArrowUpRight size={14}/>
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 text-slate-400 text-[11px] uppercase tracking-[0.15em]">
                <tr>
                  <th className="px-8 py-4 font-bold">Time / UTR</th>
                  <th className="px-8 py-4 font-bold">Amount</th>
                  <th className="px-8 py-4 font-bold text-center">Source</th>
                  <th className="px-8 py-4 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {payments.map((tx) => (
                  <tr key={tx.id} className="group hover:bg-blue-50/30 transition-all">
                    <td className="px-8 py-5">
                      <p className="text-xs text-slate-400 font-medium mb-1">{tx.time}</p>
                      <p className="font-mono font-bold text-slate-700 tracking-tight group-hover:text-blue-600">{tx.utr}</p>
                    </td>
                    <td className="px-8 py-5 text-xl font-black text-slate-900 italic">₹{tx.amount}</td>
                    <td className="px-8 py-5 text-center">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                        tx.source === 'Scraper' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {tx.source}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className={`flex items-center gap-2 font-bold text-sm ${
                        tx.status === 'Verified' ? 'text-emerald-600' : 'text-orange-600'
                      }`}>
                        {tx.status === 'Verified' ? <CheckCircle2 size={18}/> : <AlertCircle size={18}/>}
                        {tx.status}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </motion.div>
  );
};

// Helper Component for Stats
const StatCard = ({ label, value, icon }) => (
  <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex items-start justify-between">
    <div>
      <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">{label}</p>
      <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{value}</h3>
    </div>
    <div className="p-3 bg-slate-50 rounded-2xl">{icon}</div>
  </div>
);

// --- 3. APP CONTROLLER ---
export default function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence mode="wait">
      {loading ? <IntroLoader key="loader" /> : <Dashboard key="dash" />}
    </AnimatePresence>
  );
}
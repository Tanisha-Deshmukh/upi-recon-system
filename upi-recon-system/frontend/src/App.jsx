import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Activity, CheckCircle2, RefreshCw, VolumeX, Volume2, Lock, Mail, User, Bell, ExternalLink, LogOut, Shield, Copy } from 'lucide-react';
import axios from 'axios';

// --- GLOBAL STYLES ---
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Exo+2:ital,wght@1,700;1,800&family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap');
    
    body {
      font-family: 'Inter', sans-serif;
      background-color: #020617; /* Deep Navy */
      color: #f8fafc;
      -webkit-font-smoothing: antialiased;
    }
    
    .glass-card {
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.05);
    }

    .grid-bg {
      background-image: radial-gradient(circle, rgba(59, 130, 246, 0.15) 1px, transparent 1px);
      background-size: 30px 30px;
    }
    
    .header-italic {
      font-family: 'Exo 2', sans-serif;
      font-style: italic;
    }
    
    .mono-font {
      font-family: 'JetBrains Mono', monospace;
    }
  `}</style>
);


// // --- 1. THE EXACT SAME GEOMETRIC STRUCTURE - BUT BRIGHTER WITH VIOLET BORDERS ---
// const IntroLoader = () => (
//   <motion.div
//     initial={{ opacity: 1 }}
//     exit={{ opacity: 0, transition: { duration: 1 } }}
//     // A richer, slightly warmer Deep Blue background
//     className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-[#01061a]"
//   >
//     <div className="relative flex items-center justify-center scale-75 md:scale-110 mb-24">
      
//       {/* RING 1: Outer Petals - Deep Blue with intense VIOLET BORDER (Count: 24, exact same speed) */}
//       {[...Array(24)].map((_, i) => (
//         <motion.div
//           key={`outer-${i}`}
//           initial={{ scale: 0, opacity: 0, rotate: i * 15 }}
//           animate={{ 
//             scale: [0, 1.15, 1], 
//             opacity: [0, 0.4, 0.15],
//             rotate: [i * 15, i * 15 + 180] 
//           }}
//           transition={{ duration: 6, repeat: Infinity, ease: "linear", delay: i * 0.01 }}
//           // ⭐ CRUCIAL CHANGE: Violet border added to every single petal
//           className="absolute border-[1.5px] border-violet-500/70 shadow-[0_0_10px_rgba(168,85,247,0.3)] blur-[0.5px]"
//           style={{ 
//             width: '450px', height: '140px', 
//             borderRadius: '50% 50% 50% 50% / 100% 100% 0% 0%',
//             transformOrigin: 'center center',
//             // ⭐ CRUCIAL CHANGE: Swapped linear gradient for BRIGHTER Electric Blue to Vivid Violet
//             background: 'linear-gradient(to top, rgba(37,99,235,0.4), rgba(168,85,247,0.2), transparent)'
//           }}
//         />
//       ))}

//       {/* RING 2: Middle Petals - Electric Blue with VIOLET BORDER (Count: 12, exact same speed) */}
//       {[...Array(12)].map((_, i) => (
//         <motion.div
//           key={`mid-${i}`}
//           initial={{ scale: 0, opacity: 0, rotate: i * 30 }}
//           animate={{ 
//             scale: [0, 1, 0.9], 
//             opacity: [0, 0.6, 0.3],
//             rotate: [i * 30, i * 30 - 360] 
//           }}
//           transition={{ duration: 8, repeat: Infinity, ease: "linear", delay: 0.2 }}
//           // ⭐ CRUCIAL CHANGE: Violet border added to every single petal
//           className="absolute border-[2px] border-violet-400 shadow-[0_0_15px_rgba(37,99,235,0.4)] blur-[0.3px]"
//           style={{ 
//             width: '300px', height: '100px', 
//             borderRadius: '50% 50% 50% 50% / 100% 100% 0% 0%',
//             transformOrigin: 'center center',
//             // ⭐ CRUCIAL CHANGE: Increased gradient intensity to BRIGHT Electric Blue and Violet
//             background: 'linear-gradient(to top, rgba(37,99,235,0.6), rgba(168,85,247,0.3), transparent)'
//           }}
//         />
//       ))}

//       {/* RING 3: Inner Core - Neon Blue with VIOLET BORDER (Count: 8, exact same speed) */}
//       {[...Array(8)].map((_, i) => (
//         <motion.div
//           key={`inner-${i}`}
//           initial={{ scale: 0, opacity: 0, rotate: i * 45 }}
//           animate={{ 
//             scale: [0, 1.2, 1], 
//             opacity: [0, 0.9, 0.5],
//             rotate: [i * 45, i * 45 + 90]
//           }}
//           transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
//           // ⭐ CRUCIAL CHANGE: Border and intense glow added to core structure
//           className="absolute bg-blue-500/20 blur-md border-[2px] border-violet-400/60 shadow-[0_0_35px_rgba(168,85,247,0.7)]"
//           style={{ 
//             width: '160px', height: '80px', 
//             borderRadius: '100% 0% 100% 0%',
//             transformOrigin: 'center center' 
//           }}
//         />
//       ))}

//       {/* CENTRAL LOGO: High Contrast with Violet Drop Shadow */}
//       <motion.div
//         initial={{ scale: 0 }}
//         animate={{ scale: [1, 1.05, 1] }}
//         transition={{ duration: 2, repeat: Infinity }}
//         className="relative z-10 bg-[#0a1128]/80 backdrop-blur-xl p-7 rounded-[2.5rem] shadow-[0_0_100px_rgba(37,99,235,0.3)] border-2 border-violet-400/40"
//       >
//         {/* ⭐ CRUCIAL CHANGE: Increased glow of the center shield icon to pure violet */}
//         <ShieldCheck size={50} className="text-blue-300 drop-shadow-[0_0_15px_rgba(168,85,247,1)]" />
//       </motion.div>
      
//       {/* Intense Background Radial Glow (Pulse enabled for brightness) */}
//       <div className="absolute h-[500px] w-[500px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
//     </div>

//     {/* FIXED CAPTION */}
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ delay: 1.5 }}
//       className="absolute bottom-12 text-center w-full"
//     >
//       <h2 className="text-2xl font-black text-white tracking-[0.6em] uppercase italic opacity-90">
//         SECURE<span className="text-blue-500 drop-shadow-[0_0_10px_rgba(37,99,235,1)]">PAY</span>
//       </h2>
//       {/* ⭐ CRUCIAL CHANGE: Line gradient updated to Blue/Violet for cohesion */}
//       <div className="h-[2px] w-16 bg-gradient-to-r from-transparent via-violet-600 to-transparent mx-auto mt-4 mb-3" />
//       <p className="text-violet-400/70 text-[10px] font-black uppercase tracking-[0.5em] animate-pulse">
//         Initializing Reconciliation Engine
//       </p>
//     </motion.div>
//   </motion.div>
// );



// // --- 1. THE BRIGHT NEON MANDALA LOADER ---
// const IntroLoader = () => (
//   <motion.div
//     initial={{ opacity: 1 }}
//     exit={{ opacity: 0, transition: { duration: 1 } }}
//     className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-[#010414]"
//   >
//     <div className="relative flex items-center justify-center scale-90 md:scale-125 mb-24">
      
//       {/* RING 1: Outer Petals - Deep Neon Blue with Violet Stroke */}
//       {[...Array(24)].map((_, i) => (
//         <motion.div
//           key={`outer-${i}`}
//           initial={{ scale: 0, opacity: 0, rotate: i * 15 }}
//           animate={{ 
//             scale: [0, 1.1, 1], 
//             opacity: [0, 0.7, 0.4],
//             rotate: [i * 15, i * 15 + 180] 
//           }}
//           transition={{ duration: 10, repeat: Infinity, ease: "linear", delay: i * 0.02 }}
//           className="absolute border-[1.5px] border-violet-500/60 shadow-[0_0_15px_rgba(168,85,247,0.4)]"
//           style={{ 
//             width: '480px', height: '160px', 
//             borderRadius: '50% 50% 50% 50% / 100% 100% 0% 0%',
//             transformOrigin: 'center center',
//             background: 'linear-gradient(to top, rgba(37,99,235,0.6), rgba(168,85,247,0.3), transparent)'
//           }}
//         />
//       ))}

//       {/* RING 2: Middle Petals - Bright Electric Blue */}
//       {[...Array(12)].map((_, i) => (
//         <motion.div
//           key={`mid-${i}`}
//           initial={{ scale: 0, opacity: 0, rotate: i * 30 }}
//           animate={{ 
//             scale: [0, 1.2, 1], 
//             opacity: [0, 0.8, 0.6],
//             rotate: [i * 30, i * 30 - 360] 
//           }}
//           transition={{ duration: 7, repeat: Infinity, ease: "linear", delay: 0.1 }}
//           className="absolute border-[2px] border-blue-400 shadow-[0_0_20px_rgba(37,99,235,0.5)]"
//           style={{ 
//             width: '320px', height: '110px', 
//             borderRadius: '50% 50% 50% 50% / 100% 100% 0% 0%',
//             transformOrigin: 'center center',
//             background: 'linear-gradient(to top, rgba(37,99,235,0.8), rgba(139,92,246,0.4), transparent)'
//           }}
//         />
//       ))}

//       {/* RING 3: Inner Core - Intense Violet Glow */}
//       {[...Array(8)].map((_, i) => (
//         <motion.div
//           key={`inner-${i}`}
//           initial={{ scale: 0, opacity: 0, rotate: i * 45 }}
//           animate={{ 
//             scale: [0, 1.3, 1], 
//             opacity: [0, 1, 0.8],
//             rotate: [i * 45, i * 45 + 90]
//           }}
//           transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
//           className="absolute bg-blue-500/30 blur-sm border-[2px] border-violet-400 shadow-[0_0_30px_rgba(168,85,247,0.8)]"
//           style={{ 
//             width: '180px', height: '90px', 
//             borderRadius: '100% 0% 100% 0%',
//             transformOrigin: 'center center' 
//           }}
//         />
//       ))}

//       {/* CENTRAL LOGO: High Contrast Glass */}
//       <motion.div
//         initial={{ scale: 0 }}
//         animate={{ scale: [1, 1.1, 1] }}
//         transition={{ duration: 2, repeat: Infinity }}
//         className="relative z-10 bg-[#0a1128] p-8 rounded-[2.5rem] shadow-[0_0_100px_rgba(168,85,247,0.6)] border-2 border-blue-400/40"
//       >
//         <ShieldCheck size={60} className="text-blue-400 drop-shadow-[0_0_15px_rgba(168,85,247,1)]" />
//       </motion.div>
      
//       {/* Intense Background Radial Glow */}
//       <div className="absolute h-[600px] w-[600px] bg-blue-600/20 rounded-full blur-[150px] animate-pulse" />
//     </div>

//     {/* CAPTION */}
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ delay: 1 }}
//       className="absolute bottom-16 text-center w-full"
//     >
//       <h2 className="text-3xl font-black text-white tracking-[0.7em] uppercase italic">
//         SECURE<span className="text-blue-500 drop-shadow-[0_0_10px_rgba(37,99,235,1)]">PAY</span>
//       </h2>
//       <div className="h-[3px] w-24 bg-gradient-to-r from-transparent via-violet-500 to-transparent mx-auto mt-4 mb-3" />
//       <p className="text-violet-400 text-[11px] font-black uppercase tracking-[0.6em] animate-pulse">
//         System Protocol Active
//       </p>
//     </motion.div>
//   </motion.div>
// );

//--- 1. THE MANDALA BLOOM LOADER (Restyled with new colors) ---
const IntroLoader = () => (
  <motion.div
    initial={{ opacity: 1 }}
    exit={{ opacity: 0, transition: { duration: 1 } }}
    className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-[#01061a] overflow-hidden"
  >
    <div className="absolute w-[150%] h-[150%] bg-[radial-gradient(circle,rgba(0,210,255,0.08)_0%,transparent_70%)] pointer-events-none" />
    <div className="absolute w-[120%] h-[120%] bg-[radial-gradient(circle,rgba(138,43,226,0.05)_0%,transparent_60%)] animate-pulse" />

    <div className="relative flex items-center justify-center scale-75 md:scale-110 mb-24">
      {/* RING 1: Outer Petals - Deep Sapphire */}
      {[...Array(24)].map((_, i) => (
        <motion.div
          key={`outer-${i}`}
          initial={{ scale: 0, opacity: 0, rotate: i * 15 }}
          animate={{ scale: [0, 1.15, 1], opacity: [0, 0.4, 0.15], rotate: [i * 15, i * 15 + 180] }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear", delay: i * 0.01 }}
          className="absolute border-[0.8px] border-[#0f3460]/30 blur-[1px]"
          style={{ 
            width: '450px', height: '140px', 
            borderRadius: '50% 50% 50% 50% / 100% 100% 0% 0%',
            transformOrigin: 'center center',
            background: 'linear-gradient(to top, rgba(15,52,96,0.3), transparent)'
          }}
        />
      ))}

      {/* RING 2: Middle Petals - Electric Blue */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={`mid-${i}`}
          initial={{ scale: 0, opacity: 0, rotate: i * 30 }}
          animate={{ scale: [0, 1, 0.9], opacity: [0, 0.6, 0.3], rotate: [i * 30, i * 30 - 360] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear", delay: 0.2 }}
          className="absolute border-[1.2px] border-[#00d2ff]/40 blur-[0.5px]"
          style={{ 
            width: '300px', height: '100px', 
            borderRadius: '50% 50% 50% 50% / 100% 100% 0% 0%',
            transformOrigin: 'center center',
            background: 'linear-gradient(to top, rgba(0,210,255,0.4), transparent)'
          }}
        />
      ))}

      {/* RING 3: Inner Core - Soft Violet */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`inner-${i}`}
          initial={{ scale: 0, opacity: 0, rotate: i * 45 }}
          animate={{ scale: [0, 1.2, 1], opacity: [0, 0.9, 0.5], rotate: [i * 45, i * 45 + 90] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="absolute bg-[#8a2be2]/20 blur-md shadow-[0_0_35px_rgba(138,43,226,0.6)]"
          style={{ width: '160px', height: '80px', borderRadius: '100% 0% 100% 0%', transformOrigin: 'center center' }}
        />
      ))}

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="relative z-10 glass-card p-7 rounded-full shadow-[0_0_80px_rgba(0,210,255,0.3)] border border-[#00d2ff]/20"
      >
        <ShieldCheck size={50} className="text-white drop-shadow-[0_0_15px_rgba(0,210,255,0.8)]" />
      </motion.div>
    </div>

    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.5 }} className="absolute bottom-12 text-center w-full flex flex-col items-center">
      <h2 className="header-italic text-4xl font-extrabold text-white tracking-[0.4em] uppercase">
        SECUREPAY
      </h2>
      <div className="h-[1px] w-48 bg-gradient-to-r from-transparent via-[#00d2ff] to-transparent shadow-[0_0_8px_rgba(0,210,255,0.8)] mt-2 mb-4" />
      <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.25em] animate-pulse">
        Initializing Reconciliation Engine
      </p>
    </motion.div>
  </motion.div>
);

// --- 2. THE LOGIN / SIGNUP SECTION (Restyled) ---
// --- 2. THE LOGIN / SIGNUP SECTION (Updated with Registration Logic) ---
const AuthScreen = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [fullName, setFullName] = useState(""); // New: Needed for Register
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false); // New: For button feedback

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Determine endpoint based on mode
    const endpoint = isLogin ? "/users/login" : "/users/register";
    
    // Build payload: Only send fullName if registering
    const payload = isLogin 
      ? { email, password } 
      : { fullName, email, password };

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}${endpoint}`, payload);
      
      if (response.data.success) {
        if (isLogin) {
          localStorage.setItem("token", response.data.data.accessToken);
          onLogin();
        } else {
          // If register was successful, switch to login view
          setIsLogin(true);
          setError("Registration Successful. Please Login.");
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Terminal Connection Refused");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-[#020617] flex flex-col justify-center items-center relative p-6 overflow-hidden z-[500]">
      {/* Background elements */}
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#8b5cf6]/20 rounded-full blur-[150px] pointer-events-none" />
      
      <main className="w-full max-w-md z-10">
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-4 border border-blue-500/30 relative">
            <ShieldCheck className="text-blue-500 w-10 h-10 drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
            <div className="absolute inset-0 rounded-2xl animate-ping bg-blue-500/20 -z-10" />
          </div>
          <h1 className="text-3xl font-extrabold header-italic tracking-tighter text-white uppercase">
            Secure<span className="text-blue-500">Pay</span>
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-1 uppercase tracking-widest">
            {isLogin ? "MERCHANT TERMINAL v4.0" : "PROTOCOL REGISTRATION"}
          </p>
        </div>

        <div className="glass-card rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full pointer-events-none" />
          
          {error && (
            <div className={`text-[10px] font-bold uppercase mb-4 text-center tracking-widest p-2 rounded-lg border ${
              error.includes("Successful") 
              ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" 
              : "text-rose-500 bg-rose-500/10 border-rose-500/20"
            }`}>
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase italic text-slate-400 ml-1">Merchant Name</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="text-slate-500 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input 
                    type="text" 
                    required={!isLogin}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe" 
                    className="block w-full pl-12 pr-4 py-4 bg-slate-900/50 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-2xl text-white placeholder-slate-600 transition-all outline-none font-semibold" 
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase italic text-slate-400 ml-1">System Identifier</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="text-slate-500 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="merchant@access.secure" 
                  className="block w-full pl-12 pr-4 py-4 bg-slate-900/50 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-2xl text-white placeholder-slate-600 transition-all outline-none font-semibold" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="block text-xs font-bold uppercase italic text-slate-400">Access Key</label>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="text-slate-500 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••" 
                  className="block w-full pl-12 pr-4 py-4 bg-slate-900/50 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-2xl text-white placeholder-slate-600 transition-all outline-none font-semibold tracking-widest" 
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-extrabold uppercase italic rounded-2xl shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isLoading ? (
                <RefreshCw size={20} className="animate-spin" />
              ) : (
                <span>{isLogin ? 'Access Terminal' : 'Create Account'}</span>
              )}
            </button>
          </form>

          <p onClick={() => { setIsLogin(!isLogin); setError(""); }} className="text-center mt-6 text-[10px] font-medium text-slate-500 uppercase tracking-widest cursor-pointer hover:text-slate-300 transition-colors">
            {isLogin ? "Don't have an account? Sign Up" : "Already a Merchant? Login"}
          </p>
        </div>
      </main>
    </motion.div>
  );
};

// --- 3. THE MAIN DASHBOARD (Kept original structure & slides, applied new styles & full screen layout) ---
const Dashboard = ({ onNewTransaction, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("menu");
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [filter, setFilter] = useState("All");
  const [selectedTx, setSelectedTx] = useState(null);
  const [isUpiDown, setIsUpiDown] = useState(false);
  const [logs, setLogs] = useState([]);
  const [balance, setBalance] = useState(0);

  const fetchBalance = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/balance`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.data.success) {
        setBalance(response.data.data.balance);
      }
    } catch (err) {
      console.error("Balance fetch error:", err);
    }
  };

  const handlePayment = async () => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/payments/send`, {
        amount: 200,
        receiverUpi: "friend@okaxis"
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.data.success) {
        onNewTransaction(200);
        fetchHistory();
        fetchBalance();
      }
    } catch (error) {
      console.error("Payment failed", error);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/payments/history`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.data.success) {
        const mappedLogs = response.data.data.map(tx => ({
          id: tx._id,
          utr: tx.utr || "RECONCILING...",
          amount: tx.amount,
          method: "UPI",
          status: tx.status,
          type: tx.senderAccount === "987654321011" ? "Sent" : "Received",
          time: new Date(tx.createdAt).toLocaleTimeString()
        }));
        setLogs(mappedLogs);
        setIsUpiDown(false);
      }
    } catch (error) {
      if (!error.response || error.response.status === 503) setIsUpiDown(true);
    }
  };

  useEffect(() => {
    fetchHistory();
    fetchBalance();
    const interval = setInterval(() => {
      fetchHistory();
      fetchBalance();
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const tabContent = {
    "How it Works": "3-Tier logic: SMS Detect -> Bank Scraper -> UTR Match.",
    "Features": "Real-time Voice Alerts, Automated Bank Scraping, and UTR Reconciliation.",
    "Manual": "1. Sync Bank. 2. Enable SMS. 3. Monitor Feed.",
    "About Us": "SecurePay Recon is a high-volume UPI reconciliation engine.",
    "Contact": "Support: dev@securepay.local",
    "Account": "Settings for account management and security."
  };

  const filteredLogs = logs.filter(log => filter === "All" || log.type === filter);

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-slate-100 font-sans relative overflow-x-hidden flex flex-col">
      
      {/* BACKGROUND DECORATIVE GLOWS */}
      <div className="fixed top-[-10%] right-[-10%] w-[400px] h-[400px] bg-[#8b5cf6]/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

      {/* THE SIDEBAR (kept your logic) */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setIsMenuOpen(false); setActiveTab("menu"); }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
            <motion.div initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }} className="fixed left-0 top-0 bottom-0 w-80 bg-[#020617]/95 backdrop-blur-2xl z-[60] border-r border-white/5 p-8 flex flex-col shadow-2xl">
              {activeTab !== "menu" && <button onClick={() => setActiveTab("menu")} className="mb-4 text-[10px] font-bold text-blue-500 uppercase tracking-widest hover:text-blue-400">← Back</button>}
              <div className="flex items-center gap-3 mb-10 pl-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-[#8b5cf6] p-[2px]">
                  <div className="w-full h-full rounded-full bg-[#002147] flex items-center justify-center">
                     <ShieldCheck className="text-white w-5 h-5" />
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Menu Console</p>
                  <span className="font-extrabold text-xl header-italic tracking-tight text-white">SecurePay</span>
                </div>
              </div>
              <div className="flex-1 space-y-6">
                {activeTab === "menu" ? (
                  <>
                    <button onClick={handlePayment} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-900/40 italic flex justify-center items-center gap-2">
                      <Activity size={16} /> Simulate Txn
                    </button>
                    <div className="mt-8 space-y-2">
                      {Object.keys(tabContent).map((tab) => (
                        <div key={tab} onClick={() => setActiveTab(tab)} className="cursor-pointer group p-3 rounded-xl hover:bg-white/5 transition-all">
                          <h4 className="font-bold uppercase tracking-widest text-xs text-slate-400 group-hover:text-blue-400">{tab}</h4>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="glass-card p-5 rounded-2xl border border-white/5">
                    <p className="text-sm text-slate-300 leading-relaxed">{tabContent[activeTab]}</p>
                  </div>
                )}
              </div>

              <button onClick={onLogout} className="mt-auto flex items-center gap-4 p-4 glass-card rounded-2xl border border-rose-900/30 hover:bg-rose-900/20 transition-all group cursor-pointer">
                <div className="bg-rose-500/10 p-2 rounded-xl text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-colors">
                  <LogOut size={18} />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-rose-500 group-hover:text-rose-400">Logout</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* TOP NAV */}
      <nav className="glass-card border-b border-white/5 px-6 py-4 sticky top-0 z-40 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-4">
          <button onClick={() => setIsMenuOpen(true)} className="p-2 hover:bg-white/5 rounded-xl transition-all">
            <div className="w-6 h-0.5 bg-blue-400 mb-1.5 rounded-full" />
            <div className="w-4 h-0.5 bg-white mb-1.5 rounded-full" />
            <div className="w-6 h-0.5 bg-blue-400 rounded-full" />
          </button>
          
          <div className="hidden md:flex gap-2 ml-4">
            {["All", "Received", "Sent"].map(t => (
              <button 
                key={t} onClick={() => setFilter(t)}
                className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${filter === t ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'bg-transparent text-slate-500 hover:text-slate-300'}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setIsVoiceActive(!isVoiceActive)} className={`p-2 rounded-full border transition-all ${isVoiceActive ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-white/5 border-white/10 text-slate-400'}`}>
            {isVoiceActive ? <Volume2 size={18} className="animate-pulse" /> : <VolumeX size={18} />}
          </button>
          <div className="hidden md:flex items-center gap-2 bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20 text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
            <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse mr-1" /> Live Recon
          </div>
        </div>
      </nav>

      <main className="flex-1 w-full max-w-[1400px] mx-auto p-6 md:p-10 flex flex-col lg:flex-row gap-8 relative z-10">
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* Dashboard Header */}
          <div className="mb-8">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Terminal Dashboard</p>
            <h1 className="text-3xl font-extrabold header-italic uppercase text-white tracking-tight">System <span className="text-blue-500">Overview</span></h1>
          </div>

          {/* Top Stats Row (Restyled to match HTML references) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="md:col-span-2 relative bg-gradient-to-r from-[#1E40AF] to-[#3B82F6] rounded-3xl p-6 overflow-hidden shadow-lg border border-blue-400/20">
              <div className="absolute top-0 right-0 p-4 opacity-10"><Shield size={80} /></div>
              <p className="text-blue-100/80 text-xs font-medium uppercase tracking-wider mb-2">Available Wallet Balance</p>
              <h2 className="text-4xl font-bold tracking-tight text-white mb-1">${balance.toLocaleString()}.00</h2>
              <div className="inline-block bg-white/20 text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase backdrop-blur-sm mt-2">USD</div>
            </div>

            <div className="glass-card p-6 rounded-3xl flex flex-col justify-center border-l-4 border-l-blue-500/50">
              <p className="text-xs text-slate-400 font-bold uppercase mb-2 tracking-widest">Total Txns</p>
              <span className="text-3xl font-bold text-white">{logs.length}</span>
            </div>

            <div className="glass-card p-6 rounded-3xl flex flex-col justify-center border-l-4 border-l-emerald-500/50">
              <p className="text-xs text-slate-400 font-bold uppercase mb-2 tracking-widest">Verified</p>
              <span className="text-3xl font-bold text-emerald-400">{logs.filter(l => l.status === "SUCCESS").length}</span>
            </div>
          </div>

          <AnimatePresence>
            {isUpiDown && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-amber-500/10 border border-amber-500/30 p-4 mb-6 rounded-2xl flex items-center gap-3 backdrop-blur-md">
                <Activity className="text-amber-500 animate-pulse" size={20} />
                <p className="text-xs font-bold uppercase text-amber-400 tracking-widest italic">
                  System Alert: Network unstable. Auto-Recon active.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* The Transaction Table (kept your table layout, restyled with glassmorphism) */}
          <div className="glass-card rounded-[2rem] border border-white/5 overflow-hidden shadow-xl flex-1">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-white/5 text-[10px] uppercase font-bold tracking-widest text-slate-400 border-b border-white/5">
                  <tr>
                    <th className="px-8 py-5">Transaction Details</th>
                    <th className="px-8 py-5 text-right">Amount</th>
                    <th className="px-8 py-5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredLogs.length > 0 ? (
                    filteredLogs.map(log => (
                      <tr 
                        key={log.id} 
                        onClick={() => setSelectedTx(log)}
                        className="hover:bg-white/5 transition-colors cursor-pointer group"
                      >
                        <td className="px-8 py-5">
                          <p className="font-semibold text-white mb-1 group-hover:text-blue-400 transition-colors">{log.type === 'Received' ? 'Inbound Transfer' : 'Merchant Settlement'}</p>
                          <p className="mono-font text-xs text-slate-500">UTR: {log.utr.slice(0,12)}...</p>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <p className="text-lg font-bold text-white">${log.amount.toLocaleString()}.00</p>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest
                            ${log.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center justify-center opacity-50">
                          <Activity size={40} className="text-slate-500 mb-4" />
                          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Awaiting Signal</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* The Slide-out Panel (Your logic, restyled as the "Verification" screen from HTML) */}
        <AnimatePresence>
          {selectedTx && (
            <motion.div 
              initial={{ x: 50, opacity: 0 }} 
              animate={{ x: 0, opacity: 1 }} 
              exit={{ x: 50, opacity: 0 }} 
              className="w-full lg:w-[400px] glass-card rounded-[2rem] p-6 shadow-2xl border border-white/10 sticky top-[100px] h-fit shrink-0"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xs font-bold uppercase tracking-widest italic opacity-80">Verification</h3>
                <button onClick={() => setSelectedTx(null)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                  ✕
                </button>
              </div>

              <div className="text-center py-6 mb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-blue-500 mb-2 block italic">Transaction Amount</span>
                <div className="text-4xl font-extrabold tracking-tight mb-3">
                  ${selectedTx.amount.toLocaleString()}.<span className="opacity-50 text-2xl">00</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20 uppercase tracking-widest">
                  <CheckCircle2 size={12} /> Protocol Active
                </div>
              </div>

              <div className="bg-black/20 rounded-2xl p-5 mb-6 border border-white/5">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold uppercase italic text-white">Security</h4>
                  <Shield className="w-4 h-4 text-blue-500" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-medium">Status</span>
                    <span className={`font-bold ${selectedTx.status === 'SUCCESS' ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {selectedTx.status === 'SUCCESS' ? 'Reconciliation Complete' : 'Pending'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-medium">Network</span>
                    <span className="mono-font">{selectedTx.method}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-medium">Verified At</span>
                    <span className="mono-font">{selectedTx.time}</span>
                  </div>
                </div>
              </div>

              <div className="bg-black/20 rounded-2xl p-5 mb-8 border-l-4 border-l-blue-500 border-y border-r border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 italic">UTR Reference</h4>
                  <Copy className="w-3 h-3 text-slate-500 cursor-pointer hover:text-white" />
                </div>
                <p className="mono-font text-lg font-bold text-blue-400 break-all leading-tight">
                  {selectedTx.utr}
                </p>
              </div>

              <a href={`https://www.google.com/search?q=verify+${selectedTx.method}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl uppercase tracking-widest text-xs shadow-lg transition-all italic">
                <span>Visit Gateway</span>
                <ExternalLink size={14} />
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

// --- 4. THE APP CONTROLLER ---
export default function App() {
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const [toast, setToast] = useState({ show: false, amt: "" });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuth(true);
    }
    const timer = setTimeout(() => setLoading(false), 3500); // slightly shorter load
    return () => clearTimeout(timer);
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/users/logout`, {}, { withCredentials: true });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      localStorage.removeItem("token");
      setIsAuth(false);
    }
  };

  const triggerToast = (amt) => {
    setToast({ show: true, amt });
    setTimeout(() => setToast({ show: false, amt: "" }), 4000);
  };

  return (
    <>
      <GlobalStyles />
      <div className="relative overflow-hidden selection:bg-blue-500/30">
        <AnimatePresence mode="wait">
          {loading ? (
            <IntroLoader key="loader" />
          ) : !isAuth ? (
            <AuthScreen key="auth" onLogin={() => setIsAuth(true)} />
          ) : (
            <Dashboard 
              key="dash" 
              onNewTransaction={triggerToast} 
              onLogout={handleLogout}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {toast.show && (
            <motion.div 
              initial={{ y: 100, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              exit={{ y: 100, opacity: 0 }}
              className="fixed bottom-10 right-10 glass-card text-white px-5 py-3 rounded-2xl shadow-2xl z-[1000] border-l-4 border-l-emerald-500 flex items-center gap-3"
            >
              <div className="bg-emerald-500/20 p-1.5 rounded-full text-emerald-400">
                <CheckCircle2 size={16} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-emerald-400 tracking-widest">Success</p>
                <p className="font-bold text-sm italic tracking-tight">Verified ${toast.amt}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}













































// import React, { useState, useEffect } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { ShieldCheck, Activity, CheckCircle2, RefreshCw, VolumeX, Volume2, Lock, Mail, User, Bell, ExternalLink, LogOut } from 'lucide-react';
// import axios from 'axios';

// // --- 1. THE MANDALA BLOOM LOADER ---
// const IntroLoader = () => (
//   <motion.div
//     initial={{ opacity: 1 }}
//     exit={{ opacity: 0, transition: { duration: 1 } }}
//     // A richer, slightly warmer Deep Blue background
//     className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-[#01061a]"
//   >
//     <div className="relative flex items-center justify-center scale-75 md:scale-110 mb-24">
      
//       {/* RING 1: Outer Petals - Deep Blue with Purple Glow */}
//       {[...Array(24)].map((_, i) => (
//         <motion.div
//           key={`outer-${i}`}
//           initial={{ scale: 0, opacity: 0, rotate: i * 15 }}
//           animate={{ 
//             scale: [0, 1.15, 1], 
//             opacity: [0, 0.4, 0.15],
//             rotate: [i * 15, i * 15 + 180] 
//           }}
//           transition={{ duration: 6, repeat: Infinity, ease: "linear", delay: i * 0.01 }}
//           className="absolute border-[0.8px] border-blue-400/30 blur-[1px]"
//           style={{ 
//             width: '450px', height: '140px', 
//             borderRadius: '50% 50% 50% 50% / 100% 100% 0% 0%',
//             transformOrigin: 'center center',
//             // Blue base with a hint of Purple at the tip
//             background: 'linear-gradient(to top, rgba(30,64,175,0.3), rgba(147,51,234,0.1), transparent)'
//           }}
//         />
//       ))}

//       {/* RING 2: Middle Petals - Electric Blue & Violet */}
//       {[...Array(12)].map((_, i) => (
//         <motion.div
//           key={`mid-${i}`}
//           initial={{ scale: 0, opacity: 0, rotate: i * 30 }}
//           animate={{ 
//             scale: [0, 1, 0.9], 
//             opacity: [0, 0.6, 0.3],
//             rotate: [i * 30, i * 30 - 360] 
//           }}
//           transition={{ duration: 8, repeat: Infinity, ease: "linear", delay: 0.2 }}
//           className="absolute border-[1.2px] border-blue-300/40 blur-[0.5px]"
//           style={{ 
//             width: '300px', height: '100px', 
//             borderRadius: '50% 50% 50% 50% / 100% 100% 0% 0%',
//             transformOrigin: 'center center',
//             // Blending Blue into Purple for a "Electric" look
//             background: 'linear-gradient(to top, rgba(37,99,235,0.4), rgba(126,34,206,0.2), transparent)'
//           }}
//         />
//       ))}

//       {/* RING 3: Inner Core - Neon Blue & Amethyst Glow */}
//       {[...Array(8)].map((_, i) => (
//         <motion.div
//           key={`inner-${i}`}
//           initial={{ scale: 0, opacity: 0, rotate: i * 45 }}
//           animate={{ 
//             scale: [0, 1.2, 1], 
//             opacity: [0, 0.9, 0.5],
//             rotate: [i * 45, i * 45 + 90]
//           }}
//           transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
//           className="absolute bg-blue-600/20 blur-md shadow-[0_0_35px_rgba(59,130,246,0.6)]"
//           style={{ 
//             width: '160px', height: '80px', 
//             borderRadius: '100% 0% 100% 0%',
//             transformOrigin: 'center center' 
//           }}
//         />
//       ))}

//       {/* CENTRAL LOGO: Transparent Glassmorphism */}
//       <motion.div
//         initial={{ scale: 0 }}
//         animate={{ scale: [1, 1.05, 1] }}
//         transition={{ duration: 2, repeat: Infinity }}
//         className="relative z-10 bg-[#0a1128]/80 backdrop-blur-xl p-7 rounded-[2.5rem] shadow-[0_0_80px_rgba(37,99,235,0.4)] border border-blue-400/20"
//       >
//         <ShieldCheck size={50} className="text-blue-400 drop-shadow-[0_0_10px_rgba(147,51,234,0.8)]" />
//       </motion.div>
      
//       {/* Ambient Radial Background Glow */}
//       <div className="absolute h-[500px] w-[500px] bg-blue-900/10 rounded-full blur-[120px]" />
//     </div>

//     {/* FIXED CAPTION: Pinned to bottom, no overlapping */}
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ delay: 1.5 }}
//       className="absolute bottom-12 text-center w-full"
//     >
//       <h2 className="text-2xl font-black text-white tracking-[0.6em] uppercase italic opacity-90">
//         SECURE<span className="text-blue-500">PAY</span>
//       </h2>
//       <div className="h-[2px] w-16 bg-gradient-to-r from-transparent via-blue-600 to-transparent mx-auto mt-4 mb-3" />
//       <p className="text-blue-400/50 text-[10px] font-black uppercase tracking-[0.5em]">
//         Initializing Reconciliation Engine
//       </p>
//     </motion.div>
//   </motion.div>
// );

// // --- 2. THE LOGIN / SIGNUP SECTION ---
// const AuthScreen = ({ onLogin }) => {
//   const [isLogin, setIsLogin] = useState(true);
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     try {
//       // ⭐ FIXED backticks and template literal
//       const response = await axios.post(`${import.meta.env.VITE_API_URL}/users/login`, { email, password });
//       if (response.data.success) {
//         localStorage.setItem("token", response.data.data.accessToken);
//         onLogin();
//       }
//     } catch (err) { // ⭐ Fixed variable name to match below
//       setError(err.response?.data?.message || "Invalid Terminal Credentials");
//     }
//   };

//   return (
//     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-[#020617] flex items-center justify-center p-6 z-[500]">
//       <div className="w-full max-w-md bg-[#0a1128] border border-blue-500/20 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
//         <div className="text-center mb-10">
//           <div className="bg-blue-600 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-500/40">
//             <ShieldCheck className="text-white" size={32} />
//           </div>
//           <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">{isLogin ? 'Merchant Login' : 'Join SecurePay'}</h2>
//         </div>

//         {error && (
//           <div className="text-rose-500 text-[10px] font-black uppercase mb-4 text-center tracking-widest animate-pulse">
//             ⚠️ {error}
//           </div>
//         )}
        
//         <form className="space-y-4" onSubmit={handleSubmit}>
//           {!isLogin && (
//             <div className="relative">
//               <User className="absolute left-4 top-4 text-blue-400/40" size={18} />
//               <input type="text" placeholder="FULL NAME" className="w-full bg-[#030712] border border-blue-500/10 rounded-2xl p-4 pl-12 text-sm text-white outline-none font-bold italic" />
//             </div>
//           )}
//           <div className="relative">
//             <Mail className="absolute left-4 top-4 text-blue-400/40" size={18} />
//             <input 
//               type="email" 
//               placeholder="EMAIL ADDRESS" 
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               className="w-full bg-[#030712] border border-blue-500/10 rounded-2xl p-4 pl-12 text-sm text-white outline-none font-bold italic" 
//             />
//           </div>
//           <div className="relative">
//             <Lock className="absolute left-4 top-4 text-blue-400/40" size={18} />
//             <input 
//               type="password" 
//               placeholder="PASSWORD" 
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               className="w-full bg-[#030712] border border-blue-500/10 rounded-2xl p-4 pl-12 text-sm text-white outline-none font-bold italic" 
//             />
//           </div>
//           <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-500/20 transition-all uppercase tracking-widest text-xs mt-4 italic">
//             {isLogin ? 'Access Terminal' : 'Create Account'}
//           </button>
//         </form>
//         <p onClick={() => setIsLogin(!isLogin)} className="text-center text-[10px] font-bold text-blue-400/40 mt-8 uppercase tracking-widest cursor-pointer hover:text-blue-400">
//           {isLogin ? "Don't have an account? Sign Up" : "Already a Merchant? Login"}
//         </p>
//       </div>
//     </motion.div>
//   );
// };

// // --- 3. THE MAIN DASHBOARD ---
// const Dashboard = ({ onNewTransaction, onLogout }) => {
//   const [isMenuOpen, setIsMenuOpen] = useState(false);
//   const [activeTab, setActiveTab] = useState("menu");
//   const [isVoiceActive, setIsVoiceActive] = useState(false);
//   const [filter, setFilter] = useState("All");
//   const [selectedTx, setSelectedTx] = useState(null);
//   const [isUpiDown, setIsUpiDown] = useState(false);
//   const [logs, setLogs] = useState([]);
//   const [balance, setBalance] = useState(0);

//   const fetchBalance = async () => {
//     try {
//       const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/balance`, {
//         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//       });
//       if (response.data.success) {
//         setBalance(response.data.data.balance);
//       }
//     } catch (err) {
//       console.error("Balance fetch error:", err);
//     }
//   };

//   const handlePayment = async () => {
//     try {
//       const response = await axios.post(`${import.meta.env.VITE_API_URL}/payments/send`, {
//         amount: 200,
//         receiverUpi: "friend@okaxis"
//       }, {
//         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//       });
//       if (response.data.success) {
//         onNewTransaction(200);
//         fetchHistory();
//         fetchBalance();
//       }
//     } catch (error) {
//       console.error("Payment failed", error);
//     }
//   };

//   const fetchHistory = async () => {
//     try {
//       const response = await axios.get(`${import.meta.env.VITE_API_URL}/payments/history`, {
//         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//       });
//       if (response.data.success) {
//         const mappedLogs = response.data.data.map(tx => ({
//           id: tx._id,
//           utr: tx.utr || "RECONCILING...",
//           amount: tx.amount,
//           method: "UPI",
//           status: tx.status,
//           type: tx.senderAccount === "987654321011" ? "Sent" : "Received",
//           time: new Date(tx.createdAt).toLocaleTimeString()
//         }));
//         setLogs(mappedLogs);
//         setIsUpiDown(false);
//       }
//     } catch (error) {
//       if (!error.response || error.response.status === 503) setIsUpiDown(true);
//     }
//   };

//   useEffect(() => {
//     fetchHistory();
//     fetchBalance();
//     const interval = setInterval(() => {
//       fetchHistory();
//       fetchBalance();
//     }, 4000);
//     return () => clearInterval(interval);
//   }, []);

//   const tabContent = {
//     "How it Works": "3-Tier logic: SMS Detect -> Bank Scraper -> UTR Match.",
//     "Features": "Real-time Voice Alerts, Automated Bank Scraping, and UTR Reconciliation.",
//     "Manual": "1. Sync Bank. 2. Enable SMS. 3. Monitor Feed.",
//     "About Us": "SecurePay Recon is a high-volume UPI reconciliation engine.",
//     "Contact": "Support: dev@securepay.local",
//     "Account": "Settings for account management and security."
//   };

//   const triggerTestSignal = () => { handlePayment(); };
//   const filteredLogs = logs.filter(log => filter === "All" || log.type === filter);

//   return (
//     <div className="min-h-screen bg-[#01061a] text-white font-sans relative overflow-hidden">
      
//       {/* BACKGROUND DECORATIVE GLOWS */}
//       <div className="absolute top-0 right-0 h-[500px] w-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
//       <div className="absolute bottom-0 left-0 h-[500px] w-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

//       {/* SIDEBAR */}
//       <AnimatePresence>
//         {isMenuOpen && (
//           <>
//             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setIsMenuOpen(false); setActiveTab("menu"); }} className="fixed inset-0 bg-black/60 backdrop-blur-md z-50" />
//             <motion.div initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }} className="fixed left-0 top-0 bottom-0 w-80 bg-[#0a1128]/90 backdrop-blur-2xl z-[60] border-r border-white/10 p-8 flex flex-col">
//               {activeTab !== "menu" && <button onClick={() => setActiveTab("menu")} className="mb-4 text-[10px] font-black text-blue-400 uppercase tracking-widest">← Back</button>}
//               <div className="flex items-center gap-3 mb-10 pl-2">
//                 <ShieldCheck className="text-blue-500" size={24} />
//                 <span className="font-black text-xl tracking-tighter italic">SECURE<span className="text-blue-500">PAY</span></span>
//               </div>
//               <div className="flex-1 space-y-6">
//                 {activeTab === "menu" ? (
//                   <>
//                     <button onClick={triggerTestSignal} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-blue-900/40">🚀 Initiate Payment</button>
//                     {Object.keys(tabContent).map((tab) => (
//                       <div key={tab} onClick={() => setActiveTab(tab)} className="cursor-pointer group border-b border-white/5 pb-2 transition-all">
//                         <h4 className="font-black uppercase tracking-widest text-xs text-slate-400 group-hover:text-blue-400">{tab}</h4>
//                       </div>
//                     ))}
//                   </>
//                 ) : (
//                   <p className="text-sm text-slate-300 italic leading-relaxed bg-white/5 p-4 rounded-xl border border-white/10">{tabContent[activeTab]}</p>
//                 )}
//               </div>

//               <button onClick={onLogout} className="mt-auto flex items-center gap-4 px-6 py-5 bg-rose-900/20 text-rose-400 rounded-[2rem] border border-rose-900/30 hover:bg-rose-900/40 transition-all group">
//                 <div className="bg-rose-600 p-2 rounded-xl text-white shadow-lg shadow-rose-900/50 group-hover:scale-110 transition-transform">
//                   <LogOut size={16} />
//                 </div>
//                 <span className="text-[10px] font-black uppercase tracking-widest italic">Terminate Session</span>
//               </button>
//             </motion.div>
//           </>
//         )}
//       </AnimatePresence>

//       <nav className="bg-white/5 backdrop-blur-2xl border-b border-white/10 px-8 py-4 sticky top-0 z-40 flex justify-between items-center">
//         <div className="flex items-center gap-4">
//           <button onClick={() => setIsMenuOpen(true)} className="flex flex-col gap-1.5 p-2 hover:bg-white/5 rounded-xl transition-all">
//             <div className="w-5 h-0.5 bg-blue-400 rounded-full" />
//             <div className="w-3 h-0.5 bg-white rounded-full" />
//             <div className="w-5 h-0.5 bg-blue-400 rounded-full" />
//           </button>
//           <div className="hidden md:flex gap-1 ml-4">
//             {["All", "Received", "Sent"].map(t => (
//               <button 
//                 key={t} onClick={() => setFilter(t)}
//                 className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${filter === t ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'}`}
//               >
//                 {t}
//               </button>
//             ))}
//           </div>
//         </div>
//         <div className="flex items-center gap-3">
//           <button onClick={() => setIsVoiceActive(!isVoiceActive)} className={`p-2 rounded-xl border transition-all ${isVoiceActive ? 'bg-blue-600 border-blue-500 text-white shadow-lg' : 'bg-white/5 border-white/10 text-slate-400'}`}>
//             {isVoiceActive ? <Volume2 size={20} className="animate-pulse" /> : <VolumeX size={20} />}
//           </button>
//           <div className="flex items-center gap-2 bg-emerald-900/20 px-4 py-1.5 rounded-full border border-emerald-500/30 text-[10px] font-black text-emerald-400 uppercase tracking-widest italic">
//             <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse mr-2 shadow-[0_0_8px_rgba(16,185,129,0.8)]" /> Recon Live
//           </div>
//         </div>
//       </nav>

//       <main className="max-w-7xl mx-auto p-10 flex flex-col lg:flex-row gap-10">
//         <div className="flex-1">
//           <h1 className="text-4xl font-black italic uppercase text-white drop-shadow-lg">Merchant <span className="text-blue-500">Ops</span></h1>

//           <div className="grid grid-cols-1 md:grid-cols-4 gap-6 my-10 font-black italic">
//             <div className="relative overflow-hidden bg-gradient-to-br from-blue-900/40 to-blue-700/20 p-8 rounded-[2.5rem] border border-blue-400/30 shadow-2xl backdrop-blur-md">
//               <div className="absolute top-0 right-0 p-4 opacity-10"><ShieldCheck size={40} /></div>
//               <p className="text-[8px] text-blue-300 uppercase mb-2 tracking-[0.2em] font-bold">Available Wallet</p>
//               <span className="text-3xl text-white">₹{balance.toLocaleString()}</span>
//             </div>
//             <div className="bg-white/5 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/10 shadow-sm text-white">
//               <p className="text-[8px] text-slate-400 uppercase mb-2 tracking-[0.2em]">Total</p>
//               <span className="text-2xl">{logs.length}</span>
//             </div>
//             <div className="bg-white/5 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/10 shadow-sm text-emerald-400">
//               <p className="text-[8px] text-slate-400 uppercase mb-2 tracking-[0.2em]">Verified</p>
//               <span className="text-2xl">{logs.filter(l => l.status === "SUCCESS").length}</span>
//             </div>
//             <div className="bg-white/5 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/10 shadow-sm text-orange-400">
//               <p className="text-[8px] text-slate-400 uppercase mb-2 tracking-[0.2em]">Pending</p>
//               <span className="text-2xl">{logs.filter(l => l.status === "PENDING").length}</span>
//             </div>
//           </div>

//           <AnimatePresence>
//             {isUpiDown && (
//               <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-orange-900/20 border border-orange-500/30 p-4 mb-6 rounded-2xl flex items-center gap-3 backdrop-blur-md">
//                 <Activity className="text-orange-500 animate-pulse" size={18} />
//                 <p className="text-[10px] font-black uppercase text-orange-400 tracking-widest italic">
//                   System Alert: UPI Network unstable. Automatic Reconciliation is active.
//                 </p>
//               </motion.div>
//             )}
//           </AnimatePresence>

//           <div className="bg-white/5 backdrop-blur-xl rounded-[3rem] shadow-2xl border border-white/10 overflow-hidden">
//             <table className="w-full text-left">
//               <thead className="bg-white/5 text-[10px] uppercase font-black tracking-widest text-slate-400">
//                 <tr><th className="px-10 py-5">UTR / ID</th><th className="px-10 py-5">Amount</th><th className="px-10 py-5">Status</th></tr>
//               </thead>
//               <tbody className="divide-y divide-white/5">
//                 {filteredLogs.length > 0 ? (
//                   filteredLogs.map(log => (
//                     <tr 
//                       key={log.id} 
//                       onClick={() => setSelectedTx(log)}
//                       className="hover:bg-blue-600/10 transition-all font-bold cursor-pointer group"
//                     >
//                       <td className="px-10 py-6 font-mono text-sm text-slate-300">
//                         {log.utr}<br/>
//                         <span className="text-[10px] text-blue-400 uppercase italic font-sans">{log.method} • {log.time}</span>
//                       </td>
//                       <td className="px-10 py-6 text-2xl font-black italic tracking-tighter text-white">₹{log.amount}</td>
//                       <td className="px-10 py-6">
//                         <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm
//                           ${log.status === 'SUCCESS' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'}`}>
//                           {log.status}
//                         </span>
//                       </td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td colSpan="3" className="px-10 py-24 text-center">
//                       <div className="flex flex-col items-center justify-center gap-4 opacity-40">
//                         <Activity size={48} className="text-blue-500/50" />
//                         <div className="space-y-1">
//                           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-300">No Secure Node Activity</p>
//                           <p className="text-[8px] font-bold uppercase tracking-widest text-slate-500">Awaiting First Transaction Signal</p>
//                         </div>
//                       </div>
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>

//         <AnimatePresence>
//           {selectedTx && (
//             <motion.div initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 100, opacity: 0 }} className="w-full lg:w-96 bg-white/5 backdrop-blur-2xl rounded-[3rem] p-8 shadow-2xl border border-white/10 sticky top-28 h-fit">
//               <button onClick={() => setSelectedTx(null)} className="text-[10px] font-black text-slate-500 hover:text-white uppercase mb-8 transition-colors">✕ Close Panel</button>
//               <div className="flex items-center gap-4 mb-10">
//                 <div className="bg-blue-600 p-4 rounded-3xl text-white shadow-xl shadow-blue-900/40">
//                   <Activity size={24} />
//                 </div>
//                 <div>
//                   <h3 className="text-xl font-black italic uppercase text-white">Verify</h3>
//                   <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Protocol Active</p>
//                 </div>
//               </div>
//               <div className="space-y-6">
//                 <div>
//                   <p className="text-[9px] font-black text-slate-400 uppercase mb-1 tracking-widest italic">Amount</p>
//                   <p className="text-4xl font-black italic text-white tracking-tighter">₹{selectedTx.amount}</p>
//                 </div>
//                 <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] text-white">
//                   <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest mb-2 italic">UTR Reference</p>
//                   <p className="font-mono text-lg font-bold tracking-widest break-all text-blue-100">{selectedTx.utr}</p>
//                 </div>
//                 <a href={`https://www.google.com/search?q=open+${selectedTx.method}+gateway`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white font-black py-4 rounded-2xl uppercase tracking-widest text-[10px] shadow-xl hover:bg-blue-500 transition-all italic active:scale-95">
//                   <ExternalLink size={14} /> Visit {selectedTx.method}
//                 </a >
//               </div >
//             </motion.div >
//           )}
//         </AnimatePresence >
//       </main >
//     </div >
//   );
// };

// // --- 4. THE APP CONTROLLER ---
// export default function App() {
//   const [loading, setLoading] = useState(true);
//   const [isAuth, setIsAuth] = useState(false);
//   const [toast, setToast] = useState({ show: false, amt: "" });

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     if (token) {
//       setIsAuth(true);
//     }
//     const timer = setTimeout(() => setLoading(false), 5000); 
//     return () => clearTimeout(timer);
//   }, []);

//  const handleLogout = async () => {
//     try {
//       // Hits your backend route you just fixed
//       await axios.post(`${import.meta.env.VITE_API_URL}/users/logout`, {}, { withCredentials: true });
//     } catch (error) {
//       console.error("Logout failed:", error);
//     } finally {
//       // Wipes the frontend memory and kicks user out
//       localStorage.removeItem("token");
//       setIsAuth(false);
//     }
//   };

//   const triggerToast = (amt) => {
//     setToast({ show: true, amt });
//     setTimeout(() => setToast({ show: false, amt: "" }), 4000);
//   };

//   return (
//     <div className="relative overflow-hidden">
//       <AnimatePresence mode="wait">
//         {loading ? (
//           <IntroLoader key="loader" />
//         ) : !isAuth ? (
//           <AuthScreen key="auth" onLogin={() => setIsAuth(true)} />
//         ) : (
//           <Dashboard 
//             key="dash" 
//             onNewTransaction={triggerToast} 
//             onLogout={handleLogout}
//           />
//         )}
//       </AnimatePresence>

//       <AnimatePresence>
//         {toast.show && (
//           <motion.div 
//             initial={{ y: 100, opacity: 0 }} 
//             animate={{ y: 0, opacity: 1 }} 
//             exit={{ y: 100, opacity: 0 }}
//             className="fixed bottom-10 right-10 bg-slate-900 text-white px-6 py-4 rounded-3xl shadow-2xl z-[1000] border border-blue-500/30 flex items-center gap-4"
//           >
//             <div className="bg-blue-600 p-2 rounded-full animate-bounce">
//               <CheckCircle2 size={16} />
//             </div>
//             <div>
//               <p className="text-[10px] font-black uppercase text-blue-400 tracking-widest">Success</p>
//               <p className="font-bold text-sm italic tracking-tighter">Verified ₹{toast.amt}</p>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }
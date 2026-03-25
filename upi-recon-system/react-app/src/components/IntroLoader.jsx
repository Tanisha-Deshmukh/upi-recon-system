import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';

export default function IntroLoader() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 1 } }}
      // A richer, slightly warmer Deep Blue background
      className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-[#01061a]"
    >
      {/* 👇 Right here is the slight size reduction: scale-[0.70] for mobile, scale-[1.00] for desktop */}
      <div className="relative flex items-center justify-center scale-[0.70] md:scale-[1.00] mb-24">
        
        {/* RING 1: Outer Petals - Deep Blue with Purple Glow */}
        {[...Array(24)].map((_, i) => (
          <motion.div
            key={`outer-${i}`}
            initial={{ scale: 0, opacity: 0, rotate: i * 15 }}
            animate={{ 
              scale: [0, 1.15, 1], 
              opacity: [0, 0.4, 0.15],
              rotate: [i * 15, i * 15 + 180] 
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear", delay: i * 0.01 }}
            className="absolute border-[0.8px] border-blue-400/30 blur-[1px]"
            style={{ 
              width: '450px', height: '140px', 
              borderRadius: '50% 50% 50% 50% / 100% 100% 0% 0%',
              transformOrigin: 'center center',
              background: 'linear-gradient(to top, rgba(30,64,175,0.3), rgba(147,51,234,0.1), transparent)'
            }}
          />
        ))}

        {/* RING 2: Middle Petals - Electric Blue & Violet */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={`mid-${i}`}
            initial={{ scale: 0, opacity: 0, rotate: i * 30 }}
            animate={{ 
              scale: [0, 1, 0.9], 
              opacity: [0, 0.6, 0.3],
              rotate: [i * 30, i * 30 - 360] 
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear", delay: 0.2 }}
            className="absolute border-[1.2px] border-blue-300/40 blur-[0.5px]"
            style={{ 
              width: '300px', height: '100px', 
              borderRadius: '50% 50% 50% 50% / 100% 100% 0% 0%',
              transformOrigin: 'center center',
              background: 'linear-gradient(to top, rgba(37,99,235,0.4), rgba(126,34,206,0.2), transparent)'
            }}
          />
        ))}

        {/* RING 3: Inner Core - Neon Blue & Amethyst Glow */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`inner-${i}`}
            initial={{ scale: 0, opacity: 0, rotate: i * 45 }}
            animate={{ 
              scale: [0, 1.2, 1], 
              opacity: [0, 0.9, 0.5],
              rotate: [i * 45, i * 45 + 90]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute bg-blue-600/20 blur-md shadow-[0_0_35px_rgba(59,130,246,0.6)]"
            style={{ 
              width: '160px', height: '80px', 
              borderRadius: '100% 0% 100% 0%',
              transformOrigin: 'center center' 
            }}
          />
        ))}

        {/* CENTRAL LOGO: Transparent Glassmorphism */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="relative z-10 bg-[#0a1128]/80 backdrop-blur-xl p-7 rounded-[2.5rem] shadow-[0_0_80px_rgba(37,99,235,0.4)] border border-blue-400/20"
        >
          <ShieldCheck size={50} className="text-blue-400 drop-shadow-[0_0_10px_rgba(147,51,234,0.8)]" />
        </motion.div>
        
        {/* Ambient Radial Background Glow */}
        <div className="absolute h-[500px] w-[500px] bg-blue-900/10 rounded-full blur-[120px]" />
      </div>

      {/* FIXED CAPTION */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-12 text-center w-full"
      >
        <h2 className="text-2xl font-black text-white tracking-[0.6em] uppercase italic opacity-90">
          RECON<span className="text-blue-500">PAY</span>
        </h2>
        <div className="h-[2px] w-16 bg-gradient-to-r from-transparent via-blue-600 to-transparent mx-auto mt-4 mb-3" />
        <p className="text-blue-400/50 text-[10px] font-black uppercase tracking-[0.5em]">
          Initializing Reconciliation Engine
        </p>
      </motion.div>
    </motion.div>
  );
}
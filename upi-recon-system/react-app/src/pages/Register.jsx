import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, CheckCircle, Loader2 } from 'lucide-react'
import axios from 'axios'

export default function Register() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // hitting recon backend
  const apiUrl = (import.meta.env.VITE_RECON_API_URL || 'http://localhost:8001/api/v1') + '/users'

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError(''); setSuccessMsg(''); setIsLoading(true);

    try {
      const res = await axios.post(`${apiUrl}/send-otp`, 
        { 
          email: email, 
          phoneNumber: phone 
        }, 
        { 
          // gotta set this content type or it fails
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true 
        }
      );
      
      if (res.data.success) {
        setSuccessMsg("OTP sent to your email!");
        setStep(2);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Check your backend console for errors.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(''); setIsLoading(true);

    try {
      const res = await axios.post(`${apiUrl}/register`, 
        {
          fullName, email, phone, password, otp
        }, 
        { 
          // strict header here as well
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true 
        }
      );

      if (res.data.success) {
        alert("Account Created Successfully!");
        navigate('/login');
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to register. Invalid OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex bg-slate-50">
      <section className="w-full flex flex-col items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-xl border border-slate-100">
          <div className="mb-8 text-center flex flex-col items-center">
            <div className="bg-blue-600 p-3 rounded-xl mb-4 shadow-md">
              <ShieldCheck className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
            <p className="text-gray-500 text-sm">Join PaySync to start reconciling your transactions.</p>
          </div>

          {error && <p className="text-red-600 text-sm p-3 mb-4 bg-red-50 rounded-lg border border-red-100">{error}</p>}
          {successMsg && <p className="text-green-600 text-sm p-3 mb-4 bg-green-50 rounded-lg border border-green-100 flex items-center gap-2"><CheckCircle className="w-4 h-4" /> {successMsg}</p>}

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.form key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} onSubmit={handleSendOtp} className="space-y-4">
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Full Name" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Email Address" />
                <input type="text" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} required className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Phone Number" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Password" />
                <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send OTP via Email'}
                </button>
              </motion.form>
            ) : (
              <motion.form key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} onSubmit={handleRegister} className="space-y-4">
                <input type="text" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} required className="w-full p-3 border rounded-lg text-center tracking-[0.5em] text-lg font-mono" placeholder="123456" />
                <button type="submit" disabled={isLoading || otp.length !== 6} className="w-full bg-slate-900 text-white py-3 rounded-xl font-semibold hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify & Register'}
                </button>
                <button type="button" onClick={() => setStep(1)} className="w-full text-sm text-slate-500 font-medium">← Back to details</button>
              </motion.form>
            )}
          </AnimatePresence>
          <div className="mt-8 text-center text-sm text-gray-600">Already have an account? <Link to="/login" className="font-semibold text-blue-600 hover:underline">Sign In</Link></div>
        </div>
      </section>
    </main>
  )
}
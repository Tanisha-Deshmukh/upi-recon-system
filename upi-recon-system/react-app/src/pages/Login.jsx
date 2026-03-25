import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShieldCheck, CheckCircle } from 'lucide-react'
import axios from 'axios'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
  const apiUrl = (import.meta.env.VITE_RECON_API_URL || 'http://localhost:8001/api/v1') + '/users'; 
      
      const response = await axios.post(
        `${apiUrl}/login`, 
        { email, password },
        { withCredentials: true }
      );

      if (response.data.success) {
        // saving user so the app knows we logged in
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials. Please try again.");
    }
  }

  return (
    <main className="min-h-screen flex">
      {/* hero sidebar */}
      <section className="hidden lg:flex lg:w-1/2 relative bg-primary items-center justify-center p-12 overflow-hidden">
        {/* Gradient bg */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-primary to-blue-700 opacity-90" />
        {/* Decorative blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-400/20 rounded-full blur-3xl" />

        <div className="relative z-10 text-white max-w-lg">
          {/* Logo icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-8 bg-white/10 w-16 h-16 rounded-custom flex items-center justify-center backdrop-blur-md border border-white/20"
          >
            <ShieldCheck className="w-10 h-10 text-white" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-bold mb-6 leading-tight"
          >
            Automate your financial reconciliation.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xl text-blue-100 mb-8"
          >
            Connect your bank accounts, sync transactions, and resolve
            discrepancies in seconds with our premium AI-driven platform.
          </motion.p>

          <motion.ul
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            {['Real-time banking sync', 'Intelligent match suggestions', 'Enterprise-grade security'].map((feat) => (
              <li key={feat} className="flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 text-blue-300 flex-shrink-0" />
                <span className="text-lg">{feat}</span>
              </li>
            ))}
          </motion.ul>
        </div>
      </section>

      {/* actual login form */}
      <section className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12 md:p-24 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden mb-12 flex justify-center">
            <div className="bg-primary p-3 rounded-custom">
              <ShieldCheck className="h-8 w-8 text-white" />
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-10 text-center lg:text-left">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
              <p className="text-gray-500">Please enter your details to access your dashboard.</p>
              
              {/* show errors if any */}
              {error && (
                <p className="text-red-500 text-sm mt-3 font-medium p-3 bg-red-50 rounded-custom border border-red-100">
                  {error}
                </p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  className="input-field"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700" htmlFor="password">
                    Password
                  </label>
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="input-field"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-4 w-4 text-primary border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700 select-none">Remember me</span>
                </label>
                <a href="#" className="text-sm font-medium text-primary hover:underline">
                  Forgot password?
                </a>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-primary text-white py-3.5 px-4 rounded-custom font-semibold text-lg hover:bg-primary-hover focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all duration-200 shadow-lg shadow-blue-900/10"
                >
                  Sign In
                </button>
              </div>
            </form>

            {/* Divider */}
            <div className="mt-8 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            {/* Social buttons */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center px-4 py-2.5 border border-gray-300 rounded-custom hover:bg-gray-50 transition-colors duration-200">
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.90 3.16-1.64 4.04-1.12 1.12-2.84 2.32-5.64 2.32-4.52 0-8.24-3.64-8.24-8.24s3.72-8.24 8.24-8.24c2.48 0 4.28.96 5.64 2.32l2.32-2.32C19.32 2.36 16.4 1 12.48 1 5.6 1 0 6.6 0 13.5s5.6 12.5 12.48 12.5c3.72 0 6.52-1.24 8.76-3.56 2.32-2.32 3.04-5.56 3.04-8.2 0-.6-.04-1.16-.12-1.64h-11.68z" fill="#EA4335" />
                </svg>
                <span className="text-sm font-medium text-gray-700">Google</span>
              </button>
              <button className="flex items-center justify-center px-4 py-2.5 border border-gray-300 rounded-custom hover:bg-gray-50 transition-colors duration-200">
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
                <span className="text-sm font-medium text-gray-700">Facebook</span>
              </button>
            </div>

            <div className="mt-10 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link to="/register" className="font-semibold text-primary hover:underline">
                  Create an account
                </Link>
                <a href="#" className="font-semibold text-primary hover:underline">
                  Create an account
                </a>
              </p>
            </div>
          </motion.div>

          <footer className="mt-auto pt-10 text-xs text-gray-400 text-center">
            © 2024 PaySync Technologies. All rights reserved.
          </footer>
        </div>
      </section>
    </main>
  )
}

import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'

// Layout & Pages
import Register from './pages/Register'
import AppLayout from './components/layout/AppLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Payments from './pages/Payments'
import Notifications from './pages/Notifications'
import Reports from './pages/Reports'
import BankConnections from './pages/BankConnections'
import Settings from './pages/Settings'
import FastPay from './pages/FastPay'

// Loaders & Security
import IntroLoader from './components/IntroLoader' 
import ProtectedRoute from './components/auth/ProtectedRoute' // 👇 NEW: Import the bouncer
import axios from 'axios'

// Helper to convert VAPID key
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}



function App() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // This keeps the loader on screen for exactly 5 seconds
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 5000)
    
    return () => clearTimeout(timer)
  }, [])

  // ✅ Web Push Registration
  useEffect(() => {
    const registerPush = async () => {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        try {
          // 1. Register Service Worker
          const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/'
          });
          console.log('Service Worker registered');

          // 2. Wait for service worker to be ready
          const activeReg = await navigator.serviceWorker.ready;
          
          // 3. Define the subscription trigger
          window.triggerPushSubscription = async () => {
            try {
              // 🔴 EXPLICITLY request permission if not already granted. Must happen on user click!
              const permission = await Notification.requestPermission();
              if (permission !== 'granted') {
                console.error('❌ Push notification permission denied.');
                return 'denied';
              }

              let sub = await activeReg.pushManager.getSubscription();
              if (!sub) {
                const publicVapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY || "BOv58v_3DS9gYtNJbqyArK66saENo7rSWoJnXdB177GHlJdrDyWqMc0Kh1_O722rFoiKlOQL8eWY7pq0c5ntrmo";
                const convertedVapidKey = urlBase64ToUint8Array(publicVapidKey);
                sub = await activeReg.pushManager.subscribe({
                  userVisibleOnly: true,
                  applicationServerKey: convertedVapidKey
                });
                console.log('✅ User subscribed to push');
              }
              window.pushSubscription = sub;
              
              // Save push subscription to database
              try {
                const response = await axios.post(`${import.meta.env.VITE_RECON_API_URL}/users/subscribe-push`, {
                  subscription: sub
                }, {
                  withCredentials: true
                });
                console.log('✅ Push subscription saved to DB');
              } catch (error) {
                console.error('❌ Failed to save push subscription:', error);
              }
              
              return sub;
            } catch (err) {
              console.error('❌ Push subscription failed:', err);
              return null;
            }
          };

          // Auto-trigger ONLY if they already granted permission in the past
          // This prevents Chrome/Edge from silently blocking the prompt
          if (Notification.permission === 'granted') {
             await window.triggerPushSubscription();
          }
        } catch (error) {
            console.error('❌ Service Worker registration failed:', error);
        }
      }
    };

    registerPush();
  }, []);

  return (
    <>
      <AnimatePresence>
        {isLoading && <IntroLoader key="loader" />}
      </AnimatePresence>

      <Routes>
        {/* 🟢 PUBLIC ROUTES (Anyone can see these) */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* 🔴 PROTECTED ROUTES (Requires Login) */}
        {/* We wrap AppLayout so EVERYTHING inside it is protected automatically */}
        <Route 
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/banks" element={<BankConnections />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/fastpay" element={<FastPay />} />
        </Route>

        {/* Catch-all: If they type a weird URL, send them to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  )
}

export default App
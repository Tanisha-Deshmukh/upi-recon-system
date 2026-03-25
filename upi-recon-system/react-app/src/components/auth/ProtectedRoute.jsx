import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

export default function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const validateSession = async () => {
      try {
        const apiUrl = (import.meta.env.VITE_RECON_API_URL || 'http://localhost:8001/api/v1') + '/users';
        await axios.get(`${apiUrl}/validate`, { withCredentials: true });
        setIsAuthenticated(true);
      } catch (error) {
        setIsAuthenticated(false);
        localStorage.removeItem('user'); // Clean up any fake local injections
      }
    };
    validateSession();
  }, []);

  if (isAuthenticated === null) {
    // Show a minimal loader while validating the secure HttpOnly cookie
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
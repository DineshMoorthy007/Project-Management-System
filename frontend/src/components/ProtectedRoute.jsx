import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-4 h-4 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-4 h-4 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-4 h-4 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '0.3s' }}></div>
        </div>
        <p className="mt-4 text-slate-400 font-medium tracking-wide text-sm animate-pulse">Verifying credentials...</p>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;

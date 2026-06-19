import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// 1. THIS IS THE MAGIC FIX: Point all axios requests to your environment variable
axios.defaults.baseURL = import.meta.env.VITE_API_URL;

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize: restore state from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
        
        // Configure axios defaults
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { token: receivedToken, user: receivedUser } = response.data.data;
      
      localStorage.setItem('token', receivedToken);
      localStorage.setItem('user', JSON.stringify(receivedUser));
      
      setToken(receivedToken);
      setUser(receivedUser);
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${receivedToken}`;
      return receivedUser;
    } catch (error) {
      throw error.response?.data?.message || error.response?.data?.error || 'Login failed. Please check your credentials.';
    }
  };

  const register = async (fullName, email, password) => {
    try {
      const response = await axios.post('/api/auth/register', { fullName, email, password });
      return response.data;
    } catch (error) {
      if (error.response?.data?.details) {
        throw error.response.data.details;
      }
      throw error.response?.data?.message || error.response?.data?.error || 'Registration failed.';
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await axios.post('/api/auth/logout', {});
      }
    } catch (error) {
      console.warn('Server logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
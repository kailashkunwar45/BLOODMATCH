import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Set API base URL: Use env variable or default to /api for relative paths in production
  const API_URL = import.meta.env.VITE_API_URL || '/api';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserProfile(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async (token) => {
    try {
      const { data } = await axios.get(`${API_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser({ ...data, token });
    } catch (error) {
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const { data } = await axios.post(`${API_URL}/auth/login`, { email, password });
    if (data.success) {
      localStorage.setItem('token', data.token);
      setUser(data);
    }
    return data;
  };

  const register = async (userData) => {
    const { data } = await axios.post(`${API_URL}/auth/register`, userData);
    if (data.success) {
      localStorage.setItem('token', data.token);
      setUser(data);
    }
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateProfile = async (userData) => {
    const { data } = await axios.put(`${API_URL}/auth/profile`, userData, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    if (data.success) {
      setUser(data);
    }
    return data;
  };

  const [dashboardMode, setDashboardMode] = useState('receive'); // 'receive' or 'donate'

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile, API_URL, dashboardMode, setDashboardMode }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

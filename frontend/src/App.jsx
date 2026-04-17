import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import HospitalDashboard from './pages/HospitalDashboard';
import Profile from './pages/Profile';

// Protected Route Wrapper
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="loading">Loading platform...</div>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" />;

  return children;
};

const DashboardRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  
  switch (user.role) {
    case 'user':
    case 'donor': 
    case 'patient': return <Navigate to="/user" />;
    case 'admin': return <Navigate to="/admin" />;
    case 'hospital_admin': return <Navigate to="/hospital" />;
    default: return <Navigate to="/login" />;
  }
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <div className="App">
            <Navbar />
            <main className="container main-content">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<DashboardRedirect />} />
                
                <Route path="/user" element={
                  <ProtectedRoute roles={['user', 'donor', 'patient']}><UserDashboard /></ProtectedRoute>
                } />
                <Route path="/admin" element={
                  <ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>
                } />
                <Route path="/hospital" element={
                  <ProtectedRoute roles={['hospital_admin']}><HospitalDashboard /></ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute><Profile /></ProtectedRoute>
                } />

                <Route path="/" element={<Home />} />
              </Routes>
            </main>
          </div>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;

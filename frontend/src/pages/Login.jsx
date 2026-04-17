import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { LogIn, Mail, Lock } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const data = await login(email, password);
      if (data.success) {
        showSuccess('Welcome back!');
        navigate('/dashboard');
      } else {
        showError(data.message || 'Login failed');
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container fade-in">
      <div className="auth-card card glass">
        <div className="auth-header">
          <div className="auth-icon">🩸</div>
          <h2>Welcome Back</h2>
          <p>Login to save or find a match.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label><Mail size={16} /> Email Address</label>
            <input 
              type="email" 
              className="form-control" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              placeholder="name@example.com"
            />
          </div>
          <div className="form-group">
            <label><Lock size={16} /> Password</label>
            <input 
              type="password" 
              className="form-control" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              placeholder="••••••••"
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Logging in...' : <><LogIn size={18} /> Login</>}
          </button>
        </form>

        <div className="auth-footer" style={{ marginTop: '24px', textAlign: 'center' }}>
          <p>Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: '700' }}>Register here</Link></p>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .auth-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: calc(100vh - 160px);
        }
        .auth-card {
          width: 100%;
          max-width: 450px;
        }
        .auth-header {
          text-align: center;
          margin-bottom: 32px;
        }
        .auth-icon {
          font-size: 3rem;
          margin-bottom: 16px;
        }
        .auth-header h2 {
          font-size: 1.8rem;
          margin-bottom: 8px;
        }
        .form-group label {
          display: flex;
          align-items: center;
          gap: 8px;
        }
      `}} />
    </div>
  );
};

export default Login;

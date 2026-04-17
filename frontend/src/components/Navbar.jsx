import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, LayoutDashboard, User as UserIcon } from 'lucide-react';

const Navbar = () => {
  const { user, logout, dashboardMode, setDashboardMode } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar glass">
      <div className="container nav-content">
        <Link to="/" className="logo">
          <span className="logo-icon">🩸</span> BloodMatcher
        </Link>
        
        {user && ['user', 'donor', 'patient'].includes(user.role) && (
          <div className="mode-toggle" style={{ display: 'flex', gap: '8px', background: 'var(--light-gray)', padding: '4px', borderRadius: '12px' }}>
            <button 
              className={`btn btn-small ${dashboardMode === 'receive' ? 'btn-primary' : 'btn-outline'}`}
              style={{ border: 'none' }}
              onClick={() => setDashboardMode('receive')}
            >
              Need Blood
            </button>
            <button 
              className={`btn btn-small ${dashboardMode === 'donate' ? 'btn-primary' : 'btn-outline'}`}
              style={{ border: 'none' }}
              onClick={() => setDashboardMode('donate')}
            >
              Want to Donate
            </button>
          </div>
        )}

        <ul className="nav-links">
          {user ? (
            <>
              <li>
                <Link to="/dashboard" className="nav-item">
                  <LayoutDashboard size={18} /> Dashboard
                </Link>
              </li>
              <li>
                <Link to="/profile" className="nav-item user-badge" style={{ display: 'flex', gap: '6px', alignItems: 'center', cursor: 'pointer', textDecoration: 'none' }}>
                  <UserIcon size={14} /> Profile
                </Link>
              </li>
              <li>
                <button onClick={handleLogout} className="btn btn-outline btn-small">
                  <LogOut size={16} /> Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/register" className="btn btn-primary">Register</Link></li>
            </>
          )}
        </ul>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        .navbar {
          height: 80px;
          display: flex;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 1000;
        }
        .nav-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .nav-links {
          display: flex;
          align-items: center;
          list-style: none;
          gap: 24px;
        }
        .nav-item {
          display: flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          color: var(--gray);
          font-weight: 600;
        }
        .nav-item:hover { color: var(--primary); }
      `}} />
    </nav>
  );
};

export default Navbar;

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Mail, Lock, User, Phone, Building, Hash } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const Register = () => {
  const [tab, setTab] = useState('user'); // 'user' | 'hospital'

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    contact: '',
    role: 'user',
    bloodGroup: 'A+',
    hospitalName: '',
    registrationNumber: '',
    city: ''
  });
  
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTabSwitch = (newTab) => {
    setTab(newTab);
    setFormData(prev => ({ ...prev, role: newTab === 'hospital' ? 'hospital_admin' : 'user' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const data = await register(formData);
      if (data.success) {
        showSuccess('Registration successful! Welcome aboard.');
        navigate('/dashboard');
      } else {
        showError(data.message || 'Registration failed');
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container fade-in">
      <div className="auth-card card glass" style={{ maxWidth: '550px' }}>
        <div className="auth-header" style={{ marginBottom: '24px' }}>
          <div className="auth-icon" style={{ fontSize: '3rem', marginBottom: '12px' }}>🩸</div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Create Account</h2>
          <p style={{ color: 'var(--gray)' }}>Join the life-saving community today.</p>
        </div>

        {/* Custom Tabs */}
        <div style={{ display: 'flex', gap: '8px', background: 'var(--light-gray)', padding: '6px', borderRadius: '14px', marginBottom: '24px' }}>
          <button 
            type="button"
            className={`btn ${tab === 'user' ? 'btn-primary' : 'btn-outline'}`}
            style={{ flex: 1, border: 'none', borderRadius: '10px' }}
            onClick={() => handleTabSwitch('user')}
          >
            <User size={16} /> Regular User
          </button>
          <button 
            type="button"
            className={`btn ${tab === 'hospital' ? 'btn-primary' : 'btn-outline'}`}
            style={{ flex: 1, border: 'none', borderRadius: '10px' }}
            onClick={() => handleTabSwitch('hospital')}
          >
            <Building size={16} /> Health Institution
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Shared Admin/User Form Fields */}
          <div className="form-group">
            <label><User size={16} /> {tab === 'hospital' ? 'Admin Full Name' : 'Full Name'}</label>
            <input name="name" type="text" className="form-control" value={formData.name} onChange={handleChange} required placeholder="John Doe" />
          </div>
          <div className="form-group">
            <label><Mail size={16} /> {tab === 'hospital' ? 'Admin Email Address' : 'Email Address'}</label>
            <input name="email" type="email" className="form-control" value={formData.email} onChange={handleChange} required placeholder="name@example.com" />
          </div>
          <div className="form-group">
            <label><Lock size={16} /> Password</label>
            <input name="password" type="password" className="form-control" value={formData.password} onChange={handleChange} required placeholder="••••••••" />
          </div>
          <div className="form-group">
            <label><Phone size={16} /> Contact Number</label>
            <input name="contact" type="text" className="form-control" value={formData.contact} onChange={handleChange} required placeholder="+977-9800000000" />
          </div>

          {/* Conditional Rendering Based on Tab */}
          {tab === 'user' ? (
            <div className="form-group fade-in">
              <label><UserPlus size={16} /> Blood Group (Crucial for Emergencies)</label>
              <select name="bloodGroup" className="form-control" value={formData.bloodGroup} onChange={handleChange}>
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
              </select>
            </div>
          ) : (
            <div className="fade-in" style={{ padding: '16px', background: '#F8FAFC', borderRadius: '12px', marginBottom: '20px', border: '1px solid #E2E8F0' }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--primary-dark)' }}>
                <Building size={18} /> Institution Details
              </h4>
              <div className="form-group">
                <label>Hospital/Blood Bank Name</label>
                <input name="hospitalName" type="text" className="form-control" value={formData.hospitalName} onChange={handleChange} required={tab==='hospital'} placeholder="Nepal Red Cross Society..." />
              </div>
              <div className="form-group">
                <label><Hash size={16} /> Govt. Registration Number</label>
                <input name="registrationNumber" type="text" className="form-control" value={formData.registrationNumber} onChange={handleChange} required={tab==='hospital'} placeholder="e.g. NRCS-CBTS-001" />
                <small style={{ color: 'var(--gray)', marginTop: '4px', display: 'block' }}>Must match your official operating license.</small>
              </div>
              <div className="form-group">
                <label>City / Location</label>
                <input name="city" type="text" className="form-control" value={formData.city} onChange={handleChange} required={tab==='hospital'} placeholder="Kathmandu" />
              </div>
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', fontSize: '1rem', marginTop: '12px' }} disabled={loading}>
            {loading ? 'Processing Registration...' : <><UserPlus size={18} /> Create Account</>}
          </button>
        </form>

        <div className="auth-footer" style={{ marginTop: '24px', textAlign: 'center' }}>
          <p>Already joined? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '700' }}>Login seamlessly</Link></p>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .auth-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: calc(100vh - 160px);
          padding: 40px 24px;
        }
        .auth-header { text-align: center; }
      `}} />
    </div>
  );
};

export default Register;

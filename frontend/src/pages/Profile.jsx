import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, Lock, Save, Droplet } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { showSuccess, showError } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    bloodGroup: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        contact: user.contact || '',
        bloodGroup: user.bloodGroup || '',
        password: ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const payload = { ...formData };
    if (!payload.password) delete payload.password;

    try {
      await updateProfile(payload);
      showSuccess('Profile updated successfully!');
      setFormData(prev => ({ ...prev, password: '' }));
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="loading">Loading Profile...</div>;

  return (
    <div className="container fade-in" style={{ padding: '40px 24px', maxWidth: '700px' }}>
      <div className="card glass">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
          <div style={{ width: '80px', height: '80px', background: 'var(--primary-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-dark)' }}>
            <User size={40} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.8rem', lineHeight: 1.2 }}>{user.name}</h1>
            <p style={{ color: 'var(--gray)', textTransform: 'capitalize' }}>{user.role} Account • {user.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label><User size={16} /> Full Name</label>
              <input name="name" type="text" className="form-control" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label><Phone size={16} /> Contact Number</label>
              <input name="contact" type="text" className="form-control" value={formData.contact} onChange={handleChange} required />
            </div>
            
            {user.role === 'user' && (
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label><Droplet size={16} /> Blood Group</label>
                <select name="bloodGroup" className="form-control" value={formData.bloodGroup} onChange={handleChange}>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                </select>
              </div>
            )}
            
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label><Lock size={16} /> Update Password</label>
              <input name="password" type="password" className="form-control" placeholder="Leave blank to keep same" value={formData.password} onChange={handleChange} />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: '14px' }}>
            {loading ? 'Saving Changes...' : <><Save size={18} /> Save Profile Updates</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { MapPin, Droplet, User, Phone, CheckCircle, Clock } from 'lucide-react';

const DonorDashboard = () => {
  const { user, API_URL } = useAuth();
  const [profile, setProfile] = useState({
    bloodGroup: 'A+',
    contact: '',
    city: '',
    coordinates: [85.324, 27.717], // Default [lng, lat]
    availability: true
  });
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');



  const fetchProfile = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_URL}/donors/profile`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (data.donor) {
        setProfile({
          bloodGroup: data.donor.bloodGroup,
          contact: data.donor.contact,
          city: data.donor.city,
          coordinates: data.donor.location.coordinates,
          availability: data.donor.availability
        });
      }
    } catch (err) { console.error(err); }
  }, [API_URL, user.token]);

  const fetchMatches = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_URL}/requests/donor-matches`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setMatches(data.requests);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, [API_URL, user.token]);

  useEffect(() => {
    fetchProfile();
    fetchMatches();
  }, [fetchProfile, fetchMatches]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/donors/update`, profile, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) { console.error(err); }
  };

  const handleStatusUpdate = async (requestId, status) => {
    try {
      await axios.post(`${API_URL}/requests/update-match`, { requestId, status }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      fetchMatches();
    } catch (err) { console.error(err); }
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setProfile({ ...profile, coordinates: [pos.coords.longitude, pos.coords.latitude] });
      });
    }
  };

  return (
    <div className="dashboard fade-in">
      <div className="dashboard-header">
        <h1>Donor Dashboard</h1>
        <p>Welcome, {user.name}. Manage your availability and view matches below.</p>
      </div>

      {success && <div className="alert alert-success">{success}</div>}

      <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '32px' }}>
        {/* Profile Card */}
        <div className="card glass">
          <h3>Manage Profile 🩹</h3>
          <form onSubmit={handleUpdateProfile}>
            <div className="form-group">
              <label><Droplet size={16} /> Blood Group</label>
              <select 
                className="form-control"
                value={profile.bloodGroup}
                onChange={(e) => setProfile({ ...profile, bloodGroup: e.target.value })}
              >
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label><Phone size={16} /> Contact Number</label>
              <input 
                className="form-control"
                value={profile.contact}
                onChange={(e) => setProfile({ ...profile, contact: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>City</label>
              <input 
                className="form-control"
                value={profile.city}
                onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                required
              />
            </div>
            <button type="button" onClick={getLocation} className="btn btn-outline" style={{ width: '100%', marginBottom: '12px' }}>
              <MapPin size={16} /> Update Coordinates
            </button>
            <div className="form-group">
              <label>Availability</label>
              <select 
                className="form-control"
                value={profile.availability ? "1" : "0"}
                onChange={(e) => setProfile({ ...profile, availability: e.target.value === "1" })}
              >
                <option value="1">Available</option>
                <option value="0">Busy / Not Available</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Save Details</button>
          </form>
        </div>

        {/* Requests Card */}
        <div className="card glass">
          <h3>Matching Emergency Requests 🚨</h3>
          {loading ? <p>Loading matches...</p> : (
            <div className="matches-list">
              {matches.length === 0 ? <p className="text-gray">No active matches found. Thank you for staying ready!</p> : (
                matches.map(req => (
                  <div key={req._id} className="match-card glass" style={{ padding: '16px', borderRadius: '12px', marginBottom: '16px', border: '1px solid var(--primary-light)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span className={`badge badge-${req.urgency}`}>{req.urgency}</span>
                        <h4 style={{ marginTop: '8px' }}>Patient: {req.patient.name}</h4>
                        <p><MapPin size={14} /> Hospital: {req.hospital?.name || 'Home Request'}</p>
                        <p><Clock size={14} /> {new Date(req.created_at).toLocaleString()}</p>
                      </div>
                      <div className="actions" style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => handleStatusUpdate(req._id, 'accepted')} className="btn btn-primary">Accept</button>
                        <button onClick={() => handleStatusUpdate(req._id, 'rejected')} className="btn btn-outline">Ignore</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DonorDashboard;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { MapPin, Droplet, User, Phone, CheckCircle, Clock } from 'lucide-react';

const PatientDashboard = () => {
  const { user, API_URL } = useAuth();
  const [requests, setRequests] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [formData, setFormData] = useState({
    bloodGroup: 'A+',
    hospital: '',
    coordinates: [85.324, 27.717], // [lng, lat]
    urgency: 'high'
  });
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchRequests();
    fetchHospitals();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/requests/my-requests`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setRequests(data.requests);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const fetchHospitals = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/hospitals/all`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setHospitals(data.hospitals);
      if (data.hospitals.length > 0) setFormData(prev => ({ ...prev, hospital: data.hospitals[0]._id }));
    } catch (err) { console.error(err); }
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await axios.post(`${API_URL}/requests/create`, formData, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setSuccess('Emergency request posted successfully! Notifying donors...');
      fetchRequests();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) { console.error(err); } finally { setFormLoading(false); }
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setFormData({ ...formData, coordinates: [pos.coords.longitude, pos.coords.latitude] });
      });
    }
  };

  return (
    <div className="dashboard fade-in">
      <div className="dashboard-header">
        <h1>Patient Dashboard</h1>
        <p>Post emergency blood requests and track donor matches in real-time.</p>
      </div>

      {success && <div className="alert alert-success">{success}</div>}

      <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '32px' }}>
        {/* Post Request Card */}
        <div className="card glass">
          <h3>Create Emergency Request 🩸</h3>
          <form onSubmit={handleCreateRequest}>
            <div className="form-group">
              <label><Droplet size={16} /> Blood Group Needed</label>
              <select 
                className="form-control"
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
              >
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label><MapPin size={16} /> Select Preferred Hospital</label>
              <select 
                className="form-control"
                value={formData.hospital}
                onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
              >
                <option value="">None / Home Request</option>
                {hospitals.map(h => <option key={h._id} value={h._id}>{h.name} ({h.city})</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Urgency Level</label>
              <select 
                className="form-control"
                value={formData.urgency}
                onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
              >
                <option value="low">Low (Next few days)</option>
                <option value="medium">Medium (Today)</option>
                <option value="high">High (Immediate)</option>
                <option value="critical">Critical (Emergency)</option>
              </select>
            </div>
            <button type="button" onClick={getLocation} className="btn btn-outline" style={{ width: '100%', marginBottom: '16px' }}>
              <MapPin size={16} /> Update Coordinates
            </button>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={formLoading}>
              {formLoading ? 'Creating...' : 'Post Request'}
            </button>
          </form>
        </div>

        {/* Requests & Tracking Card */}
        <div className="card glass">
          <h3>Your Requests & Donor Matches 🤝</h3>
          {loading ? <p>Loading your requests...</p> : (
            <div className="requests-history">
              {requests.length === 0 ? <p className="text-gray">You haven't posted any requests yet.</p> : (
                requests.map(req => (
                  <div key={req._id} className="request-card glass" style={{ padding: '20px', borderRadius: '12px', marginBottom: '16px', border: '1px solid rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span className={`badge badge-${req.urgency}`}>{req.urgency}</span>
                      <span className={`badge badge-${req.status}`}>{req.status}</span>
                    </div>
                    <h4>{req.bloodGroup} Blood Request</h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--gray)' }}>Posted on: {new Date(req.created_at).toLocaleString()}</p>
                    
                    {/* Matches Details */}
                    <div className="matches-grid" style={{ marginTop: '16px', borderTop: '1px solid #eee', paddingTop: '16px' }}>
                      <p style={{ fontWeight: '600', marginBottom: '8px' }}>Donor Matches Found ({req.matches.length}):</p>
                      {req.matches.length === 0 ? <p style={{ fontSize: '0.85rem' }}>Finding nearest donors... ⏳</p> : (
                        req.matches.map(m => (
                          <div key={m.donor._id} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#F8FAFC', padding: '10px', borderRadius: '8px', marginBottom: '8px' }}>
                            <div className={`badge badge-${m.status}`} style={{ minWidth: '80px', textAlign: 'center' }}>{m.status}</div>
                            <div>
                               <p style={{ fontWeight: '500' }}>Contact Donor: {m.status === 'accepted' ? m.donor.contact : 'Hidden until acceptance'}</p>
                            </div>
                          </div>
                        ))
                      )}
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

export default PatientDashboard;

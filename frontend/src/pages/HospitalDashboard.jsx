import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { MapPin, Building, Phone, Clock, FileText, Navigation } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const HospitalDashboard = () => {
  const { user, API_URL } = useAuth();
  const { showSuccess, showError } = useToast();
  const [hospital, setHospital] = useState({
    name: '',
    address: '',
    city: '',
    contact: '',
    coordinates: [85.324, 27.717]
  });
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHospital();
    fetchLinkedRequests();
  }, []);

  const fetchLinkedRequests = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/requests/hospital-requests`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setRequests(data.requests);
    } catch (err) { console.error(err); } 
  };

  const fetchHospital = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/hospitals/profile`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (data.hospital) {
        setHospital({
          name: data.hospital.name,
          address: data.hospital.address,
          city: data.hospital.city,
          contact: data.hospital.contact,
          coordinates: data.hospital.location.coordinates
        });
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/hospitals/update`, hospital, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      showSuccess('Hospital details updated successfully!');
    } catch (err) { 
      showError(err.response?.data?.message || 'Failed to update hospital');
    }
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setHospital({ ...hospital, coordinates: [pos.coords.longitude, pos.coords.latitude] });
        showSuccess('Coordinates updated from your location!');
      }, () => {
        showError('Could not access location');
      });
    }
  };

  return (
    <div className="dashboard fade-in">
      <div className="dashboard-header">
        <h1>Hospital Dashboard</h1>
        <p>Manage your hospital profile and view linked emergency requests.</p>
      </div>

      <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px' }}>
        {/* Hospital Profile Card */}
        <div className="card glass">
          <h3>Hospital Profile 🏥</h3>
          <form onSubmit={handleUpdate}>
            <div className="form-group">
              <label><Building size={16} /> Hospital Name</label>
              <input 
                className="form-control"
                value={hospital.name}
                onChange={(e) => setHospital({ ...hospital, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label><MapPin size={16} /> Address</label>
              <input 
                className="form-control"
                value={hospital.address}
                onChange={(e) => setHospital({ ...hospital, address: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>City</label>
              <input 
                className="form-control"
                value={hospital.city}
                onChange={(e) => setHospital({ ...hospital, city: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label><Phone size={16} /> Contact Number</label>
              <input 
                className="form-control"
                value={hospital.contact}
                onChange={(e) => setHospital({ ...hospital, contact: e.target.value })}
                required
              />
            </div>
            <button type="button" onClick={getLocation} className="btn btn-outline" style={{ width: '100%', marginBottom: '16px' }}>
              <MapPin size={16} /> Update Coordinates
            </button>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Update Details</button>
          </form>
        </div>

        {/* Linked Requests Table Card */}
        <div className="card glass">
          <h3>Requests Linked to Hospital 🩸</h3>
          <div className="table-wrapper" style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '16px' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', textAlign: 'left' }}>
                   <th style={{ padding: '12px' }}>Patient</th>
                   <th style={{ padding: '12px' }}>Blood Group</th>
                   <th style={{ padding: '12px' }}>Urgency</th>
                   <th style={{ padding: '12px' }}>Status</th>
                   <th style={{ padding: '12px' }}>Time</th>
                </tr>
              </thead>
              <tbody>
                {requests.length === 0 ? (
                  <tr><td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: 'var(--gray)' }}>No active requests linked yet.</td></tr>
                ) : (
                  requests.map(req => (
                    <tr key={req._id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '12px' }}>{req.patient.name}</td>
                      <td style={{ padding: '12px' }}><span className="badge badge-blood">{req.bloodGroup}</span></td>
                      <td style={{ padding: '12px' }}><span className={`badge badge-${req.urgency}`}>{req.urgency}</span></td>
                      <td style={{ padding: '12px' }}><span className={`badge badge-${req.status}`}>{req.status}</span></td>
                      <td style={{ padding: '12px' }}>{new Date(req.created_at).toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalDashboard;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { MapPin, Droplet, Clock, CheckCircle, Navigation, Bell } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useToast } from '../context/ToastContext';

// Fix leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LocationPicker = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return position ? <Marker position={position}><Popup>Selected Location</Popup></Marker> : null;
};

const UserDashboard = () => {
  const { user, API_URL, dashboardMode } = useAuth();
  const { showSuccess, showError } = useToast();
  
  // Requests Feed State
  const [activeRequests, setActiveRequests] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [bloodAvailability, setBloodAvailability] = useState({});
  const [hospitals, setHospitals] = useState([]);
  
  // Location State
  const [position, setPosition] = useState([27.7172, 85.3240]); // Default Kathmandu
  const [geoLoading, setGeoLoading] = useState(false);
  
  // Request Form State
  const [requestForm, setRequestForm] = useState({
    bloodGroup: user?.bloodGroup || 'A+',
    hospital: '',
    urgency: 'high'
  });
  const [requestLoading, setRequestLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchGlobalData();
    fetchNotifications();
    if (dashboardMode === 'receive') {
      fetchMyRequests();
    }
  }, [dashboardMode]);

  const fetchNotifications = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/notifications/my`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setNotifications(data.notifications);
    } catch (err) { console.error(err); }
  };

  const fetchGlobalData = async () => {
    try {
      const headers = { Authorization: `Bearer ${user.token}` };
      const [reqs, avail, hosps] = await Promise.all([
        axios.get(`${API_URL}/requests/all-active`, { headers }),
        axios.get(`${API_URL}/requests/availability`, { headers }),
        axios.get(`${API_URL}/hospitals/all`, { headers })
      ]);
      setActiveRequests(reqs.data.requests);
      setBloodAvailability(avail.data.availability);
      setHospitals(hosps.data.hospitals);
      
      if (hosps.data.hospitals.length > 0) {
        setRequestForm(prev => ({ ...prev, hospital: hosps.data.hospitals[0]._id }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMyRequests = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/requests/my-requests`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setMyRequests(data.requests);
    } catch (err) {
      console.error(err);
    }
  };

  const getUserLocation = () => {
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition([pos.coords.latitude, pos.coords.longitude]);
        setGeoLoading(false);
        showSuccess("Location acquired successfully");
      },
      (err) => {
        console.error(err);
        setGeoLoading(false);
        showError('Could not get location. Please select on the map.');
      }
    );
  };

  const handlePostRequest = async (e) => {
    e.preventDefault();
    setRequestLoading(true);
    try {
      await axios.post(`${API_URL}/requests/create`, {
        ...requestForm,
        coordinates: [position[1], position[0]] // Format [lng, lat] for Geospatial
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      showSuccess('Emergency request posted successfully!');
      fetchMyRequests();
      fetchGlobalData();
    } catch (err) {
      console.error(err);
      showError('Failed to post request.');
    } finally {
      setRequestLoading(false);
    }
  };

  const handleDonate = async (requestId) => {
    try {
      await axios.post(`${API_URL}/requests/offer-donation`, { requestId }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      showSuccess('Donation offer sent! The requester has been notified with your contact details.');
      fetchGlobalData();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to offer donation');
    }
  };

  return (
    <div className="dashboard fade-in">
      <div className="dashboard-header">
        <h1>{dashboardMode === 'receive' ? 'Patient Dashboard' : 'Donor Dashboard'}</h1>
        <p>
          {dashboardMode === 'receive' 
            ? 'Request blood, check availability, and track donor matches.'
            : 'Find nearby emergency requests and save lives.'}
        </p>
      </div>

      {dashboardMode === 'receive' && (
        <div style={{ padding: '16px', background: 'var(--primary-light)', borderRadius: '12px', marginBottom: '24px' }}>
          <h4 style={{ color: 'var(--primary-dark)', marginBottom: '12px' }}>System Blood Availability Profiles:</h4>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
              <span key={bg} className="badge badge-blood">
                {bg}: <strong>{bloodAvailability[bg] || 0} Ready</strong>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 1fr) 2fr', gap: '32px' }}>
        
        {/* Left Column: Form (for Receive mode) or Stats (for Donate mode) */}
        {dashboardMode === 'receive' ? (
          <div className="card glass">
            <h3>Post Blood Request 🚨</h3>
            <form onSubmit={handlePostRequest} style={{ marginTop: '16px' }}>
              <div className="form-group">
                <label>Blood Group Needed</label>
                <select 
                  className="form-control"
                  value={requestForm.bloodGroup}
                  onChange={(e) => setRequestForm({ ...requestForm, bloodGroup: e.target.value })}
                >
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label>Select Preferred Blood Bank / Hospital</label>
                <select 
                  className="form-control"
                  value={requestForm.hospital}
                  onChange={(e) => setRequestForm({ ...requestForm, hospital: e.target.value })}
                >
                  <option value="">Home Delivery / Direct</option>
                  {hospitals.map(h => <option key={h._id} value={h._id}>{h.name} ({h.city})</option>)}
                </select>
              </div>

              <div className="form-group">
                <label>Urgency</label>
                <select 
                  className="form-control"
                  value={requestForm.urgency}
                  onChange={(e) => setRequestForm({ ...requestForm, urgency: e.target.value })}
                >
                  <option value="low">Low (Next few days)</option>
                  <option value="medium">Medium (Today)</option>
                  <option value="high">High (Immediate)</option>
                  <option value="critical">Critical (Emergency)</option>
                </select>
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  Location 
                  <button type="button" onClick={getUserLocation} className="btn btn-outline btn-small" disabled={geoLoading}>
                    <Navigation size={14} /> {geoLoading ? 'Locating...' : 'Use My Location'}
                  </button>
                </label>
                <div style={{ height: '200px', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '2px solid #E2E8F0' }}>
                  <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <LocationPicker position={position} setPosition={setPosition} />
                  </MapContainer>
                </div>
                <small style={{ color: 'var(--gray)' }}>Click on map to manually set request location.</small>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={requestLoading}>
                {requestLoading ? 'Posting...' : 'Create Emergency Request'}
              </button>
            </form>
          </div>
        ) : (
          <div className="card glass">
            <h3>Your Donor Profile ❤️</h3>
            <div style={{ marginTop: '20px' }}>
              <p><strong>Name:</strong> {user.name}</p>
              <p><strong>Blood Group:</strong> <span className="badge badge-blood">{user.bloodGroup}</span></p>
              <p><strong>Status:</strong> <span className="badge badge-fulfilled">Available</span></p>
            </div>
            
            <h4 style={{ marginTop: '24px', marginBottom: '12px' }}>Blood Banks in Nepal</h4>
            <div style={{ height: '300px', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '2px solid #E2E8F0' }}>
               <MapContainer center={[27.7172, 85.3240]} zoom={12} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  {hospitals.map(h => (
                    <Marker key={h._id} position={[h.location.coordinates[1], h.location.coordinates[0]]}>
                      <Popup>
                        <strong>{h.name}</strong><br/>
                        Contact: {h.contact}
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--gray)', marginTop: '8px' }}>Interact with the map to find active blood banks.</p>
          </div>
        )}

        {/* Right Column: Feed and Inbox */}
        <div>
          <div className="card glass">
            <h3>
              {dashboardMode === 'receive' ? 'Your Active Requests 📋' : 'Public Blood Requests 🚨'}
            </h3>
            
            <div className="requests-list" style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {dashboardMode === 'receive' ? (
                myRequests.length === 0 ? <p className="text-gray">You have no active requests.</p> :
                myRequests.map(req => (
                  <div key={req._id} style={{ border: '2px solid #E2E8F0', padding: '20px', borderRadius: '12px', background: '#FAFAFA' }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span className={`badge badge-${req.urgency}`}>{req.urgency} Priority</span>
                        <span className={`badge badge-${req.status}`}>{req.status}</span>
                     </div>
                     <h4 style={{ marginTop: '12px', fontSize: '1.2rem', color: 'var(--dark)' }}>{req.bloodGroup} Needed</h4>
                     <p style={{ color: 'var(--gray)', fontSize: '0.9rem' }}>At: {req.hospital?.name || 'Home/Custom Location'}</p>
                     
                     <div style={{ marginTop: '16px', padding: '16px', background: '#E0F2FE', borderRadius: '8px', border: '1px solid #BAE6FD' }}>
                        <strong style={{ color: '#0369A1' }}>Matched Donors ({req.matches.length})</strong>
                        <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {req.matches.map(m => m.donor && (
                            <div key={m._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '10px 14px', borderRadius: '6px', border: '1px solid #E0F2FE' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <CheckCircle size={16} color="#0EA5E9"/> 
                                <span style={{ fontWeight: '600', color: '#0369A1' }}>{m.donor.name} ({m.donor.bloodGroup})</span>
                              </div>
                              <span style={{ fontSize: '0.9rem', color: '#0F172A', background: '#F1F5F9', padding: '4px 8px', borderRadius: '4px' }}>
                                📞 {m.donor.contact || 'No contact provided'}
                              </span>
                            </div>
                          ))}
                        </div>
                     </div>
                  </div>
                ))
              ) : (
                activeRequests.length === 0 ? <p className="text-gray">No active requests found right now. Check back later!</p> :
                activeRequests.map(req => (
                  <div key={req._id} style={{ border: '2px solid var(--primary-light)', padding: '20px', borderRadius: '12px', background: '#FEF2F2' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span className={`badge badge-${req.urgency}`}>{req.urgency} Emergency</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--gray)' }}><Clock size={12}/> {new Date(req.created_at).toLocaleDateString()}</span>
                    </div>
                    <h4 style={{ marginTop: '12px', fontSize: '1.2rem', color: 'var(--primary-dark)' }}>{req.bloodGroup} Required</h4>
                    <p style={{ fontSize: '0.95rem', margin: '4px 0 16px 0' }}><MapPin size={16} style={{ display: 'inline', verticalAlign: 'middle' }}/> <strong>Hospital:</strong> {req.hospital?.name || 'Home/Custom Loc.'}</p>
                    
                    <button 
                      onClick={() => handleDonate(req._id)} 
                      className="btn btn-primary" 
                      style={{ width: '100%' }}
                      disabled={req.matches.some(m => m.donor && m.donor._id === user._id)}
                    >
                      <Droplet size={16} /> 
                      {req.matches.some(m => m.donor && m.donor._id === user._id) ? 'Donation Offer Sent' : 'Donate Blood Now'}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="card glass" style={{ marginTop: '32px' }}>
            <h3 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--dark)' }}>
              <span style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Bell size={20} /> Your Inbox</span>
              {notifications.some(n => !n.is_read) && (
                <button 
                  onClick={async () => {
                    await axios.post(`${API_URL}/notifications/read`, {}, { headers: { Authorization: `Bearer ${user.token}` } });
                    fetchNotifications();
                    success('All notifications marked as read');
                  }}
                  className="btn btn-outline btn-small"
                  style={{ borderRadius: '20px' }}
                >Mark All Read</button>
              )}
            </h3>
            
            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {notifications.length === 0 ? (
                <div style={{ padding: '30px', textAlign: 'center', color: 'var(--gray)', background: '#F8FAFC', borderRadius: '12px' }}>
                  No new messages.
                </div>
              ) : (
                notifications.map(n => (
                  <div key={n._id} className="slide-in" style={{ 
                    display: 'flex', 
                    gap: '12px', 
                    background: n.is_read ? '#f8f9fa' : '#EEF2FF', 
                    padding: '16px', 
                    borderLeft: n.is_read ? '4px solid #CBD5E1' : '4px solid var(--secondary)', 
                    borderRadius: '0 12px 12px 0',
                    boxShadow: n.is_read ? 'none' : '0 2px 4px rgba(0,0,0,0.02)'
                  }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: n.is_read ? '500' : '700', fontSize: '1rem', color: n.is_read ? 'var(--gray)' : 'var(--dark)', marginBottom: '4px' }}>
                        {n.message}
                      </p>
                      <small style={{ color: 'var(--gray)', fontSize: '0.8rem' }}>
                        <Clock size={10} style={{ display: 'inline', marginRight: '4px' }}/>
                        {new Date(n.created_at).toLocaleString()}
                      </small>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;

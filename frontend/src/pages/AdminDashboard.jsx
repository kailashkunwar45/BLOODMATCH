import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Users, Building, Droplet, ClipboardList, TrendingUp, RefreshCw, Search, Trash2, ShieldAlert, LayoutDashboard } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const AdminDashboard = () => {
  const { user, API_URL } = useAuth();
  const { showSuccess, showError } = useToast();
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // View State: 'overview', 'users', 'hospitals', 'requests'
  const [currentView, setCurrentView] = useState('overview');
  
  // Data Lists
  const [usersList, setUsersList] = useState([]);
  const [hospitalsList, setHospitalsList] = useState([]);
  const [requestsList, setRequestsList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const headers = { Authorization: `Bearer ${user.token}` };

  const fetchAll = useCallback(async () => {
    try {
      const headersLocal = { Authorization: `Bearer ${user.token}` };
      const [statsRes, logsRes] = await Promise.all([
        axios.get(`${API_URL}/admin/stats`, { headers: headersLocal }),
        axios.get(`${API_URL}/admin/logs`, { headers: headersLocal })
      ]);
      setStats(statsRes.data.stats);
      setLogs(logsRes.data.logs);
    } catch (err) {
      console.error('Admin fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [API_URL, user.token]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const fetchUsers = async () => {
    setRefreshing(true);
    try {
      const { data } = await axios.get(`${API_URL}/admin/users`, { headers });
      setUsersList(data.users);
      setCurrentView('users');
    } catch { showError('Failed to fetch users'); }
    setRefreshing(false);
  };

  const fetchHospitals = async () => {
    setRefreshing(true);
    try {
      const { data } = await axios.get(`${API_URL}/admin/hospitals`, { headers });
      setHospitalsList(data.hospitals);
      setCurrentView('hospitals');
    } catch { showError('Failed to fetch hospitals'); }
    setRefreshing(false);
  };

  const fetchRequests = async () => {
    setRefreshing(true);
    try {
      const { data } = await axios.get(`${API_URL}/admin/requests`, { headers });
      setRequestsList(data.requests);
      setCurrentView('requests');
    } catch { showError('Failed to fetch requests'); }
    setRefreshing(false);
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to permanently delete this user? This action cannot be undone.')) return;
    try {
      await axios.delete(`${API_URL}/admin/users/${userId}`, { headers });
      showSuccess('User deleted successfully');
      fetchUsers(); // Refresh list
      fetchAll();   // Refresh stats
    } catch (e) {
      showError(e.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    if (currentView === 'overview') fetchAll();
    else if (currentView === 'users') fetchUsers();
    else if (currentView === 'hospitals') fetchHospitals();
    else if (currentView === 'requests') fetchRequests();
  };

  const [broadcastData, setBroadcastData] = useState({
    bg: 'A+',
    text: ''
  });

  const handleBroadcast = async () => {
    if (!broadcastData.text) return showError('Please enter a message');
    try {
      await axios.post(`${API_URL}/admin/message`, { 
        bloodGroup: broadcastData.bg, 
        message: broadcastData.text 
      }, { headers });
      showSuccess('Message broadcasted successfully!');
      setBroadcastData({ ...broadcastData, text: '' });
      fetchAll();
    } catch (e) { 
      showError(e.response?.data?.message || 'Error sending message'); 
    }
  };

  // Filtered Lists
  const filteredUsers = usersList.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredHospitals = hospitalsList.filter(h => 
    h.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    h.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statCards = stats
    ? [
        { label: 'Total Users',    value: stats.users,     icon: <Users size={24} />,       color: 'rgba(239,68,68,0.12)',    text: 'var(--primary)' },
        { label: 'Active Donors',  value: stats.donors,    icon: <Droplet size={24} />,     color: 'rgba(16,185,129,0.12)',   text: 'var(--accent)' },
        { label: 'Hospitals',      value: stats.hospitals, icon: <Building size={24} />,    color: 'rgba(99,102,241,0.12)',   text: 'var(--secondary)' },
        { label: 'Total Requests', value: stats.requests,  icon: <TrendingUp size={24} />,  color: 'rgba(59,130,246,0.12)',   text: 'var(--info)' },
      ]
    : [];

  return (
    <div className="dashboard fade-in">
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Admin Control Panel</h1>
          <p>Full system monitoring, statistics, and activity logs.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {currentView !== 'overview' && (
            <button onClick={() => setCurrentView('overview')} className="btn btn-outline btn-small">
              <LayoutDashboard size={16} /> Back to Overview
            </button>
          )}
          <button onClick={handleRefresh} className="btn btn-outline btn-small" disabled={refreshing}>
            <RefreshCw size={16} style={{ animation: refreshing ? 'spin 0.7s linear infinite' : 'none' }} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {currentView === 'overview' && (
        <>
          {/* Stats Bar */}
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '32px' }}>
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="card glass" style={{ height: '100px', background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)', animation: 'pulse 1.5s infinite' }} />
              ))}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '32px' }}>
              {statCards.map((card) => (
                <div key={card.label} className="card glass stat-card" style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '24px' }}>
                  <div style={{ background: card.color, color: card.text, padding: '14px', borderRadius: '14px', flexShrink: 0 }}>
                    {card.icon}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--dark)', lineHeight: 1 }}>{card.value}</h3>
                    <p style={{ color: 'var(--gray)', fontSize: '0.85rem', fontWeight: '600', marginTop: '4px' }}>{card.label}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }} className="dashboard-grid">
            {/* Activity Logs */}
            <div className="card glass">
              <h3 style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '4px' }}>
                <ClipboardList size={20} />  System Activity Logs
              </h3>
              <p style={{ color: 'var(--gray)', fontSize: '0.85rem', marginBottom: '8px' }}>Latest 50 system events</p>
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Action</th>
                      <th>Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading && (
                      <tr><td colSpan="3" style={{ textAlign: 'center', padding: '32px', color: 'var(--gray)' }}>Loading logs...</td></tr>
                    )}
                    {!loading && logs.length === 0 && (
                      <tr><td colSpan="3" style={{ textAlign: 'center', padding: '32px', color: 'var(--gray)' }}>No activity logs found.</td></tr>
                    )}
                    {logs.map(log => (
                      <tr key={log._id} className="slide-in">
                        <td>
                          <strong>{log.user?.name || 'System'}</strong><br />
                          <small style={{ color: 'var(--gray)' }}>{log.user?.email || ''}</small>
                        </td>
                        <td>{log.action}</td>
                        <td style={{ whiteSpace: 'nowrap', color: 'var(--gray)', fontSize: '0.85rem' }}>
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Management */}
            <div className="card glass">
              <h3 style={{ marginBottom: '20px' }}>⚙️ Management Tools</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button onClick={fetchUsers} className="btn btn-outline" style={{ justifyContent: 'flex-start' }}>
                  <Users size={16} /> Manage Users
                </button>
                <button onClick={fetchHospitals} className="btn btn-outline" style={{ justifyContent: 'flex-start' }}>
                  <Building size={16} /> Manage Hospitals
                </button>
                <button onClick={fetchRequests} className="btn btn-outline" style={{ justifyContent: 'flex-start' }}>
                  <ClipboardList size={16} /> All Blood Requests
                </button>
                <button className="btn btn-outline" style={{ justifyContent: 'flex-start', opacity: 0.5, cursor: 'not-allowed' }}>
                  <TrendingUp size={16} /> Advanced Analytics (Pro)
                </button>
              </div>

              <div style={{ marginTop: '24px', padding: '16px', background: '#F8FAFC', borderRadius: 'var(--radius)' }}>
                 <h4 style={{ marginBottom: '12px', fontSize: '1rem' }}>Broadcast Emergency Message</h4>
                 <select 
                   className="form-control" 
                   style={{ marginBottom: '8px', padding: '8px' }}
                   value={broadcastData.bg}
                   onChange={(e) => setBroadcastData({ ...broadcastData, bg: e.target.value })}
                 >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                 </select>
                 <textarea 
                   className="form-control" 
                   placeholder="Type urgent message here..." 
                   style={{ marginBottom: '8px', minHeight: '80px', padding: '8px' }}
                   value={broadcastData.text}
                   onChange={(e) => setBroadcastData({ ...broadcastData, text: e.target.value })}
                 ></textarea>
                 <button 
                    className="btn btn-primary btn-small" 
                    style={{ width: '100%' }}
                    onClick={handleBroadcast}
                 >Broadcast Now</button>
              </div>
            </div>
          </div>
        </>
      )}

      {currentView === 'users' && (
        <div className="card glass slide-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3><Users size={20} style={{ verticalAlign: 'middle', marginRight: '8px' }}/> User Accounts Management</h3>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray)' }}/>
              <input 
                type="text" 
                placeholder="Search by name or email..." 
                className="form-control" 
                style={{ paddingLeft: '36px', width: '300px' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>User Details</th>
                  <th>Role</th>
                  <th>Blood Group</th>
                  <th>Contact</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr key={u._id}>
                    <td>
                      <strong>{u.name}</strong><br/>
                      <small style={{ color: 'var(--gray)' }}>{u.email}</small>
                    </td>
                    <td><span className={`badge badge-${u.role}`}>{u.role}</span></td>
                    <td><span className="badge badge-blood">{u.bloodGroup || 'N/A'}</span></td>
                    <td>{u.contact || 'N/A'}</td>
                    <td>
                      <button 
                        onClick={() => handleDeleteUser(u._id)} 
                        className="btn btn-outline" 
                        style={{ color: '#EF4444', borderColor: '#FECACA', padding: '6px' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {currentView === 'hospitals' && (
        <div className="card glass slide-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3><Building size={20} style={{ verticalAlign: 'middle', marginRight: '8px' }}/> Hospital Institutions</h3>
            <input 
              type="text" 
              placeholder="Search hospital..." 
              className="form-control" 
              style={{ width: '300px' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Hospital Name</th>
                  <th>City</th>
                  <th>Admin Contact</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredHospitals.map(h => (
                  <tr key={h._id}>
                    <td><strong>{h.name}</strong><br/><small>{h.address}</small></td>
                    <td>{h.city}</td>
                    <td>
                      {h.admin?.name}<br/>
                      <small style={{ color: 'var(--gray)' }}>{h.admin?.email}</small>
                    </td>
                    <td><span className="badge badge-fulfilled">Verified</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {currentView === 'requests' && (
        <div className="card glass slide-in">
          <h3><ClipboardList size={20} style={{ verticalAlign: 'middle', marginRight: '8px' }}/> All System Blood Requests</h3>
          <div className="table-wrapper" style={{ marginTop: '20px' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Blood Group</th>
                  <th>Hospital</th>
                  <th>Urgency</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {requestsList.map(r => (
                  <tr key={r._id}>
                    <td>
                      <strong>{r.patient?.name}</strong><br/>
                      <small>{r.patient?.email}</small>
                    </td>
                    <td><span className="badge badge-blood">{r.bloodGroup}</span></td>
                    <td>{r.hospital?.name || 'Direct'}</td>
                    <td><span className={`badge badge-${r.urgency}`}>{r.urgency}</span></td>
                    <td><span className={`badge badge-${r.status}`}>{r.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Droplet, Heart, Shield, Activity, Users, MapPin } from 'lucide-react';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="home-container fade-in">
      {/* Hero Section */}
      <section className="hero glass" style={{ textAlign: 'center', padding: '80px 24px', borderRadius: '0 0 40px 40px', marginBottom: '60px' }}>
        <div className="container" style={{ maxWidth: '900px' }}>
          <div className="badge badge-blood" style={{ marginBottom: '24px', padding: '8px 16px', fontSize: '0.9rem' }}>
            <Activity size={14} style={{ display: 'inline', marginRight: '6px' }}/> 
            Saving Lives Across Nepal
          </div>
          <h1 style={{ fontSize: '3.5rem', fontWeight: '900', color: 'var(--dark)', lineHeight: '1.1', marginBottom: '24px' }}>
            The Smartest Way to <span style={{ color: 'var(--primary)' }}>Find and Give</span> Blood.
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--gray)', marginBottom: '40px', maxWidth: '700px', margin: '0 auto 40px' }}>
            Connecting donors, hospitals, and patients in real-time. Join the emergency network and make a difference today.
          </p>
          
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            {!user ? (
              <>
                <Link to="/register" className="btn btn-primary" style={{ padding: '16px 32px', fontSize: '1.1rem' }}>
                  Join the Network
                </Link>
                <Link to="/login" className="btn btn-outline" style={{ padding: '16px 32px', fontSize: '1.1rem' }}>
                  Login to Portal
                </Link>
              </>
            ) : (
              <Link to="/dashboard" className="btn btn-primary" style={{ padding: '16px 32px', fontSize: '1.1rem' }}>
                Go to Dashboard
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container" style={{ marginBottom: '80px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: '800' }}>Why choose BloodMatcher?</h2>
          <p style={{ color: 'var(--gray)' }}>Our intelligent system is built for speed and reliability during emergencies.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
          <div className="card glass feature-card" style={{ padding: '32px' }}>
            <div style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--primary)', width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <MapPin size={24} />
            </div>
            <h3 style={{ marginBottom: '12px' }}>Smart Proximity</h3>
            <p style={{ color: 'var(--gray)' }}>Uses geolocation to find the nearest compatible donors within minutes of an emergency request.</p>
          </div>

          <div className="card glass feature-card" style={{ padding: '32px' }}>
            <div style={{ background: 'rgba(34,197,94,0.1)', color: 'var(--accent)', width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <Shield size={24} />
            </div>
            <h3 style={{ marginBottom: '12px' }}>Verified Institutions</h3>
            <p style={{ color: 'var(--gray)' }}>Only government-certified hospitals and Red Cross blood banks can manage official inventory.</p>
          </div>

          <div className="card glass feature-card" style={{ padding: '32px' }}>
            <div style={{ background: 'rgba(59,130,246,0.1)', color: 'var(--info)', width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <Activity size={24} />
            </div>
            <h3 style={{ marginBottom: '12px' }}>Real-time Alerts</h3>
            <p style={{ color: 'var(--gray)' }}>Instant notifications via dashboard and inbox to keep everyone in the loop during critical seconds.</p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container glass" style={{ padding: '60px 40px', borderRadius: '32px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '40px', textAlign: 'center', marginBottom: '80px' }}>
        <div>
          <h4 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--primary)' }}>50+</h4>
          <p style={{ fontWeight: '600', color: 'var(--gray)' }}>Hospitals</p>
        </div>
        <div>
          <h4 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--primary)' }}>10k+</h4>
          <p style={{ fontWeight: '600', color: 'var(--gray)' }}>Active Donors</p>
        </div>
        <div>
          <h4 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--primary)' }}>2.5k+</h4>
          <p style={{ fontWeight: '600', color: 'var(--gray)' }}>Matches Made</p>
        </div>
        <div>
          <h4 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--primary)' }}>24/7</h4>
          <p style={{ fontWeight: '600', color: 'var(--gray)' }}>Emergency Support</p>
        </div>
      </section>

      <footer style={{ textAlign: 'center', padding: '40px 0', borderTop: '1px solid #eee' }}>
        <p style={{ color: 'var(--gray)', fontSize: '0.9rem' }}>&copy; 2026 BloodMatcher Nepal. A life-saving initiative.</p>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        .feature-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .feature-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.08);
        }
        @media (max-width: 768px) {
          h1 { font-size: 2.5rem !important; }
        }
      `}} />
    </div>
  );
};

export default Home;

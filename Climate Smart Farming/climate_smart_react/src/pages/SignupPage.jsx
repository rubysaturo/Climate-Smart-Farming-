import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import loginBg from '../assets/login-bg.jpg';
import Toast from '../components/Toast';
import { KENYAN_REGIONS, CROP_TYPES, KENYAN_COUNTIES_SUBCOUNTIES } from '../utils/regions';

const SignupPage = () => {
  const { register, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('Rift Valley Region');
  const [selectedCounty, setSelectedCounty] = useState('Nakuru County');
  const [subCounty, setSubCounty] = useState('Njoro');
  const [selectedCrop, setSelectedCrop] = useState('Wheat');
  const [role, setRole] = useState('farmer');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const counties = KENYAN_REGIONS[selectedRegion];
    if (counties && counties.length > 0) {
      setSelectedCounty(counties[0]);
    }
  }, [selectedRegion]);

  useEffect(() => {
    const subs = KENYAN_COUNTIES_SUBCOUNTIES[selectedCounty];
    if (subs && subs.length > 0) {
      setSubCounty(subs[0]);
    }
  }, [selectedCounty]);
  
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    return () => {
      setName('');
      setUsername('');
      setEmail('');
      setPhone('');
      setPassword('');
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !username || !email || !password || !phone) {
      setToast({ message: 'Please fill in all fields', type: 'error' });
      return;
    }

    try {
      const data = {
        name,
        username,
        email,
        phone_number: phone,
        sector: `${selectedCounty} - ${subCounty} (${selectedCrop})`,
        role,
        password
      };

      await register(data);
      setToast({ message: 'Registration successful! You can now log in.', type: 'success' });
      
      setName('');
      setUsername('');
      setEmail('');
      setPhone('');
      setPassword('');

      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      setToast({ message: err.message || 'Registration failed', type: 'error' });
    }
  };

  return (
    <div 
      className="auth-container" 
      style={{ backgroundImage: `url(${loginBg})` }}
    >
      <div className="auth-card" style={{ maxWidth: '500px' }}>
        <div className="auth-header">
          <div className="auth-logo">
            <svg viewBox="0 0 24 24">
              <path d="M19 8.5c0-.8-.7-1.5-1.5-1.5H16c0-2.2-1.8-4-4-4S8 4.8 8 7H6.5C5.7 7 5 7.7 5 8.5c0 .7.4 1.3 1 1.5v8c0 1.7 1.3 3 3 3h6c1.7 0 3-1.3 3-3v-8c.6-.2 1-.8 1-1.5zM12 5c1.1 0 2 .9 2 2h-4c0-1.1.9-2 2-2zm4 11.5c0 .8-.7 1.5-1.5 1.5h-5c-.8 0-1.5-.7-1.5-1.5V11h8v5.5zm1.5-7.5H6.5c-.3 0-.5-.2-.5-.5s.2-.5.5-.5h11c.3 0 .5.2.5.5s-.2.5-.5.5zm-5.5 5.5v3M10.5 14v3M13.5 14v3" />
            </svg>
            <span>GreenAcres</span>
          </div>
          <p className="auth-subtitle">Create your Climate Smart Farming account</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} autoComplete="off">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input 
                type="text" 
                id="name"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Kamau Njoroge"
                autoComplete="off"
              />
            </div>

            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input 
                type="text" 
                id="username"
                className="form-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="kamau74"
                autoComplete="off"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input 
                type="email" 
                id="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="kamau@gmail.com"
                autoComplete="off"
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input 
                type="text" 
                id="phone"
                className="form-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +254712345678"
                autoComplete="off"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="form-group">
              <label htmlFor="signup-region">Farming Region</label>
              <select 
                id="signup-region" 
                className="form-input"
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
              >
                {Object.keys(KENYAN_REGIONS).map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="signup-county">County</label>
              <select 
                id="signup-county" 
                className="form-input"
                value={selectedCounty}
                onChange={(e) => setSelectedCounty(e.target.value)}
              >
                {(KENYAN_REGIONS[selectedRegion] || []).map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="form-group">
              <label htmlFor="signup-subcounty">Sub-County / Area</label>
              <select 
                id="signup-subcounty"
                className="form-input"
                value={subCounty}
                onChange={(e) => setSubCounty(e.target.value)}
              >
                {(KENYAN_COUNTIES_SUBCOUNTIES[selectedCounty] || []).map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="signup-crop">Primary Crop</label>
              <select 
                id="signup-crop" 
                className="form-input"
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
              >
                {CROP_TYPES.map(crop => (
                  <option key={crop} value={crop}>{crop}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="role">Account Role</label>
            <select 
              id="role" 
              className="form-input"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="farmer">Farmer (Default)</option>
              <option value="admin">Agronomist (Admin)</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input 
                type={showPassword ? 'text' : 'password'} 
                id="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a strong password"
                autoComplete="new-password"
                style={{ paddingRight: '45px', width: '100%' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0
                }}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>
            Sign Up
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login" className="auth-link">Log In</Link>
        </div>
      </div>

      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </div>
  );
};

export default SignupPage;

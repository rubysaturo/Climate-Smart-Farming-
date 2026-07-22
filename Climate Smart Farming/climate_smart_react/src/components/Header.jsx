import React, { useState, useContext, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Modal from './Modal';
import { KENYAN_REGIONS, CROP_TYPES } from '../utils/regions';

const parseSector = (sectorStr) => {
  const defaultVal = { region: 'Rift Valley Region', county: 'Nakuru County', subCounty: 'Njoro', crop: 'Wheat' };
  if (!sectorStr) return defaultVal;
  
  const parts = sectorStr.split(' - ');
  if (parts.length < 2) return defaultVal;
  
  const county = parts[0].trim();
  const rest = parts[1].trim();
  const cropMatch = rest.match(/\(([^)]+)\)/);
  const crop = cropMatch ? cropMatch[1].trim() : 'Wheat';
  const subCounty = rest.replace(/\([^)]+\)/, '').trim();
  
  let region = 'Rift Valley Region';
  for (const [r, counties] of Object.entries(KENYAN_REGIONS)) {
    if (counties.includes(county)) {
      region = r;
      break;
    }
  }
  
  return { region, county, subCounty, crop };
};

const Header = ({ title }) => {
  const { user, logout, updateProfile, theme, toggleTheme } = useContext(AuthContext);
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const fileInputRef = useRef(null);

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Profile Edit states
  const [isProfileEditOpen, setIsProfileEditOpen] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone_number || '');
  const [selectedRegion, setSelectedRegion] = useState('Rift Valley Region');
  const [selectedCounty, setSelectedCounty] = useState('Nakuru County');
  const [subCounty, setSubCounty] = useState('Njoro');
  const [selectedCrop, setSelectedCrop] = useState('Wheat');
  const [profilePic, setProfilePic] = useState(user?.profile_picture || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync inputs with user values on modal open
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone_number || '');
      const parsed = parseSector(user.sector);
      setSelectedRegion(parsed.region);
      setSelectedCounty(parsed.county);
      setSubCounty(parsed.subCounty);
      setSelectedCrop(parsed.crop);
      setProfilePic(user.profile_picture || '');
    }
  }, [user, isProfileEditOpen]);

  // Sync county dropdown when selected region changes
  useEffect(() => {
    const counties = KENYAN_REGIONS[selectedRegion];
    if (counties && counties.length > 0 && !counties.includes(selectedCounty)) {
      setSelectedCounty(counties[0]);
    }
  }, [selectedRegion]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await updateProfile({
        name,
        email,
        phone_number: phone,
        sector: `${selectedCounty} - ${subCounty} (${selectedCrop})`,
        profile_picture: profilePic
      });
      setSaving(false);
      setIsProfileEditOpen(false);
      alert('Profile updated successfully!');
    } catch (err) {
      setSaving(false);
      setError(err.message || 'Failed to update profile info');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("File size is too large (max 2MB)");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setProfilePic('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <header className="header" style={{ padding: '15px 30px', backgroundColor: 'transparent', borderBottom: 'none' }}>
      <h2 className="header-title" style={{ fontFamily: 'var(--font-header)', fontWeight: 600, color: '#2E7D32', fontSize: '1.45rem' }}>{title}</h2>

      <div className="header-actions">
        <button className="notification-btn" onClick={() => alert('No new alerts')} style={{ color: 'var(--text-dark)' }}>
          <svg style={{ width: '22px', height: '22px', fill: 'currentColor' }} viewBox="0 0 24 24">
            <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
          </svg>
        </button>

        <div className="user-profile-menu" ref={dropdownRef}>
          <button className="user-menu-trigger" onClick={() => setDropdownOpen(!dropdownOpen)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 12px', background: 'none', border: 'none', cursor: 'pointer' }}>
            {user?.profile_picture ? (
              <img 
                src={user.profile_picture} 
                alt="Avatar" 
                style={{ 
                  width: '38px', 
                  height: '38px', 
                  borderRadius: '50%', 
                  objectFit: 'cover',
                  border: '1.5px solid var(--border-color)'
                }} 
              />
            ) : (
              <div style={{ 
                width: '38px', 
                height: '38px', 
                borderRadius: '50%', 
                backgroundColor: '#2E7D32', 
                color: '#ffffff', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontWeight: '700', 
                fontSize: '0.9rem',
                border: '1.5px solid var(--border-color)',
                fontFamily: 'var(--font-header)'
              }}>
                {getInitials(user?.name || user?.username)}
              </div>
            )}
            <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-dark)' }}>{user?.name || user?.username || 'User'}</span>
            <svg style={{ width: '16px', height: '16px', fill: 'var(--text-dark)' }} viewBox="0 0 24 24">
              <path d="M7 10l5 5 5-5z" />
            </svg>
          </button>

          {dropdownOpen && (
            <div className="user-dropdown">
              <div className="user-dropdown-info">
                <div className="user-dropdown-name">{user?.name || user?.username}</div>
                <div className="user-dropdown-role">{user?.role}</div>
              </div>
              <div style={{ padding: '4px 0' }}>
                <button onClick={() => { setDropdownOpen(false); setIsProfileEditOpen(true); }}>
                  Edit Profile Info
                </button>
                <a 
                  href="/Climate_Smart_Farming_System_Documentation.pdf" 
                  download="Climate_Smart_Farming_System_Documentation.pdf"
                  onClick={() => setDropdownOpen(false)}
                  style={{ 
                    display: 'block', 
                    padding: '12px 16px', 
                    fontSize: '0.9rem', 
                    color: 'var(--text-dark)', 
                    textDecoration: 'none',
                    fontWeight: '600',
                    transition: 'var(--transition-smooth)'
                  }}
                  onMouseEnter={(e) => e.target.style.color = 'var(--accent-gold)'}
                  onMouseLeave={(e) => e.target.style.color = 'var(--text-dark)'}
                >
                  📄 Download Documentation PDF
                </a>
                <button onClick={toggleTheme} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg style={{ width: '16px', height: '16px', fill: 'currentColor' }} viewBox="0 0 24 24">
                    {theme === 'dark' ? (
                      <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0s-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0s-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41s-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.01c.39-.39.39-1.03 0-1.41s-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z" />
                    ) : (
                      <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z" />
                    )}
                  </svg>
                  {theme === 'dark' ? 'Light Theme' : 'Dark Theme'}
                </button>
                <button onClick={handleLogout} style={{ color: 'var(--status-high)', borderTop: '1px solid var(--border-color)', width: '100%', display: 'block' }}>
                  Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal 
        isOpen={isProfileEditOpen} 
        onClose={() => setIsProfileEditOpen(false)} 
        title="Edit Profile Information"
      >
        <form onSubmit={handleProfileSubmit} className="auth-form" autoComplete="off">
          {error && <div style={{ color: 'var(--status-high)', fontSize: '0.85rem', fontWeight: '700' }}>{error}</div>}

          {/* Circular avatar picker (Instagram Style) */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
            <div 
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              style={{
                width: '90px',
                height: '90px',
                borderRadius: '50%',
                cursor: 'pointer',
                overflow: 'hidden',
                position: 'relative',
                border: '2.5px solid var(--primary-color)',
                boxShadow: 'var(--card-shadow)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#2E7D32'
              }}
            >
              {profilePic ? (
                <img 
                  src={profilePic} 
                  alt="Avatar Preview" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              ) : (
                <div style={{ color: '#ffffff', fontSize: '2rem', fontWeight: '700', fontFamily: 'var(--font-header)' }}>
                  {getInitials(name || user?.username)}
                </div>
              )}
              {/* Overlay hover effect */}
              <div 
                className="avatar-overlay"
                style={{
                  position: 'absolute',
                  top: 0, left: 0, right: 0, bottom: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.4)',
                  opacity: 0,
                  transition: 'opacity 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: '0.75rem',
                  fontWeight: '600'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                onMouseLeave={(e) => e.currentTarget.style.opacity = 0}
              >
                Upload Photo
              </div>
            </div>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              style={{ display: 'none' }} 
            />

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                type="button" 
                onClick={() => fileInputRef.current && fileInputRef.current.click()} 
                style={{ background: 'none', border: 'none', color: 'var(--accent-gold)', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}
              >
                Change Photo
              </button>
              {profilePic && (
                <button 
                  type="button" 
                  onClick={handleRemovePhoto} 
                  style={{ background: 'none', border: 'none', color: 'var(--status-high)', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}
                >
                  Remove Photo
                </button>
              )}
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="profile-name">Full Name</label>
            <input 
              type="text" 
              id="profile-name" 
              className="form-input" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Full Name"
              required 
            />
          </div>

          <div className="form-group">
            <label htmlFor="profile-email">Email Address</label>
            <input 
              type="email" 
              id="profile-email" 
              className="form-input" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="Email Address"
              required 
            />
          </div>

          <div className="form-group">
            <label htmlFor="profile-phone">Phone Number</label>
            <input 
              type="text" 
              id="profile-phone" 
              className="form-input" 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)} 
              placeholder="Phone Number"
              required 
            />
          </div>

          <div className="form-group">
            <label>Region</label>
            <select className="form-input" value={selectedRegion} onChange={(e) => setSelectedRegion(e.target.value)} required>
              {Object.keys(KENYAN_REGIONS).map((region) => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>County</label>
            <select className="form-input" value={selectedCounty} onChange={(e) => setSelectedCounty(e.target.value)} required>
              {(KENYAN_REGIONS[selectedRegion] || []).map((county) => (
                <option key={county} value={county}>{county}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Sub-county</label>
            <input type="text" className="form-input" value={subCounty} onChange={(e) => setSubCounty(e.target.value)} placeholder="E.g., Njoro" required />
          </div>
          <div className="form-group">
            <label>Primary Crop</label>
            <select className="form-input" value={selectedCrop} onChange={(e) => setSelectedCrop(e.target.value)} required>
              {CROP_TYPES.map((crop) => (
                <option key={crop} value={crop}>{crop}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginTop: '10px', 
            paddingTop: '15px', 
            borderTop: '1px solid var(--border-color)' 
          }}>
            <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-dark)' }}>Theme Preference</span>
            <button 
              type="button" 
              onClick={toggleTheme} 
              className="btn-primary" 
              style={{ padding: '6px 12px', fontSize: '0.8rem', width: 'auto', margin: 0 }}
            >
              {theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            </button>
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: '10px' }} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </Modal>
    </header>
  );
};

export default Header;

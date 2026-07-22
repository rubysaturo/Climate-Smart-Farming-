import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Sidebar = ({ activeTab, setActiveTab, onOpenConsult, onOpenSettings, onOpenSupport }) => {
  const { user } = useContext(AuthContext);

  const mainMenuItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: (
        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
        </svg>
      ) 
    },
    { 
      id: 'weather', 
      label: 'Weather', 
      icon: (
        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      ) 
    },
    { 
      id: 'soil', 
      label: 'Soil Health', 
      icon: (
        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
          <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
          <path d="M2 12h20" />
        </svg>
      ) 
    },
    { 
      id: 'pest', 
      label: 'Pest Alerts', 
      icon: (
        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2a5 5 0 00-5 5v3.5a1 1 0 01-.3.7l-2.4 2.4a2 2 0 00-.3 2.5l.5.5a2 2 0 002.5.3l2.4-2.4a1 1 0 01.7-.3H17a1 1 0 01.7.3l2.4 2.4a2 2 0 002.5-.3l.5-.5a2 2 0 00-.3-2.5l-2.4-2.4a1 1 0 01-.3-.7V7a5 5 0 00-5-5z" />
          <path d="M6 13h12M12 7v6M3 9h3M18 9h3M4 17h2M18 17h2" />
        </svg>
      ) 
    },
    { 
      id: 'market', 
      label: 'Market Insights', 
      icon: (
        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 3v18h18" />
          <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
        </svg>
      ) 
    },
    { 
      id: 'directory', 
      label: 'Farmer Network', 
      icon: (
        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 00-3-3.87" />
          <path d="M16 3.13a4 4 0 010 7.75" />
        </svg>
      ) 
    },
    { 
      id: 'agro-chat', 
      label: 'Agro. Chat', 
      icon: (
        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          <path d="M8 10h8M8 14h4" />
        </svg>
      ) 
    }
  ];

  return (
    <div className="sidebar">
      <div>
        <div className="sidebar-logo-container">
          <div className="sidebar-logo">
            {/* Premium Tractor Icon */}
            <svg viewBox="0 0 24 24" className="sidebar-tractor-icon">
              <path d="M19 15h-2v-2c0-.55-.45-1-1-1h-3.5l-2.22-3.33A2 2 0 008.62 8H6V5h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1h2v3H2v2H1c-.55 0-1 .45-1 1v2h2c0 2.21 1.79 4 4 4s4-1.79 4-4h2.18c.41 1.16 1.51 2 2.82 2 1.66 0 3-1.34 3-3h2v-2c0-.55-.45-1-1-1zM4 19c-1.1 0-2-.9-2-2h4c0 1.1-.9 2-2 2zm10-1c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" />
            </svg>
            <span className="sidebar-logo-text">GreenAcres</span>
          </div>
          <div className="sidebar-logo-sub">
            {user?.sector ? user.sector.split(' (')[0] : 'Nakuru County - Njoro'}
          </div>
        </div>

        <ul className="sidebar-nav">
          {mainMenuItems.map((item) => (
            <li 
              key={item.id} 
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            >
              <button onClick={() => setActiveTab(item.id)}>
                {item.icon}
                <span className="nav-label">{item.label}</span>
              </button>
            </li>
          ))}
          {user && user.role === 'admin' && (
            <li 
              className={`nav-item ${activeTab === 'admin' ? 'active' : ''}`}
              style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px', marginTop: '10px' }}
            >
              <button onClick={() => setActiveTab('admin')} style={{ color: 'var(--accent-gold)' }}>
                <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                </svg>
                <span className="nav-label">Admin Console</span>
              </button>
            </li>
          )}
        </ul>
      </div>

      <div className="sidebar-footer-container">
        {user?.role === 'farmer' && (
          <button onClick={onOpenConsult} className="btn-consult-sidebar">
            Consult Agronomist
          </button>
        )}

        <hr className="sidebar-divider" />

        <ul className="sidebar-nav-footer">
          <li className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}>
            <button onClick={onOpenSettings}>
              <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
              </svg>
              <span className="nav-label">Settings</span>
            </button>
          </li>
          <li className="nav-item">
            <button onClick={onOpenSupport}>
              <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01" />
              </svg>
              <span className="nav-label">Support</span>
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;

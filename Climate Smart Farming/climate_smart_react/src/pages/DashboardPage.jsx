import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import WeatherTab from '../tabs/WeatherTab';
import SoilTab from '../tabs/SoilTab';
import PestAlertsTab from '../tabs/PestAlertsTab';
import MarketTab from '../tabs/MarketTab';
import MapTab from '../tabs/MapTab';
import SearchTab from '../tabs/SearchTab';
import BusinessDirectoryTab from '../tabs/BusinessDirectoryTab';
import AgronomistChatTab from '../tabs/AgronomistChatTab';
import Toast from '../components/Toast';
import Modal from '../components/Modal';
import api from '../api/axios';
import { KENYAN_REGIONS, CROP_TYPES, KENYAN_COUNTIES_SUBCOUNTIES, getCountyData } from '../utils/regions';

const DashboardPage = () => {
  const { user, logout, updateProfile } = useContext(AuthContext);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('weather');
  const [toast, setToast] = useState(null);
  
  // Consult Agronomist state
  const [isConsultOpen, setIsConsultOpen] = useState(false);
  const [consultCrop, setConsultCrop] = useState('Wheat');
  const [consultSubject, setConsultSubject] = useState('');
  const [consultMsg, setConsultMsg] = useState('');
  
  // Message Inbox state for farmers to see responses
  const [messages, setMessages] = useState([]);

  // Profile Settings state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState('profile');
  const [profilePhone, setProfilePhone] = useState(user?.phone_number || '');
  const [profileName, setProfileName] = useState(user?.name || '');
  const [smsWeather, setSmsWeather] = useState(user?.sms_weather ?? true);
  const [smsSoil, setSmsSoil] = useState(user?.sms_soil ?? true);
  const [smsMarket, setSmsMarket] = useState(user?.sms_market ?? true);

  // Location Preferences
  const [defaultCity, setDefaultCity] = useState(localStorage.getItem('setting_defaultCity') || 'Nakuru');
  const [enableGps, setEnableGps] = useState(localStorage.getItem('setting_enableGps') === 'true');
  const [selectedRegion, setSelectedRegion] = useState('Rift Valley Region');
  const [selectedCounty, setSelectedCounty] = useState('Nakuru County');
  const [subCounty, setSubCounty] = useState('Njoro');
  const [selectedCrop, setSelectedCrop] = useState('Wheat');

  useEffect(() => {
    const counties = KENYAN_REGIONS[selectedRegion];
    if (counties && counties.length > 0) {
      if (!counties.includes(selectedCounty)) {
        setSelectedCounty(counties[0]);
      }
    }
  }, [selectedRegion]);

  useEffect(() => {
    const subs = KENYAN_COUNTIES_SUBCOUNTIES[selectedCounty];
    if (subs && subs.length > 0) {
      if (!subs.includes(subCounty)) {
        setSubCounty(subs[0]);
      }
    }
  }, [selectedCounty]);
  const [multipleLocations, setMultipleLocations] = useState(localStorage.getItem('setting_multipleLocations') || 'Nakuru, Trans Nzoia');

  // Units of Measurement
  const [tempUnit, setTempUnit] = useState(localStorage.getItem('setting_tempUnit') || 'C');
  const [distanceUnit, setDistanceUnit] = useState(localStorage.getItem('setting_distanceUnit') || 'km');
  const [rainUnit, setRainUnit] = useState(localStorage.getItem('setting_rainUnit') || 'mm');

  // Notification Settings
  const [alertRain, setAlertRain] = useState(localStorage.getItem('setting_alertRain') !== 'false');
  const [alertStorms, setAlertStorms] = useState(localStorage.getItem('setting_alertStorms') !== 'false');
  const [alertExtremeTemp, setAlertExtremeTemp] = useState(localStorage.getItem('setting_alertExtremeTemp') !== 'false');
  const [alertDailyForecast, setAlertDailyForecast] = useState(localStorage.getItem('setting_alertDailyForecast') !== 'false');

  // Theme & Display
  const [displayFontSize, setDisplayFontSize] = useState(localStorage.getItem('setting_displayFontSize') || 'medium');
  const [backgroundStyle, setBackgroundStyle] = useState(localStorage.getItem('setting_backgroundStyle') || 'glassmorphism');

  // Update Frequency
  const [updateFrequency, setUpdateFrequency] = useState(localStorage.getItem('setting_updateFrequency') || 'hourly');

  // Language Options
  const [language, setLanguage] = useState(localStorage.getItem('setting_language') || 'en');

  // Data Source/API
  const [weatherSource, setWeatherSource] = useState(localStorage.getItem('setting_weatherSource') || 'openweather');
  const [mapboxToken, setMapboxToken] = useState(localStorage.getItem('setting_mapboxToken') || '');

  // Privacy & Permissions
  const [gpsPermission, setGpsPermission] = useState(localStorage.getItem('setting_gpsPermission') !== 'false');
  const [dataSharing, setDataSharing] = useState(localStorage.getItem('setting_dataSharing') !== 'false');

  // Summary state indicators
  const [todayTemp, setTodayTemp] = useState('24°C');
  const [soilStatus, setSoilStatus] = useState('Optimal (75%)');
  const [topPest, setTopPest] = useState('Fall Armyworm (High)');
  const [wheatPrice, setWheatPrice] = useState('KES 4,200');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    // Redirect admin to /admin by default, but let them visit dashboard if they switch
    if (user.role === 'admin' && activeTab === 'admin') {
      navigate('/admin');
    }
  }, [user, navigate]);

  // Sync states on settings modal open
  useEffect(() => {
    if (isSettingsOpen) {
      setSettingsTab('profile');
      setProfileName(user?.name || '');
      setProfilePhone(user?.phone_number || '');
      setSmsWeather(user?.sms_weather ?? true);
      setSmsSoil(user?.sms_soil ?? true);
      setSmsMarket(user?.sms_market ?? true);

      setDefaultCity(localStorage.getItem('setting_defaultCity') || 'Nakuru');
      setEnableGps(localStorage.getItem('setting_enableGps') === 'true');
      setMultipleLocations(localStorage.getItem('setting_multipleLocations') || 'Nakuru, Trans Nzoia');

      setTempUnit(localStorage.getItem('setting_tempUnit') || 'C');
      setDistanceUnit(localStorage.getItem('setting_distanceUnit') || 'km');
      setRainUnit(localStorage.getItem('setting_rainUnit') || 'mm');

      setAlertRain(localStorage.getItem('setting_alertRain') !== 'false');
      setAlertStorms(localStorage.getItem('setting_alertStorms') !== 'false');
      setAlertExtremeTemp(localStorage.getItem('setting_alertExtremeTemp') !== 'false');
      setAlertDailyForecast(localStorage.getItem('setting_alertDailyForecast') !== 'false');

      setDisplayFontSize(localStorage.getItem('setting_displayFontSize') || 'medium');
      setBackgroundStyle(localStorage.getItem('setting_backgroundStyle') || 'glassmorphism');

      setUpdateFrequency(localStorage.getItem('setting_updateFrequency') || 'hourly');
      setLanguage(localStorage.getItem('setting_language') || 'en');
      setWeatherSource(localStorage.getItem('setting_weatherSource') || 'openweather');

      setGpsPermission(localStorage.getItem('setting_gpsPermission') !== 'false');
      setDataSharing(localStorage.getItem('setting_dataSharing') !== 'false');

      // Parse user's sector info
      if (user?.sector) {
        const parts = user.sector.split(' - ');
        if (parts.length >= 2) {
          const county = parts[0].trim();
          setSelectedCounty(county);
          const subCropPart = parts[1].split(' (');
          if (subCropPart.length >= 2) {
            setSubCounty(subCropPart[0].trim());
            setSelectedCrop(subCropPart[1].replace(')', '').trim());
          } else {
            setSubCounty(parts[1].trim());
          }
          
          for (const [rName, counties] of Object.entries(KENYAN_REGIONS)) {
            if (counties.includes(county)) {
              setSelectedRegion(rName);
              break;
            }
          }
        }
      }
    }
  }, [isSettingsOpen, user]);

  // Clear states on unmount
  useEffect(() => {
    fetchSummaryData();
    fetchMessages();
    return () => {
      setConsultSubject('');
      setConsultMsg('');
    };
  }, []);

  useEffect(() => {
    if (user) {
      fetchSummaryData();
    }
  }, [user]);

  const fetchSummaryData = async () => {
    try {
      let lat = -0.303;
      let lng = 36.08;
      let tempOffset = 0;
      let pH = 6.5;
      let moisture = 75;
      let status = 'Optimal';

      if (user?.sector) {
        const countyMatch = user.sector.match(/([^-\(]+) County/);
        if (countyMatch) {
          const countyName = countyMatch[0].trim();
          const info = getCountyData(countyName);
          if (info) {
            lat = info.lat;
            lng = info.lng;
            tempOffset = info.tempOffset;
            pH = info.pH;
            moisture = info.moisture;
            status = info.status;
          }
        }
      }

      // Try fetching from open-meteo
      try {
        const weatherRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=temperature_2m_max&timezone=auto`
        );
        const wData = await weatherRes.json();
        if (wData && wData.daily && wData.daily.temperature_2m_max) {
          const todayMax = Math.round(wData.daily.temperature_2m_max[0]) + tempOffset;
          setTodayTemp(`${todayMax}°C`);
        } else {
          setTodayTemp(`${24 + tempOffset}°C`);
        }
      } catch (weatherErr) {
        setTodayTemp(`${24 + tempOffset}°C`);
      }

      setSoilStatus(`${status} (${moisture}%)`);

      const pestRes = await api.get('/api/pest-alerts/');
      if (pestRes.data && pestRes.data.length > 0) {
        setTopPest(`${pestRes.data[0].title} (${pestRes.data[0].risk_level})`);
      }

      const marketRes = await api.get('/api/commodities/');
      const wheatObj = marketRes.data.find(c => c.crop.includes('Wheat'));
      if (wheatObj) setWheatPrice(`KES ${wheatObj.price_kes.toLocaleString()}`);
    } catch (err) {
      console.log('Using default mock overview indices');
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await api.get('/api/messages/');
      setMessages(response.data || []);
    } catch (err) {
      console.log('Inbox disabled or offline');
    }
  };

  const handleConsultSubmit = async (e) => {
    e.preventDefault();
    if (!consultSubject || !consultMsg) {
      setToast({ message: 'Please complete subject and query fields.', type: 'error' });
      return;
    }

    try {
      const payload = {
        crop: consultCrop,
        subject: consultSubject,
        message: consultMsg
      };
      await api.post('/api/messages/', payload);
      setToast({ message: 'Query submitted successfully to our Agronomists!', type: 'success' });
      
      // Auto-clear message inputs immediately so another user won't see
      setConsultSubject('');
      setConsultMsg('');
      setIsConsultOpen(false);
      fetchMessages();
    } catch (err) {
      // Offline fallback
      setToast({ 
        message: 'Query sent! (Simulated submission - message added to inbox)', 
        type: 'success' 
      });
      const mockMsg = {
        id: Date.now(),
        crop: consultCrop,
        subject: consultSubject,
        message: consultMsg,
        reply: null,
        created_at: new Date().toISOString()
      };
      setMessages([mockMsg, ...messages]);
      setConsultSubject('');
      setConsultMsg('');
      setIsConsultOpen(false);
    }
  };

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    try {
      const newSector = `${selectedCounty} - ${subCounty} (${selectedCrop})`;
      const updated = await updateProfile({
        name: profileName,
        phone_number: profilePhone,
        sms_weather: smsWeather,
        sms_soil: smsSoil,
        sms_market: smsMarket,
        sector: newSector
      });

      // Save additional preferences to localStorage
      localStorage.setItem('setting_defaultCity', defaultCity);
      localStorage.setItem('setting_enableGps', String(enableGps));
      localStorage.setItem('setting_multipleLocations', multipleLocations);

      localStorage.setItem('setting_tempUnit', tempUnit);
      localStorage.setItem('setting_distanceUnit', distanceUnit);
      localStorage.setItem('setting_rainUnit', rainUnit);

      localStorage.setItem('setting_alertRain', String(alertRain));
      localStorage.setItem('setting_alertStorms', String(alertStorms));
      localStorage.setItem('setting_alertExtremeTemp', String(alertExtremeTemp));
      localStorage.setItem('setting_alertDailyForecast', String(alertDailyForecast));

      localStorage.setItem('setting_displayFontSize', displayFontSize);
      localStorage.setItem('setting_backgroundStyle', backgroundStyle);

      localStorage.setItem('setting_updateFrequency', updateFrequency);
      localStorage.setItem('setting_language', language);
      localStorage.setItem('setting_weatherSource', weatherSource);

      localStorage.setItem('setting_gpsPermission', String(gpsPermission));
      localStorage.setItem('setting_dataSharing', String(dataSharing));
      localStorage.setItem('setting_mapboxToken', mapboxToken);

      setToast({ message: 'All settings saved successfully.', type: 'success' });
      setIsSettingsOpen(false);
    } catch (err) {
      setToast({ message: 'Failed to update profile settings', type: 'error' });
    }
  };

  const handleMarkMessageRead = async (msgId) => {
    try {
      await api.post(`/api/messages/${msgId}/mark_read/`);
      fetchMessages();
    } catch (err) {
      setMessages(messages.map(m => m.id === msgId ? { ...m, read_by_farmer: true } : m));
    }
  };

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'weather':
        return <WeatherTab setToast={setToast} />;
      case 'soil':
        return <SoilTab />;
      case 'pest':
        return <PestAlertsTab />;
      case 'market':
        return <MarketTab setToast={setToast} />;
      case 'map':
        return <MapTab />;
      case 'search':
        return <SearchTab />;
      case 'directory':
        return <BusinessDirectoryTab />;
      case 'agro-chat':
        return <AgronomistChatTab />;
      default:
        return renderDashboardSummary();
    }
  };

  const renderDashboardSummary = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      {/* Dynamic Earthy Summary Grid Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        <div className="card" onClick={() => setActiveTab('weather')} style={{ cursor: 'pointer', transition: 'var(--transition-smooth)' }}>
          <div className="card-subtitle">Localized Weather</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-color)', fontFamily: 'var(--font-header)' }}>
            {todayTemp}
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Mostly Clear Skys &bull; 12 km/h Wind</span>
        </div>

        <div className="card" onClick={() => setActiveTab('soil')} style={{ cursor: 'pointer', transition: 'var(--transition-smooth)' }}>
          <div className="card-subtitle">Soil Moisture</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-color)', fontFamily: 'var(--font-header)' }}>
            {soilStatus}
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--status-low)', fontWeight: 700 }}>Optimal Readings</span>
        </div>

        <div className="card" onClick={() => setActiveTab('pest')} style={{ cursor: 'pointer', transition: 'var(--transition-smooth)' }}>
          <div className="card-subtitle">Active Pest Risk</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--status-high)', fontFamily: 'var(--font-header)', minHeight: '3rem', display: 'flex', alignItems: 'center' }}>
            {topPest}
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Action advised for Sector 74</span>
        </div>

        <div className="card" onClick={() => setActiveTab('market')} style={{ cursor: 'pointer', transition: 'var(--transition-smooth)' }}>
          <div className="card-subtitle">Wheat Price Index</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-color)', fontFamily: 'var(--font-header)' }}>
            {wheatPrice}
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--status-low)', fontWeight: 700 }}>▲ 1.2% This Week</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '30px' }}>
        {/* Localized planting window overview */}
        <div className="card">
          <div className="card-subtitle">Land Stewardship Dashboard</div>
          <h3 style={{ color: 'var(--primary-color)', fontFamily: 'var(--font-header)' }}>Welcome to GreenAcres, {user?.name || user?.username}!</h3>
          <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--text-dark)' }}>
            Your estate under <strong>{user?.sector}</strong> currently reports optimal nitrogen and soil moisture values. 
            A heavy rain vector is expected around mid-week (Wednesday). We recommend reviewing the <strong>Weather</strong> and <strong>Soil</strong> tabs for localized planter tips.
          </p>
          <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
            <button onClick={() => setActiveTab('map')} className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.85rem' }}>
              View Lands Map
            </button>
            <button 
              onClick={() => setIsSettingsOpen(true)} 
              className="btn-primary" 
              style={{ padding: '10px 20px', fontSize: '0.85rem', backgroundColor: 'transparent', color: 'var(--primary-color)', border: '1px solid var(--primary-color)' }}
            >
              SMS Alert Settings
            </button>
          </div>
        </div>

        {/* Message Inbox & Replies Card */}
        <div className="card">
          <div className="card-subtitle">Agronomist Consultations</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ fontWeight: 700, fontFamily: 'var(--font-header)' }}>Agronomist Inbox</h4>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{messages.length} queries</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '250px', overflowY: 'auto', paddingRight: '5px' }}>
            {messages.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>
                No active consult queries. Click "Consult Agronomist" to submit a question.
              </p>
            ) : (
              messages.map((msg) => (
                <div 
                  key={msg.id} 
                  style={{ 
                    border: '1px solid var(--border-color)', 
                    borderRadius: '8px', 
                    padding: '12px', 
                    backgroundColor: msg.reply && !msg.read_by_farmer ? 'var(--bg-message-unread)' : 'var(--bg-card)',
                    fontSize: '0.85rem'
                  }}
                  onClick={() => msg.reply && !msg.read_by_farmer && handleMarkMessageRead(msg.id)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                    <span>Crop: {msg.crop}</span>
                    <span style={{ color: msg.reply ? 'var(--status-low)' : 'var(--status-med)' }}>
                      {msg.reply ? 'Replied' : 'Pending'}
                    </span>
                  </div>
                  <div style={{ fontWeight: 600, margin: '4px 0', color: 'var(--text-dark)' }}>Sub: {msg.subject}</div>
                  <p style={{ color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Q: {msg.message}</p>
                  
                  {msg.reply && (
                    <div style={{ marginTop: '8px', padding: '8px', background: 'var(--bg-cream)', borderRadius: '4px', borderLeft: '3px solid var(--accent-gold)' }}>
                      <div style={{ fontWeight: 700, color: 'var(--accent-gold)' }}>Reply:</div>
                      <p style={{ color: 'var(--text-dark)', marginTop: '2px' }}>{msg.reply}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="app-layout">
      {/* Sidebar navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onOpenConsult={() => setIsConsultOpen(true)} 
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenSupport={() => setToast({ message: 'Support is available 24/7. Contact us at support@greenacres.com or call +254 700 000 000', type: 'info' })}
      />

      <div className="main-wrapper">
        {/* Topheader bar */}
        <Header title={activeTab.charAt(0).toUpperCase() + activeTab.slice(1) + (activeTab === 'dashboard' ? ' Overview' : '')} />

        <main className="content-container">
          {renderActiveTabContent()}
        </main>
      </div>

      {/* Consult Agronomist Modal Form - ensure autocomplete is off */}
      <Modal 
        isOpen={isConsultOpen} 
        onClose={() => setIsConsultOpen(false)} 
        title="Consult Certified Agronomist"
      >
        <form onSubmit={handleConsultSubmit} className="auth-form" autoComplete="off">
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Ask our on-duty agronomist about crop diseases, fertilizers, sales linkage opportunities, or land treatments.
          </p>
          <div className="form-group">
            <label>Crop Category</label>
            <select 
              className="form-input"
              value={consultCrop}
              onChange={(e) => setConsultCrop(e.target.value)}
            >
              <option value="Wheat">Wheat</option>
              <option value="Maize">Maize</option>
              <option value="Soybeans">Soybeans</option>
              <option value="Other / Land Health">Other / Land Health</option>
            </select>
          </div>

          <div className="form-group">
            <label>Subject</label>
            <input 
              type="text" 
              className="form-input"
              value={consultSubject}
              onChange={(e) => setConsultSubject(e.target.value)}
              placeholder="e.g. Yellow rust spots on leaves"
              autoComplete="off"
              required
            />
          </div>

          <div className="form-group">
            <label>Detailed Question</label>
            <textarea 
              className="form-input"
              rows="4"
              value={consultMsg}
              onChange={(e) => setConsultMsg(e.target.value)}
              placeholder="Describe symptoms, soil conditions, or inquiries..."
              required
            ></textarea>
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>
            Submit Query
          </button>
        </form>
      </Modal>

      {/* Advanced configuration preferences and settings modal */}
      <Modal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        title="App Preferences & Settings"
      >
        <div style={{ display: 'flex', gap: '20px', minHeight: '380px' }}>
          {/* Settings Sidebar Tabs */}
          <div style={{ 
            width: '180px', 
            borderRight: '1px solid var(--border-color)', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '6px',
            paddingRight: '12px'
          }}>
            {[
              { id: 'profile', label: '👤 Profile & SMS' },
              { id: 'location', label: '📍 Location Prefs' },
              { id: 'units', label: '📏 Units & Sync' },
              { id: 'notifications', label: '🔔 Notifications' },
              { id: 'theme', label: '🎨 Theme & Style' },
              { id: 'system', label: '🛡️ Privacy & API' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSettingsTab(tab.id)}
                style={{
                  textAlign: 'left',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: settingsTab === tab.id ? 'var(--primary-color)' : 'transparent',
                  color: settingsTab === tab.id ? '#ffffff' : 'var(--text-dark)',
                  fontWeight: settingsTab === tab.id ? '700' : '500',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'var(--transition-smooth)'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Settings Tab Content */}
          <div style={{ flexGrow: 1, overflowY: 'auto', paddingLeft: '8px' }}>
            <form onSubmit={handleSettingsSubmit} className="auth-form" autoComplete="off" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '20px' }}>
                {settingsTab === 'profile' && (
                  <>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--primary-color)', fontFamily: 'var(--font-header)' }}>Profile & SMS alerts</div>
                    <div className="form-group">
                      <label>Farmer Name</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        autoComplete="off"
                      />
                    </div>

                    <div className="form-group">
                      <label>Mobile Number for SMS Alerts</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={profilePhone}
                        onChange={(e) => setProfilePhone(e.target.value)}
                        placeholder="e.g. +254712345678"
                        autoComplete="off"
                        required
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                      <label className="checkbox-label" style={{ fontWeight: 600 }}>
                        <input 
                          type="checkbox" 
                          checked={smsWeather}
                          onChange={(e) => setSmsWeather(e.target.checked)}
                        />
                        Subscribe to Localized Weather Alerts
                      </label>
                      <label className="checkbox-label" style={{ fontWeight: 600 }}>
                        <input 
                          type="checkbox" 
                          checked={smsSoil}
                          onChange={(e) => setSmsSoil(e.target.checked)}
                        />
                        Subscribe to Soil Moisture & pH Diagnostics
                      </label>
                      <label className="checkbox-label" style={{ fontWeight: 600 }}>
                        <input 
                          type="checkbox" 
                          checked={smsMarket}
                          onChange={(e) => setSmsMarket(e.target.checked)}
                        />
                        Subscribe to Commodity Sales & Price Bulletins
                      </label>
                    </div>
                  </>
                )}

                {settingsTab === 'location' && (
                  <>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--primary-color)', fontFamily: 'var(--font-header)' }}>Location Preferences</div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                      <div className="form-group">
                        <label>Region</label>
                        <select 
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
                        <label>County</label>
                        <select 
                          className="form-input"
                          value={selectedCounty}
                          onChange={(e) => setSelectedCounty(e.target.value)}
                        >
                          {(KENYAN_REGIONS[selectedRegion] || []).map(county => (
                            <option key={county} value={county}>{county}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                      <div className="form-group">
                        <label>Sub-County</label>
                        <select 
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
                        <label>Primary Crop</label>
                        <select 
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

                    <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '10px', marginTop: '5px' }}>
                      <input 
                        type="checkbox" 
                        id="gps-auto-detect"
                        checked={enableGps}
                        onChange={(e) => setEnableGps(e.target.checked)}
                        style={{ width: 'auto', cursor: 'pointer' }}
                      />
                      <label htmlFor="gps-auto-detect" style={{ textTransform: 'none', cursor: 'pointer', fontWeight: 600 }}>Enable GPS Auto‑detect</label>
                    </div>
                  </>
                )}

                {settingsTab === 'units' && (
                  <>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--primary-color)', fontFamily: 'var(--font-header)' }}>Units & Sync</div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                      <div className="form-group">
                        <label>Temperature Unit</label>
                        <select className="form-input" value={tempUnit} onChange={(e) => setTempUnit(e.target.value)}>
                          <option value="C">Celsius (°C)</option>
                          <option value="F">Fahrenheit (°F)</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Distance Unit</label>
                        <select className="form-input" value={distanceUnit} onChange={(e) => setDistanceUnit(e.target.value)}>
                          <option value="km">Kilometers (km)</option>
                          <option value="miles">Miles (mi)</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                      <div className="form-group">
                        <label>Rainfall Unit</label>
                        <select className="form-input" value={rainUnit} onChange={(e) => setRainUnit(e.target.value)}>
                          <option value="mm">Millimeters (mm)</option>
                          <option value="inches">Inches (in)</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Update Frequency</label>
                        <select className="form-input" value={updateFrequency} onChange={(e) => setUpdateFrequency(e.target.value)}>
                          <option value="30m">Every 30 Minutes</option>
                          <option value="hourly">Hourly</option>
                          <option value="6h">Every 6 Hours</option>
                          <option value="12h">Every 12 Hours</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}

                {settingsTab === 'notifications' && (
                  <>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--primary-color)', fontFamily: 'var(--font-header)' }}>Notification Settings</div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '5px' }}>
                      <label className="checkbox-label" style={{ fontWeight: 600 }}>
                        <input 
                          type="checkbox" 
                          checked={alertRain}
                          onChange={(e) => setAlertRain(e.target.checked)}
                        />
                        Enable rain & precipitation alerts
                      </label>

                      <label className="checkbox-label" style={{ fontWeight: 600 }}>
                        <input 
                          type="checkbox" 
                          checked={alertStorms}
                          onChange={(e) => setAlertStorms(e.target.checked)}
                        />
                        Enable storm & lightning threat warnings
                      </label>

                      <label className="checkbox-label" style={{ fontWeight: 600 }}>
                        <input 
                          type="checkbox" 
                          checked={alertExtremeTemp}
                          onChange={(e) => setAlertExtremeTemp(e.target.checked)}
                        />
                        Enable extreme temperature alarms
                      </label>

                      <label className="checkbox-label" style={{ fontWeight: 600 }}>
                        <input 
                          type="checkbox" 
                          checked={alertDailyForecast}
                          onChange={(e) => setAlertDailyForecast(e.target.checked)}
                        />
                        Enable daily morning weather digest
                      </label>
                    </div>
                  </>
                )}

                {settingsTab === 'theme' && (
                  <>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--primary-color)', fontFamily: 'var(--font-header)' }}>Theme & Display</div>
                    
                    <div className="form-group">
                      <label>Font Size</label>
                      <select className="form-input" value={displayFontSize} onChange={(e) => setDisplayFontSize(e.target.value)}>
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Background Style</label>
                      <select className="form-input" value={backgroundStyle} onChange={(e) => setBackgroundStyle(e.target.value)}>
                        <option value="glassmorphism">Premium Glassmorphism</option>
                        <option value="flat">Minimal Flat</option>
                        <option value="gradient">Modern Gradient</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Interface Language</label>
                      <select className="form-input" value={language} onChange={(e) => setLanguage(e.target.value)}>
                        <option value="en">🇬🇧 English</option>
                        <option value="sw">🇰🇪 Kiswahili (Swahili)</option>
                        <option value="ki">Gĩkũyũ (Kikuyu)</option>
                        <option value="luo">Dholuo (Luo)</option>
                        <option value="luh">Oluluyia (Luhya)</option>
                        <option value="kam">Kikamba (Kamba)</option>
                        <option value="kal">Kalenjin (Nandi/Tugen)</option>
                        <option value="kis">Ekegusii (Kisii)</option>
                        <option value="mer">Kimeru (Meru)</option>
                        <option value="mij">Kigiriama (Mijikenda)</option>
                        <option value="maa">Maa (Maasai)</option>
                        <option value="so">Af Soomaali (Somali)</option>
                        <option value="fr">Français</option>
                      </select>
                    </div>
                  </>
                )}

                {settingsTab === 'system' && (
                  <>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--primary-color)', fontFamily: 'var(--font-header)' }}>Privacy & Data API Source</div>
                    
                    <div className="form-group">
                      <label>Weather Provider API Source</label>
                      <select className="form-input" value={weatherSource} onChange={(e) => setWeatherSource(e.target.value)}>
                        <option value="openweather">OpenWeatherMap API</option>
                        <option value="climacell">Tomorrow.io API</option>
                        <option value="aerisweather">AerisWeather Feed</option>
                        <option value="metoffice">Kenya Meteorological Dept Feed</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Mapbox API Token (for Location Search)</label>
                      <input
                        type="text"
                        className="form-input"
                        value={mapboxToken}
                        onChange={(e) => setMapboxToken(e.target.value)}
                        placeholder="pk.eyJ1Ijoi... (paste your Mapbox public token)"
                        style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}
                      />
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Get a free token at mapbox.com → Account → Tokens</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
                      <label className="checkbox-label" style={{ fontWeight: 600 }}>
                        <input 
                          type="checkbox" 
                          checked={gpsPermission}
                          onChange={(e) => setGpsPermission(e.target.checked)}
                        />
                        Allow GPS location tracking permission
                      </label>

                      <label className="checkbox-label" style={{ fontWeight: 600 }}>
                        <input 
                          type="checkbox" 
                          checked={dataSharing}
                          onChange={(e) => setDataSharing(e.target.checked)}
                        />
                        Enable anonymous telemetry data sharing
                      </label>
                    </div>
                  </>
                )}
              </div>

              <div style={{ 
                borderTop: '1px solid var(--border-color)', 
                paddingTop: '15px', 
                display: 'flex', 
                justifyContent: 'flex-end', 
                gap: '12px',
                marginTop: 'auto'
              }}>
                <button 
                  type="button" 
                  onClick={() => setIsSettingsOpen(false)} 
                  className="btn-primary" 
                  style={{ backgroundColor: 'transparent', color: 'var(--text-dark)', border: '1px solid var(--border-color)', width: 'auto', margin: 0 }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ width: 'auto', margin: 0 }}>
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      </Modal>

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

export default DashboardPage;

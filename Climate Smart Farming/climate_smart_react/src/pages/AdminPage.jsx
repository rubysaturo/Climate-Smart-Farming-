import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Toast from '../components/Toast';
import Modal from '../components/Modal';
import api from '../api/axios';
import { KENYAN_REGIONS, CROP_TYPES } from '../utils/regions';

const AdminPage = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState('admin'); // sets active navigation tab

  // Admin control values
  const [inbox, setInbox] = useState([]);
  const [selectedMsg, setSelectedMsg] = useState(null);
  const [replyText, setReplyText] = useState('');

  // Weather update form values
  const [weatherTodayId, setWeatherTodayId] = useState(1);
  const [weatherHigh, setWeatherHigh] = useState(24);
  const [weatherLow, setWeatherLow] = useState(15);
  const [weatherCondition, setWeatherCondition] = useState('Sunny');
  const [weatherPrecip, setWeatherPrecip] = useState(10);

  // Soil update form values
  const [soilRegion, setSoilRegion] = useState('Rift Valley Region');
  const [soilCounty, setSoilCounty] = useState('Nakuru County');
  const [soilSubCounty, setSoilSubCounty] = useState('Njoro');
  const [soilCrop, setSoilCrop] = useState('Wheat');
  const soilSector = `${soilCounty} - ${soilSubCounty} (${soilCrop})`;

  const [soilMoisture, setSoilMoisture] = useState(75);
  const [soilPh, setSoilPh] = useState(6.5);
  const [soilN, setSoilN] = useState(45);
  const [soilP, setSoilP] = useState(18);
  const [soilK, setSoilK] = useState(240);
  const [soilTips, setSoilTips] = useState('');

  // Pest alert form values
  const [pestTitle, setPestTitle] = useState('');
  const [pestRisk, setPestRisk] = useState('High');
  const [pestRegion, setPestRegion] = useState('Rift Valley Region');
  const [pestCounty, setPestCounty] = useState('Nakuru County');
  const [pestSubCounty, setPestSubCounty] = useState('Njoro');
  const [pestCrop, setPestCrop] = useState('Wheat');
  const [pestSectorAll, setPestSectorAll] = useState(false);
  const pestSector = pestSectorAll ? 'All Counties' : `${pestCounty} - ${pestSubCounty} (${pestCrop})`;

  const [pestDesc, setPestDesc] = useState('');
  const [pestMitigation, setPestMitigation] = useState('');

  useEffect(() => {
    const counties = KENYAN_REGIONS[soilRegion];
    if (counties && counties.length > 0 && !counties.includes(soilCounty)) {
      setSoilCounty(counties[0]);
    }
  }, [soilRegion]);

  useEffect(() => {
    const counties = KENYAN_REGIONS[pestRegion];
    if (counties && counties.length > 0 && !counties.includes(pestCounty)) {
      setPestCounty(counties[0]);
    }
  }, [pestRegion]);

  // Commodity price update values
  const [selectedCropId, setSelectedCropId] = useState(1);
  const [newCropPrice, setNewCropPrice] = useState(4200);

  useEffect(() => {
    // Strict admin role guard
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchInbox();
    fetchCurrentFormValues();
    return () => {
      setReplyText('');
      setPestTitle('');
      setPestDesc('');
      setPestMitigation('');
    };
  }, []);

  const fetchInbox = async () => {
    try {
      const response = await api.get('/api/messages/');
      setInbox(response.data || []);
    } catch (err) {
      console.log('Using mock messages fallback');
      setInbox([
        { id: 101, crop: 'Wheat', subject: 'Yellow spots on leaf whorl', message: 'Hi, I notice small yellow spots on my wheat crop leaves in Sector 74. What could this be?', reply: null, sender_details: { username: 'john_njoroge', name: 'John Njoroge' }, created_at: new Date().toISOString() }
      ]);
    }
  };

  const fetchCurrentFormValues = async () => {
    try {
      const weatherRes = await api.get('/api/weather/');
      const today = weatherRes.data.find(w => w.is_today) || weatherRes.data[0];
      if (today) {
        setWeatherTodayId(today.id);
        setWeatherHigh(today.temp_high);
        setWeatherLow(today.temp_low);
        setWeatherCondition(today.condition);
        setWeatherPrecip(today.precip_chance);
      }

      const soilRes = await api.get(`/api/soil/by_sector/?sector=${encodeURIComponent(soilSector)}`);
      if (soilRes.data) {
        setSoilMoisture(soilRes.data.moisture);
        setSoilPh(soilRes.data.ph);
        setSoilN(soilRes.data.nitrogen);
        setSoilP(soilRes.data.phosphorus);
        setSoilK(soilRes.data.potassium);
        setSoilTips(soilRes.data.tips);
      }
    } catch (err) {
      setSoilTips('Soil moisture is optimal. Add nitrogen-rich organic compost to maintain wheat yields.');
    }
  };

  const handleWeatherSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        temp_high: weatherHigh,
        temp_low: weatherLow,
        condition: weatherCondition,
        precip_chance: weatherPrecip
      };
      await api.patch(`/api/weather/${weatherTodayId}/`, payload);
      setToast({ message: "Today's forecast updated successfully!", type: 'success' });
    } catch (err) {
      setToast({ message: "Forecast updated! (Simulated write)", type: 'success' });
    }
  };

  const handleSoilSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        moisture: soilMoisture,
        ph: soilPh,
        nitrogen: soilN,
        phosphorus: soilP,
        potassium: soilK,
        tips: soilTips
      };
      // For fallback retrieve ID of current record
      const checkSoil = await api.get(`/api/soil/by_sector/?sector=${encodeURIComponent(soilSector)}`);
      if (checkSoil.data) {
        await api.patch(`/api/soil/${checkSoil.data.id}/`, payload);
      }
      setToast({ message: 'Soil diagnostics telemetry updated!', type: 'success' });
    } catch (err) {
      setToast({ message: 'Soil metrics saved! (Simulated write)', type: 'success' });
    }
  };

  const handlePestSubmit = async (e) => {
    e.preventDefault();
    if (!pestTitle || !pestDesc || !pestMitigation) {
      setToast({ message: 'Please fill in all pest alert details.', type: 'error' });
      return;
    }

    try {
      const payload = {
        title: pestTitle,
        risk_level: pestRisk,
        sector: pestSector,
        description: pestDesc,
        mitigation: pestMitigation
      };
      await api.post('/api/pest-alerts/', payload);
      setToast({ message: 'New Pest Risk Alert published!', type: 'success' });
      setPestTitle('');
      setPestDesc('');
      setPestMitigation('');
    } catch (err) {
      setToast({ message: 'Pest alert published! (Simulated write)', type: 'success' });
      setPestTitle('');
      setPestDesc('');
      setPestMitigation('');
    }
  };

  const handlePriceSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/api/commodities/${selectedCropId}/`, { price_kes: newCropPrice });
      setToast({ message: 'Commodity price index updated.', type: 'success' });
    } catch (err) {
      setToast({ message: 'Crop price updated! (Simulated write)', type: 'success' });
    }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyText) return;

    try {
      await api.post(`/api/messages/${selectedMsg.id}/reply/`, { reply: replyText });
      setToast({ message: 'Reply sent to farmer.', type: 'success' });
      setReplyText('');
      setSelectedMsg(null);
      fetchInbox();
    } catch (err) {
      setToast({ message: 'Reply dispatched via SMS simulation!', type: 'success' });
      setInbox(inbox.map(m => m.id === selectedMsg.id ? { ...m, reply: replyText } : m));
      setReplyText('');
      setSelectedMsg(null);
    }
  };

  return (
    <div className="app-layout">
      {/* Sidebar navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          if (tab === 'admin') {
            setActiveTab('admin');
          } else {
            navigate('/dashboard');
          }
        }}
        onOpenConsult={() => {}}
      />

      <div className="main-wrapper">
        <Header title="Agronomist Admin Console" />

        <main className="content-container">
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px' }}>
            
            {/* Telemetry & Control panel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              
              {/* Telemetry Updates (Weather & Soil) */}
              <div className="card">
                <div className="card-subtitle">IoT Telemetry Feeds Override</div>
                <h4 style={{ color: 'var(--primary-color)', fontWeight: 700, fontFamily: 'var(--font-header)' }}>Update Forecast & Soil Metrics</h4>
                
                {/* Weather Form */}
                <form onSubmit={handleWeatherSubmit} style={{ marginTop: '15px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }} autoComplete="off">
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '10px' }}>Weather Conditions Today:</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div className="form-group">
                      <label>High Temp (°C)</label>
                      <input type="number" className="form-input" value={weatherHigh} onChange={(e) => setWeatherHigh(parseInt(e.target.value))} />
                    </div>
                    <div className="form-group">
                      <label>Low Temp (°C)</label>
                      <input type="number" className="form-input" value={weatherLow} onChange={(e) => setWeatherLow(parseInt(e.target.value))} />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '10px' }}>
                    <div className="form-group">
                      <label>Condition</label>
                      <select className="form-input" value={weatherCondition} onChange={(e) => setWeatherCondition(e.target.value)}>
                        <option value="Sunny">Sunny</option>
                        <option value="Partly Cloudy">Partly Cloudy</option>
                        <option value="Cloudy">Cloudy</option>
                        <option value="Heavy Rain">Heavy Rain</option>
                        <option value="Mostly Clear">Mostly Clear</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Precipitation Chance (%)</label>
                      <input type="number" className="form-input" value={weatherPrecip} onChange={(e) => setWeatherPrecip(parseInt(e.target.value))} />
                    </div>
                  </div>
                  <button type="submit" className="btn-primary" style={{ marginTop: '12px', padding: '10px 20px', fontSize: '0.85rem' }}>
                    Update Today's Weather
                  </button>
                </form>

                {/* Soil Form */}
                <form onSubmit={handleSoilSubmit} style={{ marginTop: '20px' }} autoComplete="off">
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '10px' }}>Soil Health Override:</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div className="form-group" style={{ marginBottom: '10px' }}>
                      <label>Target Region</label>
                      <select className="form-input" value={soilRegion} onChange={(e) => setSoilRegion(e.target.value)}>
                        {Object.keys(KENYAN_REGIONS).map((region) => (
                          <option key={region} value={region}>{region}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group" style={{ marginBottom: '10px' }}>
                      <label>Target County</label>
                      <select className="form-input" value={soilCounty} onChange={(e) => setSoilCounty(e.target.value)}>
                        {(KENYAN_REGIONS[soilRegion] || []).map((county) => (
                          <option key={county} value={county}>{county}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div className="form-group" style={{ marginBottom: '10px' }}>
                      <label>Sub-county</label>
                      <input type="text" className="form-input" value={soilSubCounty} onChange={(e) => setSoilSubCounty(e.target.value)} placeholder="E.g., Njoro" />
                    </div>
                    <div className="form-group" style={{ marginBottom: '10px' }}>
                      <label>Primary Crop</label>
                      <select className="form-input" value={soilCrop} onChange={(e) => setSoilCrop(e.target.value)}>
                        {CROP_TYPES.map((crop) => (
                          <option key={crop} value={crop}>{crop}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div className="form-group">
                      <label>Moisture Content (%)</label>
                      <input type="number" className="form-input" value={soilMoisture} onChange={(e) => setSoilMoisture(parseInt(e.target.value))} />
                    </div>
                    <div className="form-group">
                      <label>Soil pH</label>
                      <input type="number" step="0.1" className="form-input" value={soilPh} onChange={(e) => setSoilPh(parseFloat(e.target.value))} />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginTop: '10px' }}>
                    <div className="form-group">
                      <label>Nitrogen (N)</label>
                      <input type="number" className="form-input" value={soilN} onChange={(e) => setSoilN(parseInt(e.target.value))} />
                    </div>
                    <div className="form-group">
                      <label>Phosphorus (P)</label>
                      <input type="number" className="form-input" value={soilP} onChange={(e) => setSoilP(parseInt(e.target.value))} />
                    </div>
                    <div className="form-group">
                      <label>Potassium (K)</label>
                      <input type="number" className="form-input" value={soilK} onChange={(e) => setSoilK(parseInt(e.target.value))} />
                    </div>
                  </div>
                  <div className="form-group" style={{ marginTop: '10px' }}>
                    <label>Stewardship Tips & Recommendations</label>
                    <textarea className="form-input" rows="3" value={soilTips} onChange={(e) => setSoilTips(e.target.value)}></textarea>
                  </div>
                  <button type="submit" className="btn-primary" style={{ marginTop: '12px', padding: '10px 20px', fontSize: '0.85rem' }}>
                    Save Soil Telemetry
                  </button>
                </form>
              </div>

              {/* Crop Price index changes */}
              <div className="card">
                <div className="card-subtitle">Commodity Market Control</div>
                <h4 style={{ color: 'var(--primary-color)', fontWeight: 700, fontFamily: 'var(--font-header)' }}>Update Crop Trading Prices</h4>
                <form onSubmit={handlePriceSubmit} style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', marginTop: '10px' }} autoComplete="off">
                  <div className="form-group" style={{ flexGrow: 1 }}>
                    <label>Crop</label>
                    <select className="form-input" value={selectedCropId} onChange={(e) => setSelectedCropId(parseInt(e.target.value))}>
                      <option value="1">Wheat (90kg Bag)</option>
                      <option value="2">Maize (90kg Bag)</option>
                      <option value="3">Soybeans (90kg Bag)</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ width: '150px' }}>
                    <label>Price (KES)</label>
                    <input type="number" className="form-input" value={newCropPrice} onChange={(e) => setNewCropPrice(parseInt(e.target.value))} />
                  </div>
                  <button type="submit" className="btn-primary" style={{ padding: '12px 20px' }}>
                    Update
                  </button>
                </form>
              </div>

            </div>

            {/* Inquiries & Pest issuance */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              
              {/* Farmer Inquiries Inbox */}
              <div className="card">
                <div className="card-subtitle">Consultation Queue</div>
                <h4 style={{ color: 'var(--primary-color)', fontWeight: 700, fontFamily: 'var(--font-header)' }}>Agronomist Inquiries Inbox</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxHeight: '300px', overflowY: 'auto', marginTop: '10px' }}>
                  {inbox.map((msg) => (
                    <div 
                      key={msg.id} 
                      style={{ 
                        border: '1px solid var(--border-color)', 
                        borderRadius: '8px', 
                        padding: '12px', 
                        backgroundColor: msg.reply ? 'var(--bg-card)' : 'var(--bg-message-unread)',
                        cursor: msg.reply ? 'default' : 'pointer'
                      }}
                      onClick={() => !msg.reply && setSelectedMsg(msg)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <span>Farmer: <strong>{msg.sender_details?.name || msg.sender_details?.username}</strong></span>
                        <span style={{ color: msg.reply ? 'var(--status-low)' : 'var(--status-med)', fontWeight: 700 }}>
                          {msg.reply ? 'Answered' : 'Pending Action'}
                        </span>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', margin: '4px 0' }}>Sub: {msg.subject} (Crop: {msg.crop})</div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-dark)' }}>{msg.message}</p>
                      {msg.reply && (
                        <p style={{ fontSize: '0.8rem', background: 'var(--bg-input)', padding: '6px', borderRadius: '4px', borderLeft: '3px solid var(--accent-gold)', marginTop: '8px' }}>
                          <strong>A:</strong> {msg.reply}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Publish Pest Warning */}
              <div className="card">
                <div className="card-subtitle">Public Advisory Bulletin</div>
                <h4 style={{ color: 'var(--primary-color)', fontWeight: 700, fontFamily: 'var(--font-header)' }}>Publish Pest Alert</h4>
                <form onSubmit={handlePestSubmit} className="auth-form" style={{ marginTop: '10px' }} autoComplete="off">
                  <div className="form-group">
                    <label>Pest or Disease Title</label>
                    <input type="text" className="form-input" value={pestTitle} onChange={(e) => setPestTitle(e.target.value)} placeholder="e.g. Stem Borer Outbreak" required />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div className="form-group">
                      <label>Risk Level</label>
                      <select className="form-input" value={pestRisk} onChange={(e) => setPestRisk(e.target.value)}>
                        <option value="High">High Risk</option>
                        <option value="Medium">Medium Risk</option>
                        <option value="Low">Low Risk</option>
                      </select>
                    </div>
                    <div className="form-group" style={{ display: 'flex', alignItems: 'center' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                        <input type="checkbox" checked={pestSectorAll} onChange={(e) => setPestSectorAll(e.target.checked)} />
                        Apply to All Counties
                      </label>
                    </div>
                  </div>
                  {!pestSectorAll && (
                    <>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div className="form-group">
                          <label>Target Region</label>
                          <select className="form-input" value={pestRegion} onChange={(e) => setPestRegion(e.target.value)}>
                            {Object.keys(KENYAN_REGIONS).map((region) => (
                              <option key={region} value={region}>{region}</option>
                            ))}
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Target County</label>
                          <select className="form-input" value={pestCounty} onChange={(e) => setPestCounty(e.target.value)}>
                            {(KENYAN_REGIONS[pestRegion] || []).map((county) => (
                              <option key={county} value={county}>{county}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div className="form-group">
                          <label>Sub-county</label>
                          <input type="text" className="form-input" value={pestSubCounty} onChange={(e) => setPestSubCounty(e.target.value)} placeholder="E.g., Njoro" />
                        </div>
                        <div className="form-group">
                          <label>Primary Crop</label>
                          <select className="form-input" value={pestCrop} onChange={(e) => setPestCrop(e.target.value)}>
                            {CROP_TYPES.map((crop) => (
                              <option key={crop} value={crop}>{crop}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </>
                  )}
                  <div className="form-group">
                    <label>Incident Diagnosis</label>
                    <textarea className="form-input" rows="2" value={pestDesc} onChange={(e) => setPestDesc(e.target.value)} placeholder="Describe physical symptoms or hatching trends..." required></textarea>
                  </div>
                  <div className="form-group">
                    <label>Recommended Mitigation</label>
                    <textarea className="form-input" rows="2" value={pestMitigation} onChange={(e) => setPestMitigation(e.target.value)} placeholder="List organic/chemical sprays or techniques..." required></textarea>
                  </div>
                  <button type="submit" className="btn-primary" style={{ padding: '12px' }}>
                    Publish Pest Advisory
                  </button>
                </form>
              </div>

            </div>

          </div>
        </main>
      </div>

      {/* Reply dialog popup - autocomplete=off */}
      <Modal isOpen={!!selectedMsg} onClose={() => setSelectedMsg(null)} title="Reply to Farmer Consultation">
        {selectedMsg && (
          <form onSubmit={handleReplySubmit} className="auth-form" autoComplete="off">
            <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Farmer: {selectedMsg.sender_details?.name} (username: {selectedMsg.sender_details?.username})</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, margin: '4px 0' }}>Q: {selectedMsg.message}</div>
            </div>

            <div className="form-group">
              <label>Your Response (will send via SMS alert)</label>
              <textarea 
                className="form-input"
                rows="5"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Key in detailed solution or mitigation recommendations..."
                required
              ></textarea>
            </div>
            
            <button type="submit" className="btn-primary">
              Send Reply
            </button>
          </form>
        )}
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

export default AdminPage;

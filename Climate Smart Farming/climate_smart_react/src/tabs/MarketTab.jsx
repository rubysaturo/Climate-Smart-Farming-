import React, { useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { CROP_TYPES } from '../utils/regions';

const currencySymbols = {
  KES: 'KES',
  USD: '$',
  EUR: '€',
  TZS: 'TSh',
  UGX: 'USh'
};

const MarketTab = ({ setToast }) => {
  const { user } = useContext(AuthContext);
  const [commodities, setCommodities] = useState([
    { id: 1, crop: 'Wheat (90kg Bag)', price_kes: 4200, change_pct: 1.2, is_up: true, demand_level: 'High', volume_tonnes: 1250 },
    { id: 2, crop: 'Maize (90kg Bag)', price_kes: 3150, change_pct: -0.8, is_up: false, demand_level: 'Moderate', volume_tonnes: 3400 },
    { id: 3, crop: 'Soybeans (90kg Bag)', price_kes: 6800, change_pct: 2.5, is_up: true, demand_level: 'High', volume_tonnes: 600 }
  ]);

  const [selectedCurrency, setSelectedCurrency] = useState('KES');
  const [exchangeRates, setExchangeRates] = useState({ KES: 1, USD: 0.0077, EUR: 0.0068, TZS: 20.3, UGX: 28.3 });
  const [ratesLoading, setRatesLoading] = useState(false);

  const [buyerName, setBuyerName] = useState('');
  const [buyerType, setBuyerType] = useState('NCPB Nakuru Depo');
  const [proposalVolume, setProposalVolume] = useState('');
  const [proposalPrice, setProposalPrice] = useState('');
  const [proposalMsg, setProposalMsg] = useState('');
  const [proposalCrop, setProposalCrop] = useState('Wheat');
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchCommodities();
    fetchRates();
  }, []);

  const fetchRates = async () => {
    setRatesLoading(true);
    try {
      const response = await fetch('https://open.er-api.com/v6/latest/KES');
      const data = await response.json();
      if (data && data.result === 'success' && data.rates) {
        setExchangeRates({
          KES: 1,
          USD: data.rates.USD || 0.0077,
          EUR: data.rates.EUR || 0.0068,
          TZS: data.rates.TZS || 20.3,
          UGX: data.rates.UGX || 28.3
        });
      }
    } catch (err) {
      console.log('Failed to fetch live exchange rates, using local fallback rates.');
    } finally {
      setRatesLoading(false);
    }
  };

  const fetchCommodities = async () => {
    try {
      const response = await api.get('/api/commodities/');
      if (response.data && response.data.length > 0) {
        setCommodities(response.data);
      }
    } catch (err) {
      console.log('Backend offline, using local commodity mock data');
    }
  };

  const formatPrice = (kesVal) => {
    const rate = exchangeRates[selectedCurrency] || 1;
    const converted = kesVal * rate;
    if (selectedCurrency === 'KES') {
      return Math.round(converted).toLocaleString();
    }
    if (selectedCurrency === 'USD' || selectedCurrency === 'EUR') {
      return converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return Math.round(converted).toLocaleString();
  };

  const handleProposalSubmit = (e) => {
    e.preventDefault();
    if (!buyerName || !proposalVolume || !proposalPrice) {
      setToast({ message: 'Please complete all required fields.', type: 'error' });
      return;
    }

    if (editingId) {
      setCommodities(prev => prev.map(comm => 
        comm.id === editingId ? {
          ...comm,
          crop: `${proposalCrop} (90kg Bag) - Yours`,
          price_kes: Number(proposalPrice),
          volume_tonnes: Number(proposalVolume)
        } : comm
      ));
      setToast({ message: 'Your proposal has been updated successfully.', type: 'success' });
      setEditingId(null);
    } else {
      const newCommodity = {
        id: Date.now(),
        crop: `${proposalCrop} (90kg Bag) - Yours`,
        price_kes: Number(proposalPrice),
        change_pct: 0.0,
        is_up: true,
        demand_level: 'Your Proposal',
        volume_tonnes: Number(proposalVolume),
        is_own_proposal: true
      };
      setCommodities(prev => [newCommodity, ...prev]);
      setToast({ 
        message: `Proposal sent successfully to ${buyerType}! They will contact you via SMS shortly. Asked Price: ${currencySymbols[selectedCurrency]} ${proposalPrice}`, 
        type: 'success' 
      });
    }

    setBuyerName('');
    setProposalVolume('');
    setProposalPrice('');
    setProposalMsg('');
  };

  const handleEditProposal = (comm) => {
    setBuyerName(user?.name || '');
    setProposalVolume(comm.volume_tonnes);
    setProposalPrice(comm.price_kes);
    setProposalCrop(comm.crop.split(' ')[0]);
    setEditingId(comm.id);
    document.getElementById('proposal-form').scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <div className="card" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <div className="card-subtitle">Market Telemetry & Linked Buyers</div>
          <h3 style={{ color: 'var(--primary-color)', fontFamily: 'var(--font-header)' }}>National Commodity Index ({selectedCurrency})</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>Prices converted using live ExchangeRate-API feeds. Reference: East Africa Grain Hub.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Currency:</span>
          <select
            value={selectedCurrency}
            onChange={(e) => setSelectedCurrency(e.target.value)}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              fontSize: '0.85rem',
              fontWeight: 700,
              backgroundColor: 'var(--bg-card)',
              color: 'var(--text-dark)',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="KES">KES (Kenyan Shilling)</option>
            <option value="USD">USD (US Dollar)</option>
            <option value="EUR">EUR (Euro)</option>
            <option value="TZS">TZS (Tanzanian Shilling)</option>
            <option value="UGX">UGX (Ugandan Shilling)</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
        {commodities.map((comm) => (
          <div key={comm.id} className="card" style={{ gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>{comm.crop}</span>
              {comm.is_own_proposal ? (
                <button 
                  onClick={() => handleEditProposal(comm)}
                  style={{ background: 'transparent', border: '1px solid var(--primary-color)', color: 'var(--primary-color)', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}
                >
                  Edit
                </button>
              ) : (
                <span 
                  style={{ 
                    color: comm.is_up ? 'var(--status-low)' : 'var(--status-high)',
                    fontWeight: 700,
                    fontSize: '0.85rem'
                  }}
                >
                  {comm.is_up ? '▲' : '▼'} {comm.change_pct}%
                </span>
              )}
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-header)', color: 'var(--primary-color)' }}>
              {currencySymbols[selectedCurrency]} {formatPrice(comm.price_kes)}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', borderTop: '1px solid var(--border-color)', paddingTop: '10px', marginTop: '5px' }}>
              <span>Demand: <strong>{comm.demand_level}</strong></span>
              <span>Traded Vol: <strong>{comm.volume_tonnes} T</strong></span>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-subtitle">Wheat Price Trend (Last 6 Months)</div>
        <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '20px 10px 10px 10px', gap: '15px' }}>
          {[
            { month: 'Jan', price: 3800 },
            { month: 'Feb', price: 3950 },
            { month: 'Mar', price: 4100 },
            { month: 'Apr', price: 4050 },
            { month: 'May', price: 4120 },
            { month: 'Jun', price: 4200 }
          ].map((bar, idx) => {
              const pct = ((bar.price - 3000) / 1500) * 100;
              return (
                <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                    {currencySymbols[selectedCurrency]} {formatPrice(bar.price)}
                  </div>
                  <div style={{ width: '100%', maxWidth: '50px', background: 'var(--primary-color)', height: `${pct}px`, borderRadius: '4px 4px 0 0', minHeight: '10px', transition: 'var(--transition-smooth)' }}></div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>{bar.month}</div>
                </div>
              );
          })}
        </div>
      </div>

      <div className="card">
        <div className="card-subtitle">Market Linkages: Connect with Registered Wholesalers</div>
        <h4 id="proposal-form" style={{ color: 'var(--primary-color)', fontWeight: 700, fontFamily: 'var(--font-header)', marginBottom: '10px' }}>
          {editingId ? 'Edit Sales Proposal' : 'Submit Sales Proposal'}
        </h4>
        <form onSubmit={handleProposalSubmit} className="auth-form" style={{ maxWidth: '100%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label>Select Wholesaler / Depo</label>
              <select 
                className="form-input"
                value={buyerType}
                onChange={(e) => setBuyerType(e.target.value)}
              >
                <option value="NCPB Nakuru Depo">NCPB Nakuru Depo (State Grain Agency)</option>
                <option value="East Africa Flour Millers">East Africa Flour Millers Ltd</option>
                <option value="Rift Valley Grains Co.">Rift Valley Grains Co.</option>
                <option value="Equator Feeds & Seeds">Equator Feeds & Seeds</option>
              </select>
            </div>

            <div className="form-group">
              <label>Crop / Commodity</label>
              <select 
                className="form-input"
                value={proposalCrop}
                onChange={(e) => setProposalCrop(e.target.value)}
              >
                {CROP_TYPES.map(crop => (
                  <option key={crop} value={crop}>{crop}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', marginBottom: '20px' }}>
            <div className="form-group">
              <label>Your Contact Name</label>
              <input 
                type="text" 
                className="form-input"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                placeholder="Enter your name"
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label>Quantity to Sell (Bags)</label>
              <input 
                type="number" 
                className="form-input"
                value={proposalVolume}
                onChange={(e) => setProposalVolume(e.target.value)}
                placeholder="e.g. 50"
                required
              />
            </div>

            <div className="form-group">
              <label>Asked Price per Bag ({selectedCurrency})</label>
              <input 
                type="number" 
                className="form-input"
                value={proposalPrice}
                onChange={(e) => setProposalPrice(e.target.value)}
                placeholder={`e.g. ${formatPrice(4150).replace(/,/g, '')}`}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Additional Notes / Crop Quality Description</label>
            <textarea 
              className="form-input"
              rows="3"
              value={proposalMsg}
              onChange={(e) => setProposalMsg(e.target.value)}
              placeholder="e.g. Premium Grade-1 Wheat harvest. Dryness 13%. Ready for transit."
            ></textarea>
          </div>

          <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start', padding: '12px 24px' }}>
            {editingId ? 'Update Sales Proposal' : 'Send Sales Proposal'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MarketTab;

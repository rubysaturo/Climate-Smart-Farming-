import React, { useState, useEffect } from 'react';

const MOCK_FARMERS = [
  {
    id: 1,
    name: 'John Kamau',
    business: 'Kamau Agro Holdings',
    produce: ['Maize', 'Beans', 'Sorghum'],
    location: 'Trans Nzoia County - Kwanza',
    phone: '+254 722 345 678',
    email: 'kamau@greenacres.ke',
    description: 'Large-scale grain farmer with 3+ decades in the Rift Valley breadbasket region. Available for bulk purchasing arrangements.',
    avatar: 'KA',
    color: '#2E7D32'
  },
  {
    id: 2,
    name: 'Wanjiku Njoroge',
    business: 'Wanjiku Farm Trust',
    produce: ['Soybeans', 'Sunflower', 'Groundnuts'],
    location: 'Uasin Gishu County - Moiben',
    phone: '+254 733 890 123',
    email: 'wanjiku@wanjiku-trust.ke',
    description: 'Specializes in oilseed crops and partners with Kenya Oilseeds Processor Association. Cold-press oil production facility on-site.',
    avatar: 'WN',
    color: '#F57C00'
  },
  {
    id: 3,
    name: 'Peter Odhiambo',
    business: 'Lake Basin Greens',
    produce: ['Tomatoes', 'Kale', 'Capsicum', 'Onions'],
    location: 'Kisumu County - Ahero',
    phone: '+254 710 456 789',
    email: 'peter@lakebasin.ke',
    description: 'Irrigation-fed horticultural farmer near the Lake Victoria basin. Supplies to Kisumu, Nairobi, and Mombasa markets weekly.',
    avatar: 'PO',
    color: '#1565C0'
  },
  {
    id: 4,
    name: 'Amina Hassan',
    business: 'Dryland Smart Farms',
    produce: ['Sorghum', 'Millet', 'Cowpea'],
    location: 'Marsabit County - Moyale',
    phone: '+254 711 234 567',
    email: 'amina@dryland.ke',
    description: 'Pioneer in drought-resistant crop farming in arid Northern Kenya. Sells through county cooperatives and NGO food programs.',
    avatar: 'AH',
    color: '#AD1457'
  },
  {
    id: 5,
    name: 'James Mwangi',
    business: 'Highland Dairy & Crops',
    produce: ['Wheat', 'Dairy Milk', 'Pyrethrum'],
    location: 'Nyandarua County - Ol Kalou',
    phone: '+254 708 567 890',
    email: 'mwangi@highland.ke',
    description: 'Mixed farmer operating dairy cattle and grain estates at 2,200m altitude. Premium highland wheat and raw milk available year-round.',
    avatar: 'JM',
    color: '#00695C'
  },
  {
    id: 6,
    name: 'Grace Otieno',
    business: 'Siaya Organic Collective',
    produce: ['Sweet Potatoes', 'Cassava', 'Finger Millet', 'Passion Fruits'],
    location: 'Siaya County - Bondo',
    phone: '+254 799 123 456',
    email: 'grace@siaya-organic.ke',
    description: 'Certified organic farmer and co-op leader promoting sustainable subsistence farming practices across Western Kenya.',
    avatar: 'GO',
    color: '#558B2F'
  }
];

const BusinessDirectoryTab = () => {
  const [farmers, setFarmers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProduce, setFilterProduce] = useState('');
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newFarmer, setNewFarmer] = useState({ name: '', business: '', produce: '', location: '', phone: '', email: '', description: '' });

  useEffect(() => {
    // Load from localStorage for offline persistence
    const saved = localStorage.getItem('farmerDirectory');
    if (saved) {
      setFarmers(JSON.parse(saved));
    } else {
      setFarmers(MOCK_FARMERS);
      localStorage.setItem('farmerDirectory', JSON.stringify(MOCK_FARMERS));
    }
  }, []);

  const handleAddFarmer = (e) => {
    e.preventDefault();
    const initials = newFarmer.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    const colors = ['#2E7D32', '#F57C00', '#1565C0', '#AD1457', '#558B2F', '#00695C'];
    const farmer = {
      id: Date.now(),
      ...newFarmer,
      produce: newFarmer.produce.split(',').map(p => p.trim()),
      avatar: initials,
      color: colors[Math.floor(Math.random() * colors.length)]
    };
    const updated = [farmer, ...farmers];
    setFarmers(updated);
    localStorage.setItem('farmerDirectory', JSON.stringify(updated));
    setShowAddForm(false);
    setNewFarmer({ name: '', business: '', produce: '', location: '', phone: '', email: '', description: '' });
  };

  const allProduce = [...new Set(farmers.flatMap(f => Array.isArray(f.produce) ? f.produce : [f.produce]))];

  const filtered = farmers.filter(f => {
    const produceArr = Array.isArray(f.produce) ? f.produce : [f.produce];
    const matchSearch = !searchQuery ||
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.business.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      produceArr.join(' ').toLowerCase().includes(searchQuery.toLowerCase());
    const matchProduce = !filterProduce || produceArr.includes(filterProduce);
    return matchSearch && matchProduce;
  });

  if (selectedFarmer) {
    const produceArr = Array.isArray(selectedFarmer.produce) ? selectedFarmer.produce : [selectedFarmer.produce];
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <button
          onClick={() => setSelectedFarmer(null)}
          style={{ alignSelf: 'flex-start', background: 'none', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          ← Back to Directory
        </button>

        <div className="card" style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: selectedFarmer.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ color: '#fff', fontWeight: 800, fontSize: '1.6rem', fontFamily: 'var(--font-header)' }}>{selectedFarmer.avatar}</span>
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ color: 'var(--primary-color)', fontFamily: 'var(--font-header)', margin: '0 0 4px 0' }}>{selectedFarmer.name}</h2>
            <div style={{ fontWeight: 700, color: 'var(--text-dark)', marginBottom: '4px' }}>{selectedFarmer.business}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>📍 {selectedFarmer.location}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="card">
            <div className="card-subtitle">Business Description</div>
            <p style={{ marginTop: '8px', lineHeight: '1.6', color: 'var(--text-dark)' }}>{selectedFarmer.description}</p>
          </div>

          <div className="card">
            <div className="card-subtitle">Products & Produce</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
              {produceArr.map((p, i) => (
                <span key={i} style={{ background: 'var(--primary-light)', color: 'var(--primary-color)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}>{p}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-subtitle">Direct Contact Details</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '12px' }}>
            <a href={`tel:${selectedFarmer.phone}`} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px', background: 'var(--primary-color)', borderRadius: '10px', color: '#fff', textDecoration: 'none', fontWeight: 700 }}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/></svg>
              Call {selectedFarmer.phone}
            </a>
            <a href={`mailto:${selectedFarmer.email}`} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px', background: 'var(--bg-input)', borderRadius: '10px', color: 'var(--text-dark)', textDecoration: 'none', fontWeight: 700, border: '1px solid var(--border-color)' }}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              {selectedFarmer.email}
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="card">
        <div className="card-subtitle">Agri-Business Network</div>
        <h3 style={{ color: 'var(--primary-color)', fontFamily: 'var(--font-header)' }}>Farmer Business Directory</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Connect directly with fellow farmers — view their produce, location, and contact details for trade partnerships.</p>

        <div style={{ display: 'flex', gap: '10px', marginTop: '15px', flexWrap: 'wrap' }}>
          <input
            type="text"
            className="form-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, location, or produce..."
            style={{ margin: 0, flex: 1, minWidth: '200px' }}
          />
          <select
            className="form-input"
            value={filterProduce}
            onChange={(e) => setFilterProduce(e.target.value)}
            style={{ margin: 0, width: '180px' }}
          >
            <option value="">All Produce</option>
            {allProduce.map((p, i) => <option key={i} value={p}>{p}</option>)}
          </select>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn-primary"
            style={{ whiteSpace: 'nowrap', margin: 0, padding: '10px 16px' }}
          >
            {showAddForm ? 'Cancel' : '+ Add My Profile'}
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleAddFarmer} style={{ marginTop: '20px', padding: '20px', background: 'var(--bg-input)', borderRadius: '10px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Your Name *</label>
              <input type="text" className="form-input" required value={newFarmer.name} onChange={e => setNewFarmer({...newFarmer, name: e.target.value})} placeholder="e.g. Alice Wambua" style={{ margin: 0 }} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Business / Farm Name *</label>
              <input type="text" className="form-input" required value={newFarmer.business} onChange={e => setNewFarmer({...newFarmer, business: e.target.value})} placeholder="e.g. Wambua Organics" style={{ margin: 0 }} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Produce / Products *</label>
              <input type="text" className="form-input" required value={newFarmer.produce} onChange={e => setNewFarmer({...newFarmer, produce: e.target.value})} placeholder="e.g. Tomatoes, Kale (comma separated)" style={{ margin: 0 }} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Location / County *</label>
              <input type="text" className="form-input" required value={newFarmer.location} onChange={e => setNewFarmer({...newFarmer, location: e.target.value})} placeholder="e.g. Nakuru County - Njoro" style={{ margin: 0 }} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Phone Number *</label>
              <input type="tel" className="form-input" required value={newFarmer.phone} onChange={e => setNewFarmer({...newFarmer, phone: e.target.value})} placeholder="+254 7XX XXX XXX" style={{ margin: 0 }} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Email Address</label>
              <input type="email" className="form-input" value={newFarmer.email} onChange={e => setNewFarmer({...newFarmer, email: e.target.value})} placeholder="your@email.com" style={{ margin: 0 }} />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1', margin: 0 }}>
              <label>Short Business Description</label>
              <textarea className="form-input" rows="3" value={newFarmer.description} onChange={e => setNewFarmer({...newFarmer, description: e.target.value})} placeholder="Describe what you do and sell..." style={{ margin: 0 }} />
            </div>
            <button type="submit" className="btn-primary" style={{ gridColumn: '1 / -1', margin: 0 }}>Submit Profile</button>
          </form>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '18px' }}>
        {filtered.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            No farmers found matching your search criteria.
          </div>
        ) : filtered.map(farmer => {
          const produceArr = Array.isArray(farmer.produce) ? farmer.produce : [farmer.produce];
          return (
            <div
              key={farmer.id}
              className="card"
              style={{ cursor: 'pointer', transition: 'var(--transition-smooth)' }}
              onClick={() => setSelectedFarmer(farmer)}
            >
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: farmer.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ color: '#fff', fontWeight: 800, fontSize: '1rem', fontFamily: 'var(--font-header)' }}>{farmer.avatar}</span>
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-dark)', fontSize: '1rem' }}>{farmer.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--primary-color)', fontWeight: 600 }}>{farmer.business}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>📍 {farmer.location}</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '12px' }}>
                {produceArr.slice(0, 3).map((p, i) => (
                  <span key={i} style={{ background: 'var(--primary-light)', color: 'var(--primary-color)', padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>{p}</span>
                ))}
                {produceArr.length > 3 && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>+{produceArr.length - 3} more</span>}
              </div>

              <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-dark)' }}>📞 {farmer.phone}</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--primary-color)', fontWeight: 600 }}>View Profile →</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BusinessDirectoryTab;

import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import { getCountyData } from '../utils/regions';

const SoilTab = () => {
  const { user } = useContext(AuthContext);
  const [soilData, setSoilData] = useState({
    sector: 'Nakuru County - Njoro Subcounty (Wheat)',
    moisture: 75,
    ph: 6.5,
    nitrogen: 45,
    phosphorus: 18,
    potassium: 240,
    status: 'Optimal',
    tips: 'Soil moisture readiness is Optimal (75%). The NPK balance is well-suited for wheat development. Maintain cover crop residue to conserve moisture ahead of predicted mid-week rainfall.'
  });

  useEffect(() => {
    fetchSoil();
  }, [user]);

  const fetchSoil = async () => {
    try {
      const sectorParam = user?.sector || '';
      const response = await api.get(`/api/soil/by_sector/?sector=${encodeURIComponent(sectorParam)}`);
      
      let data = response.data;
      const countyMatch = sectorParam.match(/([^-\(]+) County/);
      if (countyMatch) {
        const countyName = countyMatch[0].trim();
        const info = getCountyData(countyName);
        if (info) {
          data = {
            ...data,
            sector: sectorParam,
            ph: info.pH,
            moisture: info.moisture,
            nitrogen: info.nitrogen,
            phosphorus: info.phosphorus,
            potassium: info.potassium,
            status: info.status,
            tips: `Soil moisture readiness is ${info.status} (${info.moisture}%). The pH level of ${info.pH} is typical for agricultural land in ${countyName}. NPK readings are: Nitrogen=${info.nitrogen} mg/kg, Phosphorus=${info.phosphorus} mg/kg, Potassium=${info.potassium} mg/kg.`
          };
        }
      }

      if (data) {
        setSoilData(data);
      }
    } catch (err) {
      console.log('Backend offline, using local soil mock data');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <div className="card">
        <div className="card-subtitle">Active Soil Analysis</div>
        <h3 style={{ color: 'var(--primary-color)', fontFamily: 'var(--font-header)' }}>{soilData.sector}</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Last sampled: 2 hours ago (Automatic IoT telemetry feed)</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
        <div className="card" style={{ gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '1.2rem' }}>💧 Moisture</span>
            <span style={{ color: 'var(--status-low)', fontWeight: 700 }}>{soilData.status}</span>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'var(--font-header)' }}>{soilData.moisture}%</div>
          <div style={{ background: 'var(--primary-light)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ background: 'var(--primary-color)', width: `${soilData.moisture}%`, height: '100%' }}></div>
          </div>
        </div>

        <div className="card" style={{ gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '1.2rem' }}>🧪 pH Level</span>
            <span style={{ color: 'var(--status-low)', fontWeight: 700 }}>Neutral</span>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'var(--font-header)' }}>{soilData.ph}</div>
          <div style={{ background: 'var(--primary-light)', height: '8px', borderRadius: '4px', position: 'relative' }}>
            <div style={{ background: 'var(--accent-gold)', width: '6px', height: '14px', borderRadius: '3px', position: 'absolute', left: `${(soilData.ph / 14) * 100}%`, top: '-3px' }}></div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-subtitle">Nutrient Status (NPK)</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginTop: '10px', textAlign: 'center' }}>
          <div style={{ borderRight: '1px solid var(--border-color)', padding: '10px' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Nitrogen (N)</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, margin: '8px 0' }}>{soilData.nitrogen} <span style={{ fontSize: '0.9rem', fontWeight: 400 }}>mg/kg</span></div>
            <span style={{ background: '#e6f4ea', color: '#137333', padding: '3px 8px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700 }}>Optimal</span>
          </div>
          <div style={{ borderRight: '1px solid var(--border-color)', padding: '10px' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Phosphorus (P)</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, margin: '8px 0' }}>{soilData.phosphorus} <span style={{ fontSize: '0.9rem', fontWeight: 400 }}>mg/kg</span></div>
            <span style={{ background: '#fef7e0', color: '#b06000', padding: '3px 8px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700 }}>Deficient</span>
          </div>
          <div style={{ padding: '10px' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Potassium (K)</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, margin: '8px 0' }}>{soilData.potassium} <span style={{ fontSize: '0.9rem', fontWeight: 400 }}>mg/kg</span></div>
            <span style={{ background: '#e6f4ea', color: '#137333', padding: '3px 8px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700 }}>Optimal</span>
          </div>
        </div>
      </div>

      <div className="card" style={{ background: 'var(--bg-message-unread)' }}>
        <h4 style={{ color: 'var(--accent-gold)', fontWeight: 700 }}>Agronomist Recommendations</h4>
        <p style={{ marginTop: '10px', fontSize: '0.95rem', lineHeight: '1.6' }}>{soilData.tips}</p>
      </div>
    </div>
  );
};

export default SoilTab;

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, Popup, Marker, LayersControl, useMap } from 'react-leaflet';
import L from 'leaflet';
import api from '../api/axios';
import 'leaflet/dist/leaflet.css';

// Standard Leaflet Icon resolution logic
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const ChangeMapView = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
};

const MapTab = () => {
  const [mapCenter, setMapCenter] = useState([-0.312, 36.085]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchedMarker, setSearchedMarker] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);

  const [regions, setRegions] = useState([
    {
      id: 1,
      name: 'North Field - Nakuru (Njoro)',
      owner: 'GreenAcres Co-op',
      crop: 'Wheat',
      area_acres: 45.2,
      soil_quality: 'Excellent (pH 6.5)',
      status: 'Prospering',
      lat_center: -0.303,
      lng_center: 36.08,
      coordinates_json: '[[-0.300, 36.075], [-0.300, 36.085], [-0.306, 36.085], [-0.306, 36.075]]'
    },
    {
      id: 2,
      name: 'East Field - Trans Nzoia (Kwanza)',
      owner: 'Kamau Agro Holdings',
      crop: 'Maize',
      area_acres: 32.5,
      soil_quality: 'Moderate (pH 5.9)',
      status: 'Normal',
      lat_center: -0.312,
      lng_center: 36.095,
      coordinates_json: '[[-0.308, 36.090], [-0.308, 36.100], [-0.316, 36.100], [-0.316, 36.090]]'
    },
    {
      id: 3,
      name: 'South Zone - Uasin Gishu (Moiben)',
      owner: 'Wanjiku Farm Trust',
      crop: 'Soybeans',
      area_acres: 22.1,
      soil_quality: 'Deficient in Nitrogen',
      status: 'Needs Attention',
      lat_center: -0.320,
      lng_center: 36.076,
      coordinates_json: '[[-0.317, 36.070], [-0.317, 36.082], [-0.323, 36.082], [-0.323, 36.070]]'
    }
  ]);

  useEffect(() => {
    fetchRegions();
  }, []);

  const fetchRegions = async () => {
    try {
      const response = await api.get('/api/regions/');
      if (response.data && response.data.length > 0) {
        setRegions(response.data);
      }
    } catch (err) {
      console.log('Backend offline, using local map region mock data');
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchLoading(true);
    try {
      // Try Mapbox Geocoding API first (token from localStorage or fallback to Nominatim)
      const mapboxToken = localStorage.getItem('setting_mapboxToken') || '';
      let found = false;

      if (mapboxToken) {
        const mbRes = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?country=KE&access_token=${mapboxToken}&limit=1`
        );
        const mbData = await mbRes.json();
        if (mbData.features && mbData.features.length > 0) {
          const [lng, lat] = mbData.features[0].center;
          const name = mbData.features[0].place_name;
          setMapCenter([lat, lng]);
          setSearchedMarker({ lat, lng, label: name });
          found = true;
        }
      }

      // Fallback to Nominatim (OpenStreetMap) if Mapbox unavailable or no token
      if (!found) {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1`
        );
        const data = await response.json();
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          const name = data[0].display_name;
          setMapCenter([lat, lon]);
          setSearchedMarker({ lat, lng: lon, label: name });
        } else {
          alert('Location not found. Please try another search term.');
        }
      }
    } catch (err) {
      console.error('Geocoding error:', err);
      alert('Search failed. Please check your internet connection.');
    } finally {
      setSearchLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Prospering': return '#1B5E20';
      case 'Needs Attention': return '#b91c1c';
      default: return '#A7805A';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <div className="card-subtitle">Regional Farm Boundaries</div>
            <h3 style={{ color: 'var(--primary-color)', fontFamily: 'var(--font-header)' }}>Interactive Land Prosperity Map</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Select a field boundary below to inspect soil analysis, crops, and yield health indices.
            </p>
          </div>
          
          <div className="map-legend">
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#1B5E20' }}></div>
              <span>Prospering (Wheat/High Yield)</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#A7805A' }}></div>
              <span>Normal Activity</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#b91c1c' }}></div>
              <span>Needs Attention (Soil Deficient)</span>
            </div>
          </div>
        </div>

        {/* Search input form */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', margin: '15px 0 20px 0', maxWidth: '500px' }}>
          <input
            type="text"
            className="form-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search farm locations (e.g., Nakuru, Eldoret, Kenya)..."
            style={{ margin: 0, padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', width: '100%' }}
          />
          <button 
            type="submit" 
            className="btn-primary" 
            style={{ 
              padding: '10px 20px', 
              borderRadius: '8px', 
              backgroundColor: 'var(--primary-color)', 
              color: '#ffffff',
              border: 'none',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            disabled={searchLoading}
          >
            {searchLoading ? 'Searching...' : (
              <>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                Search Map
              </>
            )}
          </button>
        </form>

        <div className="map-container">
          <MapContainer 
            center={mapCenter} 
            zoom={13} 
            scrollWheelZoom={false}
            attributionControl={false}
            style={{ width: '100%', height: '100%', minHeight: '450px' }}
          >
            <ChangeMapView center={mapCenter} />
            <LayersControl position="topright">
              <LayersControl.BaseLayer name="Standard Street Map">
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
              </LayersControl.BaseLayer>
              
              <LayersControl.BaseLayer checked name="Terrain Map">
                <TileLayer
                  attribution='Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
                />
              </LayersControl.BaseLayer>
              
              <LayersControl.BaseLayer name="Satellite Imagery">
                <TileLayer
                  attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                />
              </LayersControl.BaseLayer>
            </LayersControl>

            {regions.map((region) => {
              const polyCoords = JSON.parse(region.coordinates_json);
              const color = getStatusColor(region.status);
              
              const customIcon = L.divIcon({
                className: 'custom-pin-marker',
                html: `
                  <div style="position: relative; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;">
                    <svg viewBox="0 0 24 24" style="width: 30px; height: 30px; fill: ${color}; filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.35));">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                  </div>
                `,
                iconSize: [30, 30],
                iconAnchor: [15, 30],
                popupAnchor: [0, -30]
              });

              const popupContent = (
                <div style={{ padding: '5px', minWidth: '180px' }}>
                  <h4 style={{ margin: '0 0 5px 0', color: 'var(--primary-color)', fontFamily: 'var(--font-header)' }}>
                    {region.name}
                  </h4>
                  <div style={{ fontSize: '0.85rem', marginBottom: '3px' }}>
                    Owner: <strong>{region.owner}</strong>
                  </div>
                  <div style={{ fontSize: '0.85rem', marginBottom: '3px' }}>
                    Crop Type: <strong>{region.crop}</strong>
                  </div>
                  <div style={{ fontSize: '0.85rem', marginBottom: '3px' }}>
                    Acreage: <strong>{region.area_acres} Acres</strong>
                  </div>
                  <div style={{ fontSize: '0.85rem', marginBottom: '8px' }}>
                    Soil State: <strong>{region.soil_quality}</strong>
                  </div>
                  <span 
                    style={{ 
                      display: 'inline-block',
                      backgroundColor: `${color}15`, 
                      color: color, 
                      padding: '3px 8px', 
                      borderRadius: '10px', 
                      fontSize: '0.75rem', 
                      fontWeight: 700 
                    }}
                  >
                    Status: {region.status}
                  </span>
                </div>
              );

              return (
                <React.Fragment key={region.id}>
                  <Polygon 
                    positions={polyCoords}
                    pathOptions={{
                      color: color,
                      fillColor: color,
                      fillOpacity: 0.35,
                      weight: 2
                    }}
                  >
                    <Popup>{popupContent}</Popup>
                  </Polygon>
                  <Marker 
                    position={[region.lat_center, region.lng_center]}
                    icon={customIcon}
                  >
                    <Popup>{popupContent}</Popup>
                  </Marker>
                </React.Fragment>
              );
            })}

            {searchedMarker && (
              <Marker position={[searchedMarker.lat, searchedMarker.lng]}>
                <Popup>
                  <div style={{ padding: '5px' }}>
                    <strong style={{ color: 'var(--primary-color)' }}>Search Result:</strong>
                    <div style={{ fontSize: '0.85rem', marginTop: '3px' }}>{searchedMarker.label}</div>
                  </div>
                </Popup>
              </Marker>
            )}

          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default MapTab;

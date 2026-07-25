import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { weather, commodities, pestAlerts, soil } from "@/services/api";

const DashboardPage = () => {
  const { user } = useAuth();
  const [weatherData, setWeather] = useState(null);
  const [commoditiesData, setCommodities] = useState([]);
  const [pestsData, setPests] = useState([]);
  const [soilData, setSoil] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      const results = await Promise.allSettled([
        weather.list(),
        commodities.list(),
        pestAlerts.list(),
        soil.getBySector(user?.sector),
      ]);
      if (results[0].status === "fulfilled") {
        const records = results[0].value.data.results || results[0].value.data;
        setWeather(Array.isArray(records) ? records.find((r) => r.is_today) || records[0] : null);
      }
      if (results[1].status === "fulfilled")
        setCommodities(results[1].value.data.results || results[1].value.data || []);
      if (results[2].status === "fulfilled")
        setPests(results[2].value.data.results || results[2].value.data || []);
      if (results[3].status === "fulfilled") {
        const d = results[3].value.data;
        setSoil(Array.isArray(d) ? d[0] || null : d);
      }
      setLoading(false);
    };
    fetchAll();
  }, [user]);

  if (loading)
    return (
      <div className="loader-page">
        <div className="spinner" />
        <p>Loading dashboard...</p>
      </div>
    );

  return (
    <div className="page">
      <div className="page-header">
        <h1>Welcome, {user?.name || user?.username}</h1>
        <p className="page-subtitle">Here&apos;s your farm overview</p>
      </div>

      <div className="card-grid">
        <div className="card summary-card weather-card">
          <div className="card-icon">🌤</div>
          <div className="card-content">
            <h3>Today&apos;s Weather</h3>
            {weatherData ? (
              <>
                <p className="card-value">
                  {weatherData.temp_high}°C / {weatherData.temp_low}°C
                </p>
                <p className="card-detail">
                  {weatherData.condition} | {weatherData.precip_chance}% rain
                </p>
              </>
            ) : (
              <p className="card-detail">No data available</p>
            )}
          </div>
          <Link to="/weather" className="card-link">
            View Forecast →
          </Link>
        </div>

        <div className="card summary-card soil-card">
          <div className="card-icon">🌱</div>
          <div className="card-content">
            <h3>Soil Health</h3>
            {soilData ? (
              <>
                <p className="card-value">{soilData.status}</p>
                <p className="card-detail">
                  Moisture: {soilData.moisture}% | pH: {soilData.ph}
                </p>
              </>
            ) : (
              <p className="card-detail">No soil data for your sector</p>
            )}
          </div>
          <Link to="/soil" className="card-link">
            View Details →
          </Link>
        </div>

        <div className="card summary-card market-card">
          <div className="card-icon">📈</div>
          <div className="card-content">
            <h3>Market Prices</h3>
            {commoditiesData.length > 0 ? (
              <>
                <p className="card-value">KES {commoditiesData[0].price_kes?.toLocaleString()}</p>
                <p className="card-detail">{commoditiesData[0].crop}</p>
              </>
            ) : (
              <p className="card-detail">No market data available</p>
            )}
          </div>
          <Link to="/market" className="card-link">
            View Prices →
          </Link>
        </div>

        <div className="card summary-card pest-card">
          <div className="card-icon">🐛</div>
          <div className="card-content">
            <h3>Pest Alerts</h3>
            {pestsData.length > 0 ? (
              <>
                <p className="card-value">{pestsData.length} Active</p>
                <p className="card-detail">
                  {pestsData.find((p) => p.risk_level === "High")?.title || pestsData[0].title}
                </p>
              </>
            ) : (
              <p className="card-detail">No active alerts</p>
            )}
          </div>
          <Link to="/pests" className="card-link">
            View Alerts →
          </Link>
        </div>
      </div>

      <div className="section-grid">
        <div className="card">
          <h3>Recent Pest Alerts</h3>
          <div className="card-list">
            {pestsData.length === 0 && <p className="empty-text">No alerts at this time</p>}
            {pestsData.slice(0, 3).map((pest) => (
              <div key={pest.id} className="list-item">
                <span className={`risk-badge risk-${pest.risk_level?.toLowerCase()}`}>
                  {pest.risk_level}
                </span>
                <span className="list-item-text">{pest.title}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <h3>Quick Links</h3>
          <div className="quick-links">
            <Link to="/weather" className="quick-link">🌤 Weather Forecast</Link>
            <Link to="/soil" className="quick-link">🌱 Soil Health</Link>
            <Link to="/pests" className="quick-link">🐛 Pest Alerts</Link>
            <Link to="/market" className="quick-link">📈 Market Prices</Link>
            <Link to="/crop-recommendations" className="quick-link">🌾 Crop Tips</Link>
            <Link to="/chat" className="quick-link">💬 Chat with Agronomist</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

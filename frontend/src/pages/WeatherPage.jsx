import { useApi } from "@/hooks/useApi";
import Loader from "@/components/Loader";

const WeatherPage = () => {
  const { data, loading, error } = useApi("/weather/");

  if (loading) return <Loader text="Loading weather data..." />;
  if (error)
    return (
      <div className="page">
        <div className="error-state">Failed to load weather data</div>
      </div>
    );

  const records = data?.results || data || [];

  return (
    <div className="page">
      <div className="page-header">
        <h1>Weather Forecast</h1>
        <p className="page-subtitle">7-day agricultural weather outlook</p>
      </div>

      <div className="weather-grid">
        {records.map((r) => (
          <div key={r.id} className={`weather-card ${r.is_today ? "today" : ""}`}>
            <h3>{r.is_today ? "Today" : r.day_name}</h3>
            <p className="weather-date">{r.date}</p>
            <div className="weather-temps">
              <span className="temp-high">{r.temp_high}°C</span>
              <span className="temp-low">{r.temp_low}°C</span>
            </div>
            <p className="weather-condition">{r.condition}</p>
            <div className="weather-details">
              <span>💧 {r.precip_chance}%</span>
              <span>💨 {r.wind_speed} km/h</span>
              <span>🌡 {r.humidity}%</span>
            </div>
          </div>
        ))}
      </div>
      {records.length === 0 && <p className="empty-text">No weather records available yet.</p>}
    </div>
  );
};

export default WeatherPage;

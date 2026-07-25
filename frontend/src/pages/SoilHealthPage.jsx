import { useAuth } from "@/contexts/AuthContext";
import { useApi } from "@/hooks/useApi";
import Loader from "@/components/Loader";

const SoilHealthPage = () => {
  const { user } = useAuth();
  const sectorParam = user?.sector ? `?sector=${encodeURIComponent(user.sector)}` : "";
  const {
    data: soil,
    loading,
    error,
  } = useApi(`/soil/by_sector/${sectorParam}`);

  if (loading) return <Loader text="Loading soil data..." />;
  if (error)
    return (
      <div className="page">
        <div className="error-state">Failed to load soil data</div>
      </div>
    );

  return (
    <div className="page">
      <div className="page-header">
        <h1>Soil Health</h1>
        <p className="page-subtitle">{soil?.sector || "Soil diagnostics for your sector"}</p>
      </div>

      <div className="card-grid">
        <div className="card stat-card">
          <h4>Moisture</h4>
          <p className="stat-value">{soil?.moisture ?? "N/A"}%</p>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${soil?.moisture ?? 0}%` }} />
          </div>
        </div>
        <div className="card stat-card">
          <h4>pH Level</h4>
          <p className="stat-value">{soil?.ph ?? "N/A"}</p>
        </div>
        <div className="card stat-card">
          <h4>Nitrogen (N)</h4>
          <p className="stat-value">{soil?.nitrogen ?? "N/A"} mg/kg</p>
        </div>
        <div className="card stat-card">
          <h4>Phosphorus (P)</h4>
          <p className="stat-value">{soil?.phosphorus ?? "N/A"} mg/kg</p>
        </div>
        <div className="card stat-card">
          <h4>Potassium (K)</h4>
          <p className="stat-value">{soil?.potassium ?? "N/A"} mg/kg</p>
        </div>
        <div className="card stat-card">
          <h4>Status</h4>
          <p className={`stat-value status-${soil?.status?.toLowerCase()}`}>
            {soil?.status ?? "N/A"}
          </p>
        </div>
      </div>

      {soil?.tips && (
        <div className="card tip-card">
          <h3>Recommendations</h3>
          <p>{soil.tips}</p>
        </div>
      )}
    </div>
  );
};

export default SoilHealthPage;

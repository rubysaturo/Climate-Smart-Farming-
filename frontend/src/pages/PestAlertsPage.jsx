import { useApi } from "@/hooks/useApi";
import Loader from "@/components/Loader";

const PestAlertsPage = () => {
  const { data, loading, error } = useApi("/pest-alerts/");

  if (loading) return <Loader text="Loading pest alerts..." />;
  if (error)
    return (
      <div className="page">
        <div className="error-state">Failed to load pest alerts</div>
      </div>
    );

  const alerts = data?.results || data || [];

  return (
    <div className="page">
      <div className="page-header">
        <h1>Pest Alerts</h1>
        <p className="page-subtitle">Active pest threats and mitigation strategies</p>
      </div>

      {alerts.length === 0 && <p className="empty-text">No pest alerts at this time.</p>}

      <div className="alerts-list">
        {alerts.map((alert) => (
          <div key={alert.id} className="card alert-card">
            <div className="alert-header">
              <span className={`risk-badge risk-${alert.risk_level?.toLowerCase()}`}>
                {alert.risk_level}
              </span>
              <h3>{alert.title}</h3>
            </div>
            <p className="alert-sector">📍 {alert.sector}</p>
            <div className="alert-body">
              <div>
                <h4>Description</h4>
                <p>{alert.description}</p>
              </div>
              <div>
                <h4>Mitigation</h4>
                <p>{alert.mitigation}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PestAlertsPage;

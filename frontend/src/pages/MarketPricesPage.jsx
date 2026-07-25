import { useApi } from "@/hooks/useApi";
import Loader from "@/components/Loader";

const MarketPricesPage = () => {
  const { data, loading, error } = useApi("/commodities/");

  if (loading) return <Loader text="Loading market prices..." />;
  if (error)
    return (
      <div className="page">
        <div className="error-state">Failed to load market data</div>
      </div>
    );

  const commodities = data?.results || data || [];

  return (
    <div className="page">
      <div className="page-header">
        <h1>Market Prices</h1>
        <p className="page-subtitle">Current commodity prices and demand levels</p>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Crop</th>
              <th>Price (KES)</th>
              <th>Change</th>
              <th>Demand</th>
              <th>Volume (tonnes)</th>
            </tr>
          </thead>
          <tbody>
            {commodities.map((c) => (
              <tr key={c.id}>
                <td className="crop-name">{c.crop}</td>
                <td className="price">KES {c.price_kes?.toLocaleString()}</td>
                <td className={c.is_up ? "text-green" : "text-red"}>
                  {c.is_up ? "▲" : "▼"} {Math.abs(c.change_pct)}%
                </td>
                <td>
                  <span className={`demand-badge demand-${c.demand_level?.toLowerCase()}`}>
                    {c.demand_level}
                  </span>
                </td>
                <td>{c.volume_tonnes?.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {commodities.length === 0 && <p className="empty-text">No market data available.</p>}
    </div>
  );
};

export default MarketPricesPage;

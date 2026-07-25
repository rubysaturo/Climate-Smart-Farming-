import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import {
  messages as msgApi,
  weather as weatherApi,
  commodities as commodityApi,
  pestAlerts as pestApi,
} from "@/services/api";
import Loader from "@/components/Loader";

const ReplyForm = ({ messageId, onReply }) => {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    await onReply(messageId, text);
    setText("");
    setLoading(false);
  };

  return (
    <form className="reply-form" onSubmit={submit}>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type your reply..."
      />
      <button type="submit" className="btn btn-sm btn-primary" disabled={loading || !text.trim()}>
        Reply
      </button>
    </form>
  );
};

const AdminPage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [tab, setTab] = useState("inbox");
  const [messages, setMessages] = useState([]);
  const [weather, setWeather] = useState([]);
  const [commodities, setCommodities] = useState([]);
  const [pests, setPests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== "admin") return;
    const fetchAll = async () => {
      setLoading(true);
      const results = await Promise.allSettled([
        msgApi.list(),
        weatherApi.list(),
        commodityApi.list(),
        pestApi.list(),
      ]);
      if (results[0].status === "fulfilled")
        setMessages(results[0].value.data.results || results[0].value.data || []);
      if (results[1].status === "fulfilled")
        setWeather(results[1].value.data.results || results[1].value.data || []);
      if (results[2].status === "fulfilled")
        setCommodities(results[2].value.data.results || results[2].value.data || []);
      if (results[3].status === "fulfilled")
        setPests(results[3].value.data.results || results[3].value.data || []);
      setLoading(false);
    };
    fetchAll();
  }, [user]);

  const handleReply = async (id, replyText) => {
    try {
      await msgApi.reply(id, replyText);
      addToast("Reply sent", "success");
      const { data } = await msgApi.list();
      setMessages(data.results || data || []);
    } catch {
      addToast("Failed to send reply", "error");
    }
  };

  if (user?.role !== "admin")
    return (
      <div className="page">
        <div className="error-state">Access denied. Admin only.</div>
      </div>
    );

  if (loading) return <Loader text="Loading admin panel..." />;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Admin Panel</h1>
        <p className="page-subtitle">Manage farm data and farmer consultations</p>
      </div>

      <div className="tab-bar">
        {["inbox", "weather", "market", "pests"].map((t) => (
          <button
            key={t}
            className={`tab-btn ${tab === t ? "active" : ""}`}
            onClick={() => setTab(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === "inbox" && (
        <div className="admin-section">
          {messages.length === 0 && <p className="empty-text">No messages</p>}
          {messages.map((msg) => (
            <div key={msg.id} className="card message-card">
              <div className="msg-header">
                <span className="msg-sender">
                  {msg.sender_details?.username || "Unknown"}
                </span>
                <span className="msg-subject">{msg.subject}</span>
                <span className="msg-date">
                  {new Date(msg.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="msg-crop">Crop: {msg.crop}</p>
              <p className="msg-body">{msg.message}</p>
              {msg.reply ? (
                <div className="msg-reply">
                  <strong>Reply:</strong>
                  <p>{msg.reply}</p>
                </div>
              ) : (
                <ReplyForm messageId={msg.id} onReply={handleReply} />
              )}
            </div>
          ))}
        </div>
      )}

      {tab === "weather" && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Day</th>
                <th>High</th>
                <th>Low</th>
                <th>Condition</th>
                <th>Rain %</th>
              </tr>
            </thead>
            <tbody>
              {weather.map((w) => (
                <tr key={w.id}>
                  <td>{w.day_name}</td>
                  <td>{w.temp_high}°C</td>
                  <td>{w.temp_low}°C</td>
                  <td>{w.condition}</td>
                  <td>{w.precip_chance}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "market" && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Crop</th>
                <th>Price (KES)</th>
                <th>Change</th>
                <th>Demand</th>
              </tr>
            </thead>
            <tbody>
              {commodities.map((c) => (
                <tr key={c.id}>
                  <td>{c.crop}</td>
                  <td>{c.price_kes?.toLocaleString()}</td>
                  <td className={c.is_up ? "text-green" : "text-red"}>
                    {c.is_up ? "▲" : "▼"} {Math.abs(c.change_pct)}%
                  </td>
                  <td>{c.demand_level}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "pests" && (
        <div className="alerts-list">
          {pests.map((p) => (
            <div key={p.id} className="card alert-card">
              <div className="alert-header">
                <span className={`risk-badge risk-${p.risk_level?.toLowerCase()}`}>
                  {p.risk_level}
                </span>
                <h3>{p.title}</h3>
              </div>
              <p>{p.description}</p>
              <p>
                <strong>Mitigation:</strong> {p.mitigation}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPage;

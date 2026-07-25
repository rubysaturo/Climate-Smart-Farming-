import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";

const SETTINGS_ITEMS = [
  { key: "sms_weather", label: "Weather Alerts", desc: "Receive SMS for severe weather updates" },
  { key: "sms_soil", label: "Soil Health Tips", desc: "Periodic soil health notifications" },
  { key: "sms_market", label: "Market Price Alerts", desc: "Get notified on significant price changes" },
  { key: "sms_app", label: "App Notifications", desc: "In-app alerts and advisories" },
];

const SettingsPage = () => {
  const { user, updateProfile } = useAuth();
  const { addToast } = useToast();
  const [prefs, setPrefs] = useState({
    sms_weather: user?.sms_weather ?? true,
    sms_soil: user?.sms_soil ?? true,
    sms_market: user?.sms_market ?? true,
    sms_app: user?.sms_app ?? true,
  });
  const [loading, setLoading] = useState(false);

  const toggle = (key) => setPrefs((p) => ({ ...p, [key]: !p[key] }));

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateProfile(prefs);
      addToast("Settings saved", "success");
    } catch {
      addToast("Failed to save settings", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Settings</h1>
        <p className="page-subtitle">Manage notification preferences</p>
      </div>

      <div className="card settings-card">
        <h2>SMS &amp; Notification Preferences</h2>
        <div className="settings-list">
          {SETTINGS_ITEMS.map((item) => (
            <div key={item.key} className="setting-item">
              <div>
                <p className="setting-label">{item.label}</p>
                <p className="setting-desc">{item.desc}</p>
              </div>
              <label className="toggle" htmlFor={`toggle-${item.key}`}>
                <input
                  id={`toggle-${item.key}`}
                  type="checkbox"
                  checked={prefs[item.key]}
                  onChange={() => toggle(item.key)}
                  aria-label={item.label}
                />
                <span className="toggle-slider" />
              </label>
            </div>
          ))}
        </div>
        <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
          {loading ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;

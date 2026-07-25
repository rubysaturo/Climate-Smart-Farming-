import { NavLink } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: "📊" },
  { to: "/weather", label: "Weather", icon: "🌤" },
  { to: "/soil", label: "Soil Health", icon: "🌱" },
  { to: "/pests", label: "Pest Alerts", icon: "🐛" },
  { to: "/market", label: "Market Prices", icon: "📈" },
  { to: "/crop-recommendations", label: "Crop Tips", icon: "🌾" },
  { to: "/chat", label: "Agronomist Chat", icon: "💬" },
  { to: "/search", label: "Search", icon: "🔍" },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  return (
    <>
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={onClose}
          onKeyDown={(e) => e.key === "Escape" && onClose()}
          role="button"
          tabIndex={0}
          aria-label="Close sidebar"
        />
      )}
      <aside className={`sidebar ${isOpen ? "sidebar-open" : ""}`} aria-label="Main navigation">
        <div className="sidebar-header">
          <span className="sidebar-logo" aria-hidden="true">🌿</span>
          <span className="sidebar-title">Navigation</span>
          <button className="sidebar-close" onClick={onClose} aria-label="Close sidebar">
            ✕
          </button>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
              onClick={onClose}
            >
              <span className="sidebar-icon" aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
          {user?.role === "admin" && (
            <NavLink
              to="/admin"
              className={({ isActive }) => `sidebar-link admin-link ${isActive ? "active" : ""}`}
              onClick={onClose}
            >
              <span className="sidebar-icon" aria-hidden="true">⚙</span>
              <span>Admin Panel</span>
            </NavLink>
          )}
        </nav>
        {user && (
          <div className="sidebar-footer">
            <div className="sidebar-user">
              <div className="avatar" role="img" aria-label={`${user.username}'s avatar`}>
                {user.username?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="sidebar-username">{user.username}</p>
                <p className="sidebar-role">{user.role === "admin" ? "Agronomist" : "Farmer"}</p>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;

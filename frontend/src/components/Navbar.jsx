import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = ({ onToggleSidebar, sidebarOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const close = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    const handleEscape = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="navbar-left">
        <button
          className="menu-toggle"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
          aria-expanded={sidebarOpen}
        >
          ☰
        </button>
        <Link to="/dashboard" className="navbar-brand">
          <span className="brand-icon" aria-hidden="true">🌿</span>
          <span>GreenAcres</span>
        </Link>
      </div>
      <div className="navbar-right">
        {user && (
          <div className="user-menu" ref={menuRef}>
            <button
              className="user-menu-trigger"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-expanded={menuOpen}
              aria-haspopup="true"
            >
              <div className="avatar" role="img" aria-label={`${user.username}'s avatar`}>
                {user.username?.[0]?.toUpperCase() || "U"}
              </div>
              <span className="user-name">{user.username}</span>
            </button>
            {menuOpen && (
              <div className="dropdown-menu" role="menu">
                <Link to="/profile" className="dropdown-item" role="menuitem" onClick={() => setMenuOpen(false)}>
                  Profile
                </Link>
                <Link to="/settings" className="dropdown-item" role="menuitem" onClick={() => setMenuOpen(false)}>
                  Settings
                </Link>
                <hr className="dropdown-divider" />
                <button
                  className="dropdown-item danger"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    handleLogout();
                  }}
                >
                  Log Out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

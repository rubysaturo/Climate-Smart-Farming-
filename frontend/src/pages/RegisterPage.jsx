import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";

const RegisterPage = () => {
  const { register, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    name: "",
    phone_number: "",
    sector: "",
  });
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.email || !form.password) {
      addToast("Username, email, and password are required", "warning");
      return;
    }
    setLoading(true);
    try {
      await register(form);
      addToast("Account created successfully! Please log in.", "success");
      navigate("/login");
    } catch (err) {
      const detail = err.response?.data;
      let msg = "Registration failed";
      if (detail) {
        if (typeof detail === "string") msg = detail;
        else if (detail.username)
          msg = `Username: ${Array.isArray(detail.username) ? detail.username[0] : detail.username}`;
        else if (detail.email)
          msg = `Email: ${Array.isArray(detail.email) ? detail.email[0] : detail.email}`;
        else if (detail.password)
          msg = `Password: ${Array.isArray(detail.password) ? detail.password[0] : detail.password}`;
        else if (detail.non_field_errors)
          msg = Array.isArray(detail.non_field_errors) ? detail.non_field_errors[0] : detail.non_field_errors;
        else if (detail.detail) msg = detail.detail;
      }
      addToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <span className="auth-logo">🌿</span>
          <h1>Create Account</h1>
          <p>Join the Climate Smart Farming community</p>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">Username *</label>
            <input
              id="username"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Choose a username"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="your@email.com"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password * (min 8 characters)</label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Create a password"
              minLength={8}
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input id="name" name="name" value={form.name} onChange={handleChange} placeholder="Your full name" />
            </div>
            <div className="form-group">
              <label htmlFor="phone_number">Phone</label>
              <input
                id="phone_number"
                name="phone_number"
                value={form.phone_number}
                onChange={handleChange}
                placeholder="+254..."
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="sector">Farm Sector</label>
            <input
              id="sector"
              name="sector"
              value={form.sector}
              onChange={handleChange}
              placeholder="e.g. Nakuru County - Njoro Subcounty (Wheat)"
            />
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>
        <div className="auth-footer">
          <p>
            Already have an account? <Link to="/login">Log In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

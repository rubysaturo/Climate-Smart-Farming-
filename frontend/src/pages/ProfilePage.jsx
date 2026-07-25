import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const { addToast } = useToast();
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone_number: user?.phone_number || "",
    sector: user?.sector || "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(form);
      addToast("Profile updated successfully", "success");
    } catch (err) {
      addToast(err.response?.data?.detail || "Failed to update profile", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>My Profile</h1>
        <p className="page-subtitle">Manage your account information</p>
      </div>

      <div className="card profile-card">
        <div className="profile-header">
          <div className="avatar avatar-lg">{user?.username?.[0]?.toUpperCase()}</div>
          <div>
            <h2>{user?.username}</h2>
            <p className="profile-role">{user?.role === "admin" ? "Agronomist" : "Farmer"}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input id="name" name="name" value={form.name} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" value={form.email} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="phone_number">Phone Number</label>
            <input
              id="phone_number"
              name="phone_number"
              value={form.phone_number}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="sector">Farm Sector</label>
            <input id="sector" name="sector" value={form.sector} onChange={handleChange} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;

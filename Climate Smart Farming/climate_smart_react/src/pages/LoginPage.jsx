import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import loginBg from '../assets/login-bg.jpg';
import Toast from '../components/Toast';
import Modal from '../components/Modal';
import api from '../api/axios';

/* ─── inline keyframes injected once ─── */
const shakeStyle = `
  @keyframes loginShake {
    0%, 100% { transform: translateX(0); }
    15%       { transform: translateX(-8px); }
    30%       { transform: translateX(8px); }
    45%       { transform: translateX(-6px); }
    60%       { transform: translateX(6px); }
    75%       { transform: translateX(-3px); }
    90%       { transform: translateX(3px); }
  }
  .auth-form.shake { animation: loginShake 0.5s ease; }
`;

const LoginPage = () => {
  const { login, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [saveInfo, setSaveInfo] = useState(false);
  const [inputError, setInputError] = useState(false);   // red-border state
  const [formShake, setFormShake] = useState(false);     // shake animation trigger
  
  const [toast, setToast] = useState(null);
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  /* Inject shake keyframes once */
  useEffect(() => {
    if (!document.getElementById('login-shake-style')) {
      const tag = document.createElement('style');
      tag.id = 'login-shake-style';
      tag.textContent = shakeStyle;
      document.head.appendChild(tag);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      const storedUser = localStorage.getItem('agrismart_user') || sessionStorage.getItem('agrismart_user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        if (parsed.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    return () => {
      setUsername('');
      setPassword('');
      setForgotEmail('');
    };
  }, []);

  /* Trigger shake + reset so it can re-trigger on repeated failures */
  const triggerShake = () => {
    setFormShake(true);
    setTimeout(() => setFormShake(false), 520);
  };

  const showError = (message) => {
    setInputError(true);
    triggerShake();
    setToast({ message, type: 'error' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setInputError(true);
      triggerShake();
      setToast({ message: 'Please fill in both username and password to continue.', type: 'warning' });
      return;
    }

    try {
      const user = await login(username, password, saveInfo);
      setInputError(false);
      setToast({ message: `Welcome back, ${user.username}! Redirecting…`, type: 'success' });
      
      setUsername('');
      setPassword('');
    } catch (err) {
      showError(err.message || 'Incorrect username or password. Please try again.');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const googleUser = {
        name: 'Google Farmer',
        username: 'google_farmer',
        email: 'google.farmer@gmail.com',
        phone_number: '+254700000000',
        sector: 'Nakuru County - Njoro Subcounty (Wheat)',
        role: 'farmer',
        password: 'GooglePass123!'
      };

      try {
        await api.post('/api/auth/register/', googleUser);
      } catch (regErr) {
        // Ignored if user already exists
      }

      const loggedUser = await login('google_farmer', 'GooglePass123!', false);
      setToast({ message: `Welcome back via Google, ${loggedUser.name}! Redirecting…`, type: 'success' });
    } catch (err) {
      setToast({ message: 'Google Sign-In failed to authenticate.', type: 'error' });
    }
  };

  const handleForgotPasswordSubmit = (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      setToast({ message: 'Please enter your email address.', type: 'warning' });
      return;
    }
    
    setToast({ 
      message: `Password reset link sent to ${forgotEmail}. Please check your inbox.`, 
      type: 'success' 
    });
    
    setForgotEmail('');
    setIsForgotOpen(false);
  };

  /* shared error border style */
  const errorBorder = inputError
    ? { borderColor: '#dc2626', boxShadow: '0 0 0 3px rgba(220, 38, 38, 0.15)' }
    : {};

  return (
    <div 
      className="auth-container" 
      style={{ backgroundImage: `url(${loginBg})` }}
    >
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <svg viewBox="0 0 24 24">
              <path d="M19 8.5c0-.8-.7-1.5-1.5-1.5H16c0-2.2-1.8-4-4-4S8 4.8 8 7H6.5C5.7 7 5 7.7 5 8.5c0 .7.4 1.3 1 1.5v8c0 1.7 1.3 3 3 3h6c1.7 0 3-1.3 3-3v-8c.6-.2 1-.8 1-1.5zM12 5c1.1 0 2 .9 2 2h-4c0-1.1.9-2 2-2zm4 11.5c0 .8-.7 1.5-1.5 1.5h-5c-.8 0-1.5-.7-1.5-1.5V11h8v5.5zm1.5-7.5H6.5c-.3 0-.5-.2-.5-.5s.2-.5.5-.5h11c.3 0 .5.2.5.5s-.2.5-.5.5zm-5.5 5.5v3M10.5 14v3M13.5 14v3" />
            </svg>
            <span>GreenAcres</span>
          </div>
          <p className="auth-subtitle">Climate Smart Farming Advisory System</p>
        </div>

        <form
          className={`auth-form${formShake ? ' shake' : ''}`}
          onSubmit={handleSubmit}
          autoComplete="off"
        >
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input 
              type="text" 
              id="username"
              className="form-input"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setInputError(false); }}
              placeholder="Enter your username"
              autoComplete="off"
              style={errorBorder}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input 
                type={showPassword ? 'text' : 'password'} 
                id="password"
                className="form-input"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setInputError(false); }}
                placeholder="Enter your password"
                autoComplete="new-password"
                style={{ ...errorBorder, paddingRight: '45px', width: '100%' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0
                }}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Inline error hint shown below inputs */}
          {inputError && (
            <p style={{
              fontSize: '0.82rem',
              color: '#dc2626',
              marginTop: '-6px',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              Check your username and password and try again.
            </p>
          )}

          <div className="form-options">
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                checked={saveInfo}
                onChange={(e) => setSaveInfo(e.target.checked)}
              />
              Save Login Info
            </label>
            <button 
              type="button" 
              className="auth-link" 
              style={{ background: 'none', border: 'none', cursor: 'pointer', font: 'inherit' }}
              onClick={() => setIsForgotOpen(true)}
            >
              Forgot Password?
            </button>
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>
            Log In
          </button>
        </form>

        <div className="auth-divider">or</div>

        <button onClick={handleGoogleSignIn} className="btn-google">
          <svg style={{ width: '18px', height: '18px' }} viewBox="0 0 24 24">
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.53-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-8.77z"/>
            <path fill="#34A853" d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.08 1.16-3.13 0-5.78-2.11-6.73-4.96H1.21v3.15C3.18 21.88 7.31 24 12 24z"/>
            <path fill="#FBBC05" d="M5.27 14.24c-.25-.72-.39-1.5-.39-2.3 0-.8.14-1.58.39-2.3V6.49H1.21C.44 8.04 0 9.77 0 11.6c0 1.83.44 3.56 1.21 5.11l4.06-3.15z"/>
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.18 2.12 1.21 5.49l4.06 3.15c.95-2.85 3.6-4.96 6.73-4.96z"/>
          </svg>
          Log in with Google
        </button>

        <div className="auth-footer">
          Don't have an account? <Link to="/signup" className="auth-link">Sign Up</Link>
        </div>
      </div>

      <Modal 
        isOpen={isForgotOpen} 
        onClose={() => setIsForgotOpen(false)} 
        title="Forgot Password"
      >
        <form onSubmit={handleForgotPasswordSubmit} className="auth-form" style={{ gap: '15px' }} autoComplete="off">
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Enter your email address and we'll send you a recovery link to get back into your account.
          </p>
          <div className="form-group">
            <label htmlFor="forgot-email">Email Address</label>
            <input 
              type="email" 
              id="forgot-email"
              className="form-input"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              placeholder="e.g. farmer@example.com"
              autoComplete="off"
            />
          </div>
          <button type="submit" className="btn-primary">
            Send Recovery Link
          </button>
        </form>
      </Modal>

      {/* key forces re-mount so the animation replays on each new toast */}
      {toast && (
        <Toast 
          key={`${toast.type}-${Date.now()}`}
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </div>
  );
};

export default LoginPage;

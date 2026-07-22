import React, { useEffect, useState } from 'react';

const ICONS = {
  success: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  ),
  error: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  ),
  warning: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  info: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="8.01" />
      <line x1="12" y1="12" x2="12" y2="16" />
    </svg>
  ),
};

const COLOR_MAP = {
  success: { bg: '#f0fdf4', border: '#16a34a', icon: '#16a34a', text: '#14532d' },
  error:   { bg: '#fef2f2', border: '#dc2626', icon: '#dc2626', text: '#7f1d1d' },
  warning: { bg: '#fffbeb', border: '#d97706', icon: '#d97706', text: '#78350f' },
  info:    { bg: '#eff6ff', border: '#2563eb', icon: '#2563eb', text: '#1e3a8a' },
};

const Toast = ({ message, type = 'info', onClose }) => {
  const [visible, setVisible] = useState(false);
  const colors = COLOR_MAP[type] || COLOR_MAP.info;

  useEffect(() => {
    // Trigger slide-in on mount
    requestAnimationFrame(() => setVisible(true));

    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 320); // wait for slide-out before unmounting
    }, 4500);

    return () => clearTimeout(timer);
  }, []); // eslint-disable-line

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 320);
  };

  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        position: 'fixed',
        bottom: '28px',
        right: '28px',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        borderLeft: `5px solid ${colors.border}`,
        borderRadius: '10px',
        padding: '14px 18px',
        minWidth: '300px',
        maxWidth: '420px',
        boxShadow: '0 8px 30px rgba(0,0,0,0.18)',
        transform: visible ? 'translateX(0)' : 'translateX(120%)',
        opacity: visible ? 1 : 0,
        transition: 'transform 0.32s cubic-bezier(0.18, 0.89, 0.32, 1.15), opacity 0.28s ease',
        pointerEvents: 'auto',
      }}
    >
      {/* Icon */}
      <span style={{
        flexShrink: 0,
        width: '22px',
        height: '22px',
        color: colors.icon,
        marginTop: '1px',
      }}>
        {ICONS[type] || ICONS.info}
      </span>

      {/* Message */}
      <span style={{
        flex: 1,
        fontSize: '0.9rem',
        fontWeight: 600,
        color: colors.text,
        lineHeight: 1.4,
      }}>
        {message}
      </span>

      {/* Close button */}
      <button
        onClick={handleClose}
        aria-label="Dismiss notification"
        style={{
          flexShrink: 0,
          background: 'none',
          border: 'none',
          color: colors.icon,
          cursor: 'pointer',
          fontSize: '1.3rem',
          lineHeight: 1,
          padding: '0 2px',
          opacity: 0.6,
          transition: 'opacity 0.2s',
          marginLeft: '4px',
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = 1}
        onMouseLeave={e => e.currentTarget.style.opacity = 0.6}
      >
        ×
      </button>
    </div>
  );
};

export default Toast;

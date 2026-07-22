import React from 'react';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
          <h3 style={{ fontFamily: 'var(--font-header)', fontSize: '1.25rem', color: 'var(--primary-color)' }}>{title}</h3>
          <button 
            onClick={onClose} 
            style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '1.5rem' }}
          >
            &times;
          </button>
        </div>
        <div style={{ padding: '10px 0' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;

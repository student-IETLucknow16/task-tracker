import React, { useEffect } from 'react';

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = { success: '✓', error: '✕', info: 'i' };

  return (
    <div className={`toast toast-${type}`} role="alert">
      <span className="toast-icon">{icons[type] || icons.info}</span>
      <span className="toast-message">{message}</span>
      <button className="toast-close" onClick={onClose} aria-label="Dismiss">✕</button>
    </div>
  );
};

export default Toast;

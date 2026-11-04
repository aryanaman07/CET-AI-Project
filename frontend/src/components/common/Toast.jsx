import React from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export default function Toast({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={18} className="toast-icon text-success" />;
      case 'error':
        return <AlertCircle size={18} className="toast-icon text-error" />;
      case 'warning':
        return <AlertTriangle size={18} className="toast-icon text-warning" />;
      case 'info':
      default:
        return <Info size={18} className="toast-icon text-info" />;
    }
  };

  return (
    <div className="toast-container" role="region" aria-label="Notifications">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast-card toast-${toast.type || 'info'} animate-fade-in`}>
          <div className="toast-content-wrapper">
            {getIcon(toast.type)}
            <div className="toast-text-area">
              {toast.title && <strong className="toast-title">{toast.title}</strong>}
              <p className="toast-message">{toast.message}</p>
            </div>
          </div>
          <button 
            onClick={() => onDismiss(toast.id)} 
            className="toast-close-btn"
            aria-label="Dismiss notification"
          >
            <X size={15} />
          </button>
        </div>
      ))}
    </div>
  );
}

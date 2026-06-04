import { useState, useEffect, createContext, useContext } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const ToastContext = createContext();

/**
 * Tipos de toast
 */
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = TOAST_TYPES.INFO, duration = 3000) => {
    const id = Date.now();
    const toast = { id, message, type };
    
    setToasts(prev => [...prev, toast]);
    
    // Auto-remove após duration
    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const success = (message, duration) => addToast(message, TOAST_TYPES.SUCCESS, duration);
  const error = (message, duration) => addToast(message, TOAST_TYPES.ERROR, duration);
  const warning = (message, duration) => addToast(message, TOAST_TYPES.WARNING, duration);
  const info = (message, duration) => addToast(message, TOAST_TYPES.INFO, duration);

  return (
    <ToastContext.Provider value={{ addToast, removeToast, success, error, warning, info }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

const ToastContainer = ({ toasts, removeToast }) => {
  const { getCardBackground, getBorderColor, getTextColor } = useTheme();

  const getIcon = (type) => {
    switch (type) {
      case TOAST_TYPES.SUCCESS:
        return 'check_circle';
      case TOAST_TYPES.ERROR:
        return 'error';
      case TOAST_TYPES.WARNING:
        return 'warning';
      case TOAST_TYPES.INFO:
      default:
        return 'info';
    }
  };

  const getColor = (type) => {
    switch (type) {
      case TOAST_TYPES.SUCCESS:
        return 'text-green-400';
      case TOAST_TYPES.ERROR:
        return 'text-red-400';
      case TOAST_TYPES.WARNING:
        return 'text-yellow-400';
      case TOAST_TYPES.INFO:
      default:
        return 'text-blue-400';
    }
  };

  const getBgColor = (type) => {
    switch (type) {
      case TOAST_TYPES.SUCCESS:
        return 'bg-green-500/20 border-green-500/40';
      case TOAST_TYPES.ERROR:
        return 'bg-red-500/20 border-red-500/40';
      case TOAST_TYPES.WARNING:
        return 'bg-yellow-500/20 border-yellow-500/40';
      case TOAST_TYPES.INFO:
      default:
        return 'bg-blue-500/20 border-blue-500/40';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`${getCardBackground()} backdrop-blur-xl border ${getBorderColor()} ${getBgColor(toast.type)} rounded-xl shadow-2xl p-4 min-w-[300px] max-w-sm animate-slide-in`}
        >
          <div className="flex items-start gap-3">
            <span className={`material-symbols-outlined ${getColor(toast.type)} text-xl`}>
              {getIcon(toast.type)}
            </span>
            <p className={`flex-1 text-sm ${getTextColor()}`}>
              {toast.message}
            </p>
            <button
              onClick={() => removeToast(toast.id)}
              className={`${getTextColor()} hover:bg-white/20 rounded-full p-1 transition`}
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ToastProvider;

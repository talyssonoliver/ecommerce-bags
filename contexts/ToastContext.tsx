import React, { createContext, useContext, useState } from 'react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (message: string, type: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const ToastContainer = () => {
  const { toasts, removeToast } = useContext(ToastContext) || { toasts: [], removeToast: () => {} };
  
  return (
    <div className="toast-container" style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999 }}>
      {toasts.map((toast) => (
        <div 
          key={toast.id} 
          className={`toast toast-${toast.type}`}
          style={{ 
            padding: '10px', 
            margin: '10px 0', 
            backgroundColor: toast.type === 'error' ? '#f8d7da' : 
                            toast.type === 'success' ? '#d4edda' : 
                            toast.type === 'warning' ? '#fff3cd' : '#d1ecf1',
            borderRadius: '4px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
          }}
        >
          <div>{toast.message}</div>
          <button 
            onClick={() => removeToast(toast.id)}
            style={{ marginLeft: '10px', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  const addToast = (message: string, type: ToastType, duration = 5000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    
    if (duration !== Infinity) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  };
  
  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };
  
  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
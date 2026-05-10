import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, X } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-end justify-end pointer-events-none">
          <div 
            className={`pointer-events-auto max-w-sm rounded-2xl p-4 shadow-xl border flex items-start gap-3 backdrop-blur-md transition-all ease-out ${
              toast.type === 'error' 
                ? 'bg-rose-50/95 border-rose-300 text-rose-900 animate-shake' // Vibrating shake animation for error
                : 'bg-emerald-50/95 border-emerald-300 text-emerald-900 animate-in slide-in-from-bottom-5 fade-in duration-500' // Smooth buttery entrance for success
            }`}
          >
            {toast.type === 'error' ? (
              <div className="w-8 h-8 rounded-full bg-rose-200 flex items-center justify-center shrink-0">
                <X className="w-5 h-5 text-rose-700" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-emerald-200 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5 text-emerald-700" />
              </div>
            )}
            <div className="flex-1 pt-1 font-semibold text-sm leading-snug">
              {toast.message}
            </div>
            <button 
              onClick={() => setToast(null)}
              className="p-1 hover:bg-black/5 rounded-full transition-colors opacity-60 hover:opacity-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
};

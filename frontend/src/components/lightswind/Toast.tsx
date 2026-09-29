import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export interface ToastMessage {
  id: string;
  title: string;
  description: string;
  type: 'INFO' | 'WATCH' | 'ALERT';
  timestamp: string;
}

interface ToastContextType {
  addToast: (toast: Omit<ToastMessage, 'id' | 'timestamp'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((toast: Omit<ToastMessage, 'id' | 'timestamp'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const timestamp = new Date().toISOString().substring(11, 19) + ' UTC';
    const newToast: ToastMessage = { ...toast, id, timestamp };

    setToasts((prev) => [newToast, ...prev.slice(0, 4)]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 6500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => {
          const borderColor =
            toast.type === 'ALERT'
              ? 'border-danger-vermilion text-danger-vermilion'
              : toast.type === 'WATCH'
              ? 'border-watch-amber text-watch-amber'
              : 'border-lichen text-lichen';

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto bg-gauge-panel border-2 ${borderColor} p-3 shadow-xl transition-all flex flex-col gap-1`}
            >
              <div className="flex items-center justify-between text-scale-11 font-mono uppercase tracking-wider">
                <span className="font-semibold flex items-center gap-1.5">
                  <span className="inline-block w-2 h-2 bg-current" />
                  {toast.type}: {toast.title}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-contour">{toast.timestamp}</span>
                  <button
                    type="button"
                    onClick={() => removeToast(toast.id)}
                    className="text-contour hover:text-offwhite px-1 text-sm font-mono leading-none"
                  >
                    ×
                  </button>
                </div>
              </div>
              <p className="text-scale-13 font-sans text-offwhite mt-0.5 leading-snug">
                {toast.description}
              </p>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

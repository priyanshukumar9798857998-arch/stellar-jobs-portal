import React from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { ToastData, useToastContext } from './ToastContext';

const Toast: React.FC<{ toast: ToastData }> = ({ toast }) => {
  const { removeToast } = useToastContext();

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-[hsl(var(--success))]" />,
    error: <AlertCircle className="w-5 h-5 text-[hsl(var(--destructive))]" />,
    info: <Info className="w-5 h-5 text-[hsl(var(--primary))]" />,
  };

  const borderClass = {
    success: 'toast-success',
    error: 'toast-error',
    info: 'toast-info',
  };

  return (
    <div
      className={`toast ${borderClass[toast.type]}`}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="flex-shrink-0">{icons[toast.type]}</div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-[hsl(var(--foreground))]">{toast.title}</p>
        {toast.message && (
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
            {toast.message}
          </p>
        )}
        {toast.action && (
          <button
            onClick={toast.action.onClick}
            className="text-sm font-medium text-[hsl(var(--primary))] hover:text-[hsl(var(--secondary))] mt-2 transition-colors focus-ring rounded"
          >
            {toast.action.label}
          </button>
        )}
      </div>
      <button
        onClick={() => removeToast(toast.id)}
        className="flex-shrink-0 p-1 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors focus-ring"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
      </button>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts } = useToastContext();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container" aria-label="Notifications">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} />
      ))}
    </div>
  );
};

export default Toast;

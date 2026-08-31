import { useTickets } from '../../store/useTickets';
import { CloseIcon } from './Icons';

export function ToastContainer() {
  const { toasts, dismissToast } = useTickets();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          <span className="toast-dot" />
          <span className="toast-message">{toast.message}</span>
          <button
            type="button"
            className="toast-dismiss"
            onClick={() => dismissToast(toast.id)}
            aria-label="Dismiss notification"
          >
            <CloseIcon size={12} />
          </button>
        </div>
      ))}
    </div>
  );
}

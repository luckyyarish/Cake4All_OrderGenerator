import { AlertTriangle } from "lucide-react";

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-xs flex items-center justify-center z-50 p-4 bg-brand-primary/20">
      <div className="bg-brand-surface rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-brand-border">
        <div className="bg-brand-bg border-b border-brand-border px-6 py-4 flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-brand-error" />
          <h2 className="text-xl font-bold text-brand-primary">{title}</h2>
        </div>
        <div className="p-6">
          <p className="text-brand-secondary">{message}</p>
        </div>
        <div className="bg-brand-bg px-6 py-4 flex gap-3 border-t border-brand-border">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={onConfirm} className="bg-brand-error text-white py-3.5 px-4 rounded-lg font-semibold hover:bg-brand-error/90 transition-all flex-1">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
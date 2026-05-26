import { useState } from "react";
import { Settings, Trash2, Download, Upload } from "lucide-react";

const SettingsMenu = ({ onClearAll, onBackup, onRestore, ordersCount }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleRestoreClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      onRestore(e);
      setIsOpen(false);
    };
    input.click();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-brand-bg text-brand-accent border border-brand-border p-2 rounded-lg hover:bg-brand-border transition-all shadow-sm"
        title="Settings"
      >
        <Settings className="w-5 h-5" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute right-0 mt-2 w-48 bg-brand-surface rounded-lg shadow-lg border border-brand-border py-2 z-20">
            <button
              onClick={() => {
                onBackup();
                setIsOpen(false);
              }}
              disabled={ordersCount === 0}
              className="w-full px-4 py-2 text-left text-brand-primary hover:bg-brand-bg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4 text-brand-accent" />
              Backup Orders
            </button>

            <button
              onClick={handleRestoreClick}
              className="w-full px-4 py-2 text-left text-brand-primary hover:bg-brand-bg flex items-center gap-2 transition-colors"
            >
              <Upload className="w-4 h-4 text-brand-success" />
              Restore Orders
            </button>

            <div className="border-t border-brand-border my-2" />

            <button
              onClick={() => {
                onClearAll();
                setIsOpen(false);
              }}
              disabled={ordersCount === 0}
              className="w-full px-4 py-2 text-left text-brand-error hover:bg-brand-error/10 flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-4 h-4" />
              Clear All Orders
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default SettingsMenu;

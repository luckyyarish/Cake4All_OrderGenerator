import { Download, Upload } from "lucide-react";
import toast from "react-hot-toast";

const BackupRestore = ({ orders, onRestore }) => {
  // Backup orders to JSON file
  const handleBackup = () => {
    if (orders.length === 0) {
      toast.error("No orders to backup!");
      return;
    }

    const dataStr = JSON.stringify(orders, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    const date = new Date().toISOString().split("T")[0];
    link.download = `Cake4All_Backup_${date}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast.success(`Backed up ${orders.length} orders!`);
  };

  // Restore orders from JSON file
  const handleRestore = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const restoredOrders = JSON.parse(e.target.result);
        
        if (!Array.isArray(restoredOrders)) {
          toast.error("Invalid backup file format!");
          return;
        }

        onRestore(restoredOrders);
        toast.success(`Restored ${restoredOrders.length} orders!`);
      } catch (error) {
        toast.error("Failed to restore backup!");
        console.error(error);
      }
    };
    reader.readAsText(file);
    event.target.value = ""; // Reset input
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={handleBackup}
        disabled={orders.length === 0}
        className="btn-secondary !py-2 !px-3 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        title="Download backup"
      >
        <Download className="w-4 h-4" />
        <span className="hidden sm:inline">Backup</span>
      </button>

      <label className="btn-primary !py-2 !px-3 cursor-pointer text-sm">
        <Upload className="w-4 h-4" />
        <span className="hidden sm:inline">Restore</span>
        <input type="file" accept=".json" onChange={handleRestore} className="hidden" />
      </label>
    </div>
  );
};

export default BackupRestore;
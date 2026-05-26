import { Copy } from "lucide-react";
import toast from "react-hot-toast";

const DuplicateOrderButton = ({ order, onDuplicate }) => {
  const handleDuplicate = (e) => {
    e.stopPropagation(); // Prevent opening order details modal
    
    // Minimal, direct notification text
    toast.success("Order duplicated, update delivery date and save.");

    onDuplicate(order);
  };

  return (
    <button
      onClick={handleDuplicate}
      className="flex-shrink-0 p-1.5 md:p-2 text-brand-accent hover:bg-brand-bg rounded-lg transition-colors"
      title="Duplicate order"
    >
      <Copy className="w-4 h-4 md:w-5 md:h-5" />
    </button>
  );
};

export default DuplicateOrderButton;
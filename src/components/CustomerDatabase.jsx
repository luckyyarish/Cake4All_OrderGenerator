import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import toast from "react-hot-toast";
import { Users, Search, Trash2, ShieldAlert } from "lucide-react";
import ConfirmDialog from "./ConfirmDialog";

const CustomerDatabase = () => {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    id: null,
    name: "",
  });
  const [clearAllConfirm, setClearAllConfirm] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error("Failed to load customers");
    } else {
      setCustomers(data);
    }
  };

  const handleDeleteClick = (e, id, name) => {
    e.stopPropagation(); // Stop row clicks
    setDeleteConfirm({ isOpen: true, id, name });
  };

  const confirmDeleteCustomer = async () => {
    try {
      const { error } = await supabase
        .from("customers")
        .delete()
        .eq("id", deleteConfirm.id);

      if (error) throw error;
      toast.success(`${deleteConfirm.name} removed from database.`);
      fetchCustomers();
    } catch (err) {
      toast.error("Delete operation failed.");
    } finally {
      setDeleteConfirm({ isOpen: false, id: null, name: "" });
    }
  };

  const confirmClearAllCustomers = async () => {
    try {
      const { error } = await supabase.from("customers").delete().neq("id", 0); // Truncates all rows safely

      if (error) throw error;
      toast.success("Customer registry cleared completely.");
      setCustomers([]);
    } catch (err) {
      toast.error("Failed to clear directory.");
    } finally {
      setClearAllConfirm(false);
    }
  };

  const filtered = customers.filter(
    (c) =>
      (c.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.phone || "").includes(searchTerm),
  );

  return (
    <div className="card w-full max-w-4xl mx-auto mt-6">
      <div className="bg-brand-surface border-b border-brand-border px-8 py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-brand-primary flex items-center gap-2">
            <Users className="text-brand-accent" /> Customer Database
          </h2>
          <p className="text-sm text-brand-secondary mt-1">
            Total Registered: {customers.length}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-secondary w-4 h-4" />
            <input
              type="text"
              placeholder="Search name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-9"
            />
          </div>
          {customers.length > 0 && (
            <button
              onClick={() => setClearAllConfirm(true)}
              className="p-2.5 bg-brand-error/10 text-brand-error rounded-lg hover:bg-brand-error hover:text-white transition-all"
              title="Clear Customer Database"
            >
              <ShieldAlert size={20} />
            </button>
          )}
        </div>
      </div>

      <div className="p-0 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-brand-bg text-brand-secondary text-sm border-b border-brand-border">
              <th className="p-4 font-semibold">Customer Name</th>
              <th className="p-4 font-semibold">Phone Number</th>
              <th className="p-4 font-semibold">Total Orders</th>
              <th className="p-4 font-semibold">First Visit</th>
              <th className="p-4 font-semibold text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((customer) => (
              <tr
                key={customer.id}
                className="border-b border-brand-border last:border-0 hover:bg-brand-bg/30 transition-colors"
              >
                <td className="p-4 font-bold text-brand-primary">
                  {customer.name}
                </td>
                <td className="p-4 text-brand-secondary font-medium">
                  {customer.phone}
                </td>
                <td className="p-4">
                  <span className="bg-brand-accent/10 text-brand-accent px-2 py-1 rounded font-semibold text-xs">
                    {customer.total_orders || 1} Orders
                  </span>
                </td>
                <td className="p-4 text-brand-secondary text-sm">
                  {new Date(customer.created_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
                <td className="p-4 text-center">
                  <button
                    onClick={(e) =>
                      handleDeleteClick(e, customer.id, customer.name)
                    }
                    className="p-1.5 text-brand-secondary hover:text-brand-error hover:bg-brand-error/10 rounded-md transition-colors"
                    title="Delete customer record"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan="5"
                  className="p-8 text-center text-brand-secondary text-base"
                >
                  No customer records matched your parameters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Single Customer Elimination Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: null, name: "" })}
        onConfirm={confirmDeleteCustomer}
        title="Delete Customer Profile"
        message={`Are you sure you want to completely erase ${deleteConfirm.name} from your contact histories? This won't affect their orders list.`}
      />

      {/* Massive Database Purge Alert */}
      <ConfirmDialog
        isOpen={clearAllConfirm}
        onClose={() => setClearAllConfirm(false)}
        onConfirm={confirmClearAllCustomers}
        title="Wipe Entire Customer Registry"
        message="CRITICAL DANGER: You are about to clear ALL customer tracking charts. This action cannot be undone. Do you wish to proceed?"
      />
    </div>
  );
};

export default CustomerDatabase;

import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import toast from "react-hot-toast";
import { IndianRupee, Save, Plus, Trash2, Edit2 } from "lucide-react";
import ConfirmDialog from "./ConfirmDialog";

const PriceManager = () => {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newFlavor, setNewFlavor] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    id: null,
    flavor: "",
  });

  useEffect(() => {
    fetchPrices();
  }, []);

  const fetchPrices = async () => {
    const { data, error } = await supabase
      .from("cake_prices")
      .select("*")
      .order("flavor");
    if (!error && data) setPrices(data);
    setLoading(false);
  };

  const handlePriceChange = (id, value) => {
    setPrices(
      prices.map((p) => (p.id === id ? { ...p, price_per_pound: value } : p)),
    );
  };

  const savePriceAndName = async (item) => {
    const finalFlavorName =
      editingId === item.id ? editingName.trim() : item.flavor;

    if (!finalFlavorName) {
      toast.error("Flavor name cannot be empty!");
      return;
    }

    const { error } = await supabase
      .from("cake_prices")
      .update({
        price_per_pound: item.price_per_pound,
        flavor: finalFlavorName,
      })
      .eq("id", item.id);

    if (error) {
      toast.error("Failed to save changes.");
    } else {
      toast.success("Changes saved live!");
      setEditingId(null);
      fetchPrices();
    }
  };

  const handleAddFlavor = async (e) => {
    e.preventDefault();
    if (!newFlavor.trim() || !newPrice) {
      toast.error("Fill both fields!");
      return;
    }
    const { data, error } = await supabase
      .from("cake_prices")
      .insert([{ flavor: newFlavor.trim(), price_per_pound: newPrice }])
      .select();

    if (error) {
      toast.error("Flavor already exists!");
    } else {
      toast.success("Added to menu!");
      setPrices(
        [...prices, data[0]].sort((a, b) => a.flavor.localeCompare(b.flavor)),
      );
      setNewFlavor("");
      setNewPrice("");
    }
  };

  const confirmDeleteFlavor = async () => {
    const { error } = await supabase
      .from("cake_prices")
      .delete()
      .eq("id", deleteConfirm.id);
    if (error) {
      toast.error("Failed to delete flavor.");
    } else {
      toast.success("Flavor removed from menu.");
      setPrices(prices.filter((p) => p.id !== deleteConfirm.id));
    }
    setDeleteConfirm({ isOpen: false, id: null, flavor: "" });
  };

  if (loading)
    return (
      <div className="p-8 text-center text-brand-secondary">
        Loading prices...
      </div>
    );

  return (
    <div className="card w-full max-w-2xl mx-auto mt-6">
      <div className="bg-brand-surface border-b border-brand-border px-8 py-6">
        <h2 className="text-2xl font-bold text-brand-primary flex items-center gap-2">
          <IndianRupee className="text-brand-accent" /> Base Price Manager
        </h2>
      </div>

      <div className="p-6 md:p-8 border-b border-brand-border bg-brand-bg/30">
        <form
          onSubmit={handleAddFlavor}
          className="flex flex-col sm:flex-row gap-3 items-end"
        >
          <div className="flex-1 w-full">
            <label className="label-text text-xs">New Cake Flavor</label>
            <input
              type="text"
              placeholder="e.g. Mango"
              value={newFlavor}
              onChange={(e) => setNewFlavor(e.target.value)}
              className="input-field"
            />
          </div>
          <div className="w-full sm:w-32">
            <label className="label-text text-xs">Price / lb (₹)</label>
            <input
              type="number"
              placeholder="0"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              className="input-field"
            />
          </div>
          <button type="submit" className="btn-primary h-[42px] px-6">
            <Plus size={18} />
          </button>
        </form>
      </div>

      <div className="p-6 md:p-8 space-y-4">
        {prices.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between border-b border-brand-border pb-4 last:border-0 gap-4"
          >
            <div className="flex-1">
              {editingId === item.id ? (
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="input-field max-w-xs"
                />
              ) : (
                <span className="font-semibold text-brand-primary text-base">
                  {item.flavor}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-brand-secondary">₹</span>
              <input
                type="number"
                value={item.price_per_pound}
                onChange={(e) => handlePriceChange(item.id, e.target.value)}
                className="input-field w-20 text-center"
              />

              <button
                onClick={() => savePriceAndName(item)}
                className="p-2 bg-brand-success/10 text-brand-success rounded hover:bg-brand-success hover:text-white transition-colors"
                title="Save changes"
              >
                <Save size={16} />
              </button>

              {editingId !== item.id && (
                <button
                  onClick={() => {
                    setEditingId(item.id);
                    setEditingName(item.flavor);
                  }}
                  className="p-2 text-brand-secondary hover:bg-brand-bg rounded transition-colors"
                  title="Rename flavor"
                >
                  <Edit2 size={16} />
                </button>
              )}

              <button
                onClick={() =>
                  setDeleteConfirm({
                    isOpen: true,
                    id: item.id,
                    flavor: item.flavor,
                  })
                }
                className="p-2 text-brand-secondary hover:text-brand-error hover:bg-brand-error/10 rounded transition-colors"
                title="Delete flavor"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() =>
          setDeleteConfirm({ isOpen: false, id: null, flavor: "" })
        }
        onConfirm={confirmDeleteFlavor}
        title="Delete Flavor"
        message={`Are you sure you want to completely remove "${deleteConfirm.flavor}" from the menu options?`}
      />
    </div>
  );
};

export default PriceManager;

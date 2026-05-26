import { useState } from "react";
import toast from "react-hot-toast";
import { Search, Package, Trash2, SquarePen, Share2 } from "lucide-react";
import ConfirmDialog from "./ConfirmDialog";
import OrderDetailsModal from "./OrderDetailsModal";
import { exportOrdersToExcel } from "../utils/exportToExcel";
import SettingsMenu from "./SettingsMenu";
import Statistics from "./Statistics";
import DuplicateOrderButton from "./DuplicateOrderButton";
import { CustomSelect } from "./CustomSelect";
import { supabase } from "../supabase"; // Connect cloud instance

// Added global props from App.jsx to keep things synced
const OrderHistory = ({
  orders = [],
  onRefreshOrders,
  onEditOrder,
  onDuplicateOrder,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // all, paid, pending
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    orderNumber: null,
  });
  const [sortBy, setSortBy] = useState("newest");
  const [clearAllConfirm, setClearAllConfirm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Delete individual order from cloud
  const handleDelete = (orderNumber) => {
    setDeleteConfirm({ isOpen: true, orderNumber });
  };

  const confirmDelete = async () => {
    try {
      const { error } = await supabase
        .from("orders")
        .delete()
        .eq("order_number", deleteConfirm.orderNumber);

      if (error) throw error;

      toast.success("Order deleted from cloud!");
      if (onRefreshOrders) onRefreshOrders(); // Triggers live state fetch in App.jsx
    } catch (err) {
      console.error(err.message);
      toast.error("Failed to delete order.");
    } finally {
      setDeleteConfirm({ isOpen: false, orderNumber: null });
    }
  };

  // Inline status dropdown modification update handler
  const handleStatusChange = async (orderNumber, newStatus) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ order_status: newStatus })
        .eq("order_number", orderNumber);

      if (error) throw error;

      toast.success(`Marked as ${newStatus}`);
      if (onRefreshOrders) onRefreshOrders();
    } catch (err) {
      console.error(err.message);
      toast.error("Status update failed.");
    }
  };

  const handleClearAll = () => {
    setClearAllConfirm(true);
  };

  const confirmClearAll = async () => {
    try {
      // Clear out the entire cloud table context
      const { error } = await supabase
        .from("orders")
        .delete()
        .neq("order_number", "FORCE_CLEAR_ALL_MATCH_TRUE");

      if (error) throw error;

      toast.success("All records cleared from database!");
      if (onRefreshOrders) onRefreshOrders();
    } catch (err) {
      console.error(err.message);
      toast.error("Clear database command failed.");
    } finally {
      setClearAllConfirm(false);
    }
  };

  const handleBackup = () => {
    if (orders.length === 0) {
      toast.error("No orders to backup!");
      return;
    }
    try {
      const dataStr = JSON.stringify(orders, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      const date = new Date().toISOString().split("T")[0];
      link.download = `Cake4All_Cloud_Backup_${date}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success(`Backed up ${orders.length} orders!`);
    } catch (error) {
      toast.error("Backup failed!");
    }
  };

  const handleRestoreFile = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const restoredOrders = JSON.parse(e.target.result);
        if (!Array.isArray(restoredOrders)) {
          toast.error("Invalid backup format!");
          return;
        }

        // Remap to match exact postgres snake_case columns
        const rowsToInsert = restoredOrders.map((order) => ({
          order_number:
            order.orderNumber || `${Math.floor(10000 + Math.random() * 90000)}`,
          customer_name: order.customerName,
          phone: order.phone || "",
          cake_type: order.cakeType,
          weight: order.weight,
          total_price: String(order.totalPrice),
          advance_payment: String(order.advancePayment || "0"),
          dues_payment: String(order.duesPayment || "0"),
          cake_message: order.cakeMessage || "",
          fulfillment_type: order.fulfillmentType || "Pickup",
          order_status: order.orderStatus || "Pending",
          delivery_date: order.deliveryDate || "",
          delivery_time: order.delivery_time || "",
        }));

        const { error } = await supabase.from("orders").insert(rowsToInsert);
        if (error) throw error;

        toast.success(`Uploaded ${restoredOrders.length} records to cloud!`);
        if (onRefreshOrders) onRefreshOrders();
      } catch (error) {
        console.error(error);
        toast.error("Failed to upload data packets.");
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  const handleExportToExcel = () => {
    exportOrdersToExcel(orders, formatDate, formatTime);
  };

  // Process filters dynamically using the live array
  const filteredOrders = orders
    .filter((order) => {
      const matchesSearch =
        (order.customerName || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (order.orderNumber || "").includes(searchTerm);

      const isPaid = Number(order.duesPayment) === 0;
      const type = (order.fulfillmentType || "pickup").toLowerCase();

      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "paid" && isPaid) ||
        (filterStatus === "pending" && !isPaid) ||
        (filterStatus === "pickup" && type === "pickup") ||
        (filterStatus === "delivery" && type === "delivery");

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.deliveryDate || b.createdAt) -
            new Date(a.deliveryDate || a.createdAt)
          );
        case "oldest":
          return (
            new Date(a.deliveryDate || a.createdAt) -
            new Date(b.deliveryDate || b.createdAt)
          );
        case "highest":
          return Number(b.totalPrice) - Number(a.totalPrice);
        case "lowest":
          return Number(a.totalPrice) - Number(b.totalPrice);
        case "name":
          return (a.customerName || "").localeCompare(b.customerName || "");
        case "pending":
          return Number(b.duesPayment) - Number(a.duesPayment);
        default:
          return 0;
      }
    });

  const formatTime = (timeString) => {
    if (!timeString) return "";
    try {
      const date = new Date(timeString);
      let hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12;
      return `${hours}:${minutes < 10 ? "0" + minutes : minutes} ${ampm}`;
    } catch (e) {
      return timeString;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <>
      <Statistics orders={orders} />

      <div className="card w-full">
        <div className="bg-brand-surface border-b border-brand-border px-6 py-4 md:px-8 md:py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-brand-primary">
                Order History
              </h1>
              <p className="text-brand-secondary text-xs md:text-sm mt-1">
                Total: {orders.length} | Showing: {filteredOrders.length}
              </p>
            </div>
            <div className="flex gap-2">
              <SettingsMenu
                onClearAll={handleClearAll}
                onBackup={handleBackup}
                onRestore={handleRestoreFile}
                ordersCount={orders.length}
              />
              <button
                onClick={handleExportToExcel}
                className="bg-brand-bg text-brand-accent p-2 rounded-lg hover:bg-brand-border transition-all"
                title="Export to Excel"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-6 border-b border-brand-border bg-brand-bg/30">
          <div className="flex flex-col gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-secondary w-5 h-5" />
              <input
                type="text"
                placeholder="Search orders..."
                className="input-field pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4 mt-2 w-full">
              <div className="flex-1 w-full">
                <label className="text-xs text-brand-secondary font-semibold uppercase tracking-wider mb-1.5 block">
                  Filter
                </label>
                <CustomSelect
                  value={filterStatus}
                  onChange={setFilterStatus}
                  options={[
                    { value: "all", label: "All Orders" },
                    { value: "paid", label: "Fully Paid" },
                    { value: "pending", label: "Payment Pending" },
                    { value: "pickup", label: "Fulfillment: Pickup" },
                    { value: "delivery", label: "Fulfillment: Delivery" },
                  ]}
                />
              </div>

              <div className="flex-1 w-full">
                <label className="text-xs text-brand-secondary font-semibold uppercase tracking-wider mb-1.5 block">
                  Sort By
                </label>
                <CustomSelect
                  value={sortBy}
                  onChange={setSortBy}
                  options={[
                    { value: "newest", label: "Newest" },
                    { value: "oldest", label: "Oldest" },
                    { value: "highest", label: "High Amount" },
                    { value: "lowest", label: "Low Amount" },
                    { value: "name", label: "Name A-Z" },
                    ...(filterStatus !== "paid"
                      ? [{ value: "pending", label: "Pending Dues" }]
                      : []),
                  ]}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-6 bg-brand-surface">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-brand-border mx-auto mb-4" />
              <p className="text-brand-secondary text-lg">No orders found</p>
              <p className="text-brand-secondary/60 text-sm mt-2">
                {searchTerm || filterStatus !== "all"
                  ? "Try adjusting your search or filter"
                  : "Start creating orders to see them here"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div
                  key={order.orderNumber}
                  className="border border-brand-border rounded-xl p-5 hover:border-brand-accent transition-all cursor-pointer bg-white"
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <h3 className="font-bold text-lg text-brand-primary">
                          {order.customerName}
                        </h3>
                        <span className="text-xs bg-brand-bg border border-brand-border text-brand-primary px-2 py-1 rounded-md font-semibold">
                          #{order.orderNumber}
                        </span>

                        <div
                          className="w-32"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <CustomSelect
                            value={order.orderStatus || "Pending"}
                            onChange={(newValue) => {
                              handleStatusChange(order.orderNumber, newValue);
                            }}
                            options={[
                              { value: "Pending", label: "Pending" },
                              { value: "Confirmed", label: "Confirmed" },
                              { value: "In Progress", label: "In Progress" },
                              { value: "Ready", label: "Ready" },
                              { value: "Delivered", label: "Delivered" },
                              { value: "Cancelled", label: "Cancelled" },
                            ]}
                          />
                        </div>

                        {Number(order.duesPayment) === 0 ? (
                          <span className="text-xs bg-brand-accent/10 text-brand-success px-2 py-1 rounded-md font-semibold">
                            Paid
                          </span>
                        ) : (
                          <span className="text-xs bg-brand-error/10 text-brand-error px-2 py-1 rounded-md font-semibold">
                            ₹{order.duesPayment} Due
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-brand-secondary">
                        <p>
                          <span className="font-medium text-brand-primary">
                            Phone:
                          </span>{" "}
                          {order.phone || "N/A"}
                        </p>
                        <p>
                          <span className="font-medium text-brand-primary">
                            Cake:
                          </span>{" "}
                          {order.weight} {order.cakeType}
                        </p>
                        <p>
                          <span className="font-medium text-brand-primary capitalize">
                            {order.fulfillmentType || "Pickup"}:
                          </span>{" "}
                          {formatDate(order.deliveryDate)}
                        </p>
                        <p>
                          <span className="font-medium text-brand-primary">
                            Total:
                          </span>{" "}
                          ₹{order.totalPrice}
                        </p>
                      </div>

                      {order.cakeMessage && (
                        <p className="text-sm text-brand-accent italic mt-2">
                          Message: "{order.cakeMessage}"
                        </p>
                      )}
                    </div>

                    <div className="flex gap-1 md:gap-2 font-sans font-semibold">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditOrder(order);
                        }}
                        className="flex-shrink-0 p-1.5 md:p-2 text-brand-secondary hover:bg-brand-bg hover:text-brand-primary rounded-lg transition-colors"
                        title="Edit order"
                      >
                        <SquarePen className="w-4 h-4 md:w-5 md:h-5" />
                      </button>

                      <DuplicateOrderButton
                        order={order}
                        onDuplicate={(orderToCopy) => {
                          onDuplicateOrder(orderToCopy);
                        }}
                      />

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const message = `
*Cake 4 All | Order Confirmed!*
Hi *${order.customerName}*, we've got your order (#${order.orderNumber}).

[ Order Details ]
• Item: ${order.weight} ${order.cakeType} ${order.cakeMessage ? `\n• Message: "${order.cakeMessage}"` : ""}
• Status: ${order.orderStatus || "Pending"}
• Balance Due: Rs.${order.duesPayment}

[ ${order.fulfillmentType || "Pickup"} Schedule ]
• Date: ${formatDate(order.deliveryDate)}
• Time: ${formatTime(order.deliveryTime)}

Thank you for choosing us!
Contact: 8539000386
`.trim();

                          if (order.phone) {
                            // Strip everything that isn't a digit
                            const cleanNumber = order.phone.replace(/\D/g, "");

                            // If it's a standard 10-digit number, prepend India's '91' country code
                            const finalPhoneNumber =
                              cleanNumber.length === 10
                                ? `91${cleanNumber}`
                                : cleanNumber;

                            const encodedMessage = encodeURIComponent(message);
                            const whatsappUrl = `https://wa.me/${finalPhoneNumber}?text=${encodedMessage}`;
                            window.open(whatsappUrl, "_blank");
                          } else {
                            toast.error(
                              "No phone number available for this order",
                            );
                          }
                        }}
                        className="flex-shrink-0 p-1.5 md:p-2 text-brand-success hover:bg-brand-success/10 rounded-lg transition-colors"
                        title="Share on WhatsApp"
                      >
                        <Share2 className="w-4 h-4 md:w-5 md:h-5" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(order.orderNumber);
                        }}
                        className="flex-shrink-0 p-1.5 md:p-2 text-brand-error hover:bg-brand-error/10 rounded-lg transition-colors"
                        title="Delete order"
                      >
                        <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <ConfirmDialog
          isOpen={deleteConfirm.isOpen}
          onClose={() => setDeleteConfirm({ isOpen: false, orderNumber: null })}
          onConfirm={confirmDelete}
          title="Delete Order"
          message="Are you sure you want to delete this order? This action cannot be undone."
        />

        <ConfirmDialog
          isOpen={clearAllConfirm}
          onClose={() => setClearAllConfirm(false)}
          onConfirm={confirmClearAll}
          title="Clear All Orders"
          message="Are you sure you want to delete ALL orders from the cloud database? This cannot be undone."
        />

        {selectedOrder && (
          <OrderDetailsModal
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
            formatDate={formatDate}
            formatTime={formatTime}
          />
        )}
      </div>
    </>
  );
};

export default OrderHistory;

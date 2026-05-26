import {
  X,
  User,
  Phone,
  Package,
  Calendar,
  Clock,
  CreditCard,
  MessageSquare,
} from "lucide-react";

const OrderDetailsModal = ({ order, onClose, formatDate, formatTime }) => {
  if (!order) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-xs flex items-center justify-center z-50 p-4 bg-brand-primary/20">
      <div className="card max-w-lg w-full overflow-hidden flex flex-col">
        <div className="bg-[#657C5A] px-6 py-6 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-wide">
              Order Details
            </h2>
          </div>
          <div className="bg-white text-center px-3 py-1.5 rounded-lg shadow-sm">
            <p className="text-brand-primary font-bold text-sm md:text-base leading-none">
              #{order.orderNumber}
            </p>
          </div>
        </div>

        <div className="p-5 md:p-6 space-y-4 md:space-y-5 max-h-[60vh] overflow-y-auto bg-brand-surface">
          {/* Customer Info */}
          <div className="flex items-start gap-3 pb-5 border-b border-brand-border">
            <div className="bg-brand-bg p-2 rounded-lg">
              <User className="w-5 h-5 text-brand-accent" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-brand-secondary uppercase tracking-wide mb-1">
                Customer
              </p>
              <p className="font-semibold text-brand-primary text-lg">
                {order.customerName}
              </p>
              {order.phone && (
                <div className="flex items-center gap-1 mt-1 text-brand-secondary">
                  <Phone className="w-4 h-4" />
                  <p className="text-sm">{order.phone}</p>
                </div>
              )}
            </div>
          </div>

          {/* Order Details */}
          <div className="flex items-start gap-3 pb-5 border-b border-brand-border">
            <div className="bg-brand-bg p-2 rounded-lg">
              <Package className="w-5 h-5 text-brand-accent" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-brand-secondary uppercase tracking-wide mb-1">
                Order Details
              </p>
              <p className="font-semibold text-brand-primary text-lg">
                {order.cakeType} Cake
              </p>
              <p className="text-brand-secondary">{order.weight} pound</p>
            </div>
          </div>

          {/* Message on Cake */}
          {order.cakeMessage && (
            <div className="flex items-start gap-3 pb-5 border-b border-brand-border">
              <div className="bg-brand-bg p-2 rounded-lg">
                <MessageSquare className="w-5 h-5 text-brand-accent" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-brand-secondary uppercase tracking-wide mb-1">
                  Message on Cake
                </p>
                <p className="text-brand-primary font-medium italic">
                  "{order.cakeMessage}"
                </p>
              </div>
            </div>
          )}

          {/* Payment Summary */}
          <div className="flex items-start gap-3 pb-5 border-b border-brand-border">
            <div className="bg-brand-bg p-2 rounded-lg">
              <CreditCard className="w-5 h-5 text-brand-success" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-brand-secondary uppercase tracking-wide mb-3">
                Payment Summary
              </p>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-brand-secondary">Total Amount</span>
                  <span className="font-bold text-brand-primary text-lg">
                    ₹{order.totalPrice}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-brand-secondary">Advance Paid</span>
                  <span className="text-brand-success font-semibold">
                    ₹{order.advancePayment}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-brand-border">
                  <span className="text-brand-secondary font-medium">
                    Balance Due
                  </span>
                  <span
                    className={`font-bold text-lg ${Number(order.duesPayment) === 0 ? "text-brand-success" : "text-brand-error"}`}
                  >
                    ₹{order.duesPayment}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Pickup Info */}
          <div className="flex items-start gap-3 pb-5 border-b border-brand-border">
            <div className="bg-brand-bg p-2 rounded-lg">
              <Calendar className="w-5 h-5 text-brand-accent" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-brand-secondary uppercase tracking-wide mb-1 capitalize">
                {order.fulfillmentType || "Pickup"} Schedule
              </p>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-brand-primary">
                  {formatDate(order.deliveryDate)}
                </p>
                <span className="text-brand-border">•</span>
                <div className="flex items-center gap-1 text-brand-accent">
                  <Clock className="w-4 h-4" />
                  <p className="font-medium">
                    {formatTime(order.deliveryTime)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-brand-bg px-6 py-4 border-t border-brand-border">
          <button
            onClick={onClose}
            className="btn-primary w-full flex items-center justify-center gap-2 font-sans font-semibold"
          >
            <X className="w-4 h-4 shrink-0" /> Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;

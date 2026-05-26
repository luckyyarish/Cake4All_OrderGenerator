import { useState } from "react";
import toast from "react-hot-toast";
import {
  Check,
  Clock,
  CreditCard,
  Package,
  Phone,
  User,
  X,
  Copy,
  MessageCircle,
} from "lucide-react";

const MessagePreview = ({ orderData, onClose }) => {
  const [copied, setCopied] = useState(false);

  const orderNumber = orderData.orderNumber;

  // Format time (supports Date or string)
  const formatTime = (time) => {
    if (!time) return "";

    const date = time instanceof Date ? time : new Date(`1970-01-01T${time}`);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Format date (supports Date or string)
  const formatDate = (date) => {
    if (!date) return "";

    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Format the message for WhatsApp
  const message = `
*Cake 4 All | Order Confirmed!*
Hi *${orderData.customerName}*, we've got your order (#${orderNumber}).

[ Order Details ]
• Item: ${orderData.weight}lb ${orderData.cakeType} ${orderData.cakeMessage ? `\n• Message: "${orderData.cakeMessage}"` : ""}
• Status: ${orderData.orderStatus || "Pending"}
• Balance Due: Rs.${orderData.duesPayment}

[ ${orderData.fulfillmentType || "Pickup"} Schedule ]
• Date: ${formatDate(orderData.deliveryDate)}
• Time: ${formatTime(orderData.deliveryTime)}

Thank you for choosing us!
Contact: 8539000386
`.trim();

  // Copy to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    if (!orderData.phone) {
      toast.error("No phone number available to share!");
      return;
    }

    // Strip everything that isn't a digit
    const cleanNumber = orderData.phone.replace(/\D/g, "");

    // If it's a standard 10-digit number, prepend India's '91' country code
    const finalPhoneNumber =
      cleanNumber.length === 10 ? `91${cleanNumber}` : cleanNumber;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${finalPhoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-brand-primary/40 flex items-center justify-center z-50 p-4">
      <div className="card max-w-lg w-full overflow-hidden flex flex-col max-h-[95vh]">
        <div className="bg-brand-accent px-6 py-5 text-white flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Order Confirmed!</h2>
            <p className="text-brand-bg text-sm mt-1">Cake 4 All</p>
          </div>
          <div className="bg-brand-surface rounded-lg px-3 py-2 shadow-inner">
            <p className="text-xs text-brand-secondary font-medium">Order ID</p>
            <p className="font-bold text-lg text-brand-primary">
              #{orderNumber}
            </p>
          </div>
        </div>

        <div className="p-5 space-y-4 bg-brand-surface flex-1 overflow-y-auto overflow-x-hidden">
          <div className="flex items-start gap-3 pb-5 border-b border-brand-border">
            <div className="bg-brand-bg p-2 rounded-lg">
              <User className="w-5 h-5 text-brand-accent" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-brand-secondary uppercase tracking-wide mb-1">
                Customer
              </p>
              <p className="font-semibold text-brand-primary text-lg">
                {orderData.customerName}
              </p>
              {orderData.phone && (
                <div className="flex items-center gap-1 mt-1 text-brand-secondary">
                  <Phone className="w-3 h-3" />
                  <p className="text-sm">{orderData.phone}</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3 pb-5 border-b border-brand-border">
            <div className="bg-brand-bg p-2 rounded-lg">
              <Package className="w-5 h-5 text-brand-accent" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-brand-secondary uppercase tracking-wide mb-1">
                Order Details
              </p>
              <p className="font-semibold text-brand-primary text-lg">
                {orderData.cakeType} Cake
              </p>
              <p className="text-brand-secondary">{orderData.weight} pound</p>

              <div className="flex gap-2 mt-2">
                <span className="bg-brand-bg border border-brand-border px-2 py-1 rounded text-xs font-semibold text-brand-primary">
                  Status: {orderData.orderStatus || "Pending"}
                </span>
                <span className="bg-brand-bg border border-brand-border px-2 py-1 rounded text-xs font-semibold text-brand-primary">
                  Method: {orderData.fulfillmentType || "Pickup"}
                </span>
              </div>
            </div>
          </div>

          {orderData.cakeMessage && (
            <div className="bg-brand-bg border-l-4 border-brand-accent rounded-r-lg p-4">
              <p className="text-xs text-brand-accent font-semibold uppercase tracking-wide mb-1">
                Message on Cake
              </p>
              <p className="text-brand-primary font-medium italic text-sm">
                "{orderData.cakeMessage}"
              </p>
            </div>
          )}

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
                    ₹{orderData.totalPrice}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-brand-secondary flex items-center relative">
                    <Check className="w-4 h-4 text-brand-success absolute -left-5" />
                    Advance Paid
                  </span>
                  <span className="text-brand-success font-semibold">
                    ₹{orderData.advancePayment}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-brand-border">
                  <span className="text-brand-secondary font-medium">
                    Balance Due
                  </span>
                  <span
                    className={`font-bold text-lg ${Number(orderData.duesPayment) === 0 ? "text-brand-success" : "text-brand-error"}`}
                  >
                    ₹{orderData.duesPayment}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="bg-brand-bg p-2 rounded-lg">
              <Clock className="w-5 h-5 text-brand-accent" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-brand-secondary uppercase tracking-wide mb-1">
                {orderData.fulfillmentType || "Pickup"} Schedule
              </p>
              <p className="font-semibold text-brand-primary">
                {formatDate(orderData.deliveryDate)}
              </p>
              <p className="text-brand-accent font-medium">
                {formatTime(orderData.deliveryTime)}
              </p>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="bg-brand-bg p-3 sm:px-6 sm:py-4 flex flex-row gap-2 border-t border-brand-border shrink-0">
          <button
            onClick={onClose}
            className="btn-secondary flex-1 flex items-center justify-center gap-1 text-[10px] sm:text-xs py-2 px-1"
          >
            <X className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" /> Close
          </button>
          <button
            onClick={handleCopy}
            className="btn-secondary flex-1 flex items-center justify-center gap-1 text-[10px] sm:text-xs py-2 px-1"
          >
            <Copy className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />{" "}
            {copied ? "Copied" : "Copy"}
          </button>
          <button
            onClick={handleWhatsAppShare}
            className="btn-primary flex-1 flex items-center justify-center gap-1 text-[10px] sm:text-xs py-2 px-1"
          >
            <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" /> Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessagePreview;

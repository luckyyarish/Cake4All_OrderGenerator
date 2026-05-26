import * as Select from "@radix-ui/react-select";
import { ChevronDown, Check } from "lucide-react";

// Dynamically generate time intervals from 5:00 AM to 12:00 AM (Midnight)
const generateShopTimeSlots = () => {
  const slots = [];
  let hour = 5;
  let minute = 0;

  while (hour < 24) {
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    const displayMinute = minute === 0 ? "00" : minute;

    const timeString = `${displayHour.toString().padStart(2, "0")}:${displayMinute} ${ampm}`;
    const labelString =
      hour === 12 && minute === 0 ? "12:00 PM (Noon)" : timeString;

    slots.push({ value: timeString, label: labelString });

    minute += 15;
    if (minute === 60) {
      minute = 0;
      hour += 1;
    }
  }
  // Append Midnight cleanly at the very end
  slots.push({ value: "12:00 AM", label: "12:00 AM (Midnight)" });
  return slots;
};

const shopTimeOptions = generateShopTimeSlots();

export const CustomSelect = ({ value, onChange, placeholder, options }) => {
  return (
    <Select.Root value={value} onValueChange={onChange}>
      <Select.Trigger className="w-full border-2 border-brand-border rounded-lg px-3 py-2 bg-brand-surface text-brand-primary flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent transition-all text-sm cursor-pointer font-body">
        <Select.Value placeholder={placeholder} />
        <Select.Icon>
          <ChevronDown className="w-4 h-4 text-brand-secondary" />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content className="overflow-hidden bg-brand-surface rounded-xl border border-brand-border shadow-xl min-w-[var(--radix-select-trigger-width)] max-h-64 z-50">
          <Select.Viewport className="p-1.5 space-y-0.5">
            {options.map((opt) => (
              <Select.Item
                key={opt.value}
                value={opt.value}
                className="flex items-center justify-between px-3 py-2 text-sm text-brand-primary rounded-md cursor-pointer outline-none font-body data-[highlighted]:bg-brand-bg data-[highlighted]:text-brand-primary data-[state=checked]:font-semibold transition-colors"
              >
                <Select.ItemText>{opt.label}</Select.ItemText>
                <Select.ItemIndicator>
                  <Check className="w-4 h-4 text-brand-accent" />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
};

// Export a specialized version just for the Delivery Time field
export const DeliveryTimeSelect = ({ value, onChange }) => {
  // Fix mobile formatting quirks (removes invisible spaces and ensures leading zero)
  let safeValue = value;
  if (typeof value === "string" && value) {
    safeValue = value.replace(/\u202F/g, " ").toUpperCase();
    if (safeValue.match(/^\d:/)) {
      safeValue = "0" + safeValue; // Converts "6:00 PM" to "06:00 PM"
    }
  }

  return (
    <CustomSelect
      value={safeValue}
      onChange={onChange}
      placeholder="Select time"
      options={shopTimeOptions}
    />
  );
};

// Specialized version for Order Status selection
export const OrderStatusSelect = ({ value, onChange }) => {
  const statusOptions = [
    { value: "Pending", label: "Pending" },
    { value: "Confirmed", label: "Confirmed" },
    { value: "In Progress", label: "In Progress" },
    { value: "Ready", label: "Ready" },
    { value: "Delivered", label: "Delivered" },
    { value: "Cancelled", label: "Cancelled" },
  ];

  return (
    <CustomSelect
      value={value}
      onChange={onChange}
      placeholder="Select status"
      options={statusOptions}
    />
  );
};

// Specialized version for Fulfillment method selection
export const FulfillmentSelect = ({ value, onChange }) => {
  const methodOptions = [
    { value: "Pickup", label: "Store Pickup" },
    { value: "Delivery", label: "Home Delivery" },
  ];

  return (
    <CustomSelect
      value={value}
      onChange={onChange}
      placeholder="Select method"
      options={methodOptions}
    />
  );
};

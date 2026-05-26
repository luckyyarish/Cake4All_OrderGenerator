import { useState, useEffect } from "react";
import MessagePreview from "./MessagePreview";
import { WeightSelect } from "./WeightSelect";
import { supabase } from "../supabase";
import {
  CustomSelect,
  DeliveryTimeSelect,
  OrderStatusSelect,
  FulfillmentSelect,
} from "./CustomSelect";
import DatePicker from "react-datepicker";
import toast from "react-hot-toast";
import "react-datepicker/dist/react-datepicker.css";
import {
  User,
  Phone,
  Cake,
  Weight,
  Calendar,
  Clock,
  IndianRupee,
  Package,
  Motorbike,
} from "lucide-react";

const OrderForm = ({
  editingOrder,
  duplicatingOrder,
  onOrderSaved,
}) => {
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [cakeType, setCakeType] = useState("");
  const [weight, setWeight] = useState("");
  const [totalPrice, setTotalPrice] = useState(0);
  const [advancePayment, setAdvancePayment] = useState(0);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [cakeMessage, setCakeMessage] = useState("");
  const [isPriceManuallySet, setIsPriceManuallySet] = useState(false);
  const [orderStatus, setOrderStatus] = useState("Pending");
  const [fulfillmentType, setFulfillmentType] = useState("Pickup");
  const [dbPrices, setDbPrices] = useState({});

  // Ensure we don't get NaN if fields are temporarily empty strings
  const duesPayment = Math.max(0, Number(totalPrice) - Number(advancePayment));

  const handleGenerateMessage = () => {
    const newOrderNumber = editingOrder
      ? editingOrder.orderNumber
      : `${Math.floor(10000 + Math.random() * 90000)}`;
    setOrderNumber(newOrderNumber);
    setShowPreview(true);
  };

  // Load live prices from database when form mounts
  useEffect(() => {
    const loadLivePrices = async () => {
      const { data } = await supabase
        .from("cake_prices")
        .select("flavor, price_per_pound");
      if (data) {
        const priceMap = {};
        data.forEach((item) => {
          priceMap[item.flavor] = Number(item.price_per_pound);
        });
        setDbPrices(priceMap);
      }
    };
    loadLivePrices();
  }, []);

  // Auto-set price based on cake type and weight from DB
  useEffect(() => {
    const numericWeight = parseFloat(
      String(weight || "").replace(/[^0-9.]/g, ""),
    );
    const flavor = cakeType || "";

    // Read rate directly from live database state map
    const ratePerPound = dbPrices[flavor] || 0;

    if (!isPriceManuallySet && ratePerPound > 0 && numericWeight > 0) {
      setTotalPrice(String(ratePerPound * numericWeight));
    }
  }, [cakeType, weight, isPriceManuallySet, dbPrices]);

  // Reset manual flag when cake type or weight changes
  useEffect(() => {
    setIsPriceManuallySet(false);
  }, [cakeType, weight]);

  // Load EDITING order data
  useEffect(() => {
    if (editingOrder) {
      setCustomerName(editingOrder.customerName);
      setPhone(editingOrder.phone || "");
      setCakeType(editingOrder.cakeType);
      setWeight(editingOrder.weight);
      setTotalPrice(editingOrder.totalPrice);
      setAdvancePayment(editingOrder.advancePayment);
      setCakeMessage(editingOrder.cakeMessage || "");
      setFulfillmentType(editingOrder.fulfillmentType || "Pickup");
      setOrderStatus(editingOrder.orderStatus || "Pending");
      setIsPriceManuallySet(true);

      setDeliveryDate(
        editingOrder.deliveryDate ? new Date(editingOrder.deliveryDate) : "",
      );
      setDeliveryTime(
        editingOrder.deliveryTime ? new Date(editingOrder.deliveryTime) : "",
      );
    }
  }, [editingOrder]);

  // Load DUPLICATING order data
  useEffect(() => {
    if (duplicatingOrder) {
      setCustomerName(duplicatingOrder.customerName);
      setPhone(duplicatingOrder.phone || "");
      setCakeType(duplicatingOrder.cakeType);
      setWeight(duplicatingOrder.weight);
      setTotalPrice(duplicatingOrder.totalPrice);
      setAdvancePayment(duplicatingOrder.advancePayment);
      setCakeMessage(duplicatingOrder.cakeMessage || "");
      setFulfillmentType(duplicatingOrder.fulfillmentType || "Pickup");
      setIsPriceManuallySet(true);

      setDeliveryDate("");
      setDeliveryTime("");
      setOrderStatus("Pending");
    }
  }, [duplicatingOrder]);

  // Converted to async function to communicate with Supabase safely
  const handleSaveOrder = async () => {
    // Validation
    if (!customerName.trim()) {
      toast.error("Please enter customer name!");
      return;
    }
    if (!cakeType) {
      toast.error("Please select cake type!");
      return;
    }
    if (!weight) {
      toast.error("Please select weight!");
      return;
    }
    if (!totalPrice) {
      toast.error("Please enter total price!");
      return;
    }
    if (!deliveryDate) {
      toast.error("Please select delivery date!");
      return;
    }

    const currentGeneratedNumber = editingOrder
      ? editingOrder.orderNumber
      : `${Math.floor(10000 + Math.random() * 90000)}`;

    const orderData = {
      orderNumber: currentGeneratedNumber,
      customerName,
      phone,
      cakeType,
      weight,
      totalPrice: String(totalPrice),
      advancePayment: String(advancePayment),
      duesPayment: String(duesPayment),
      deliveryDate: deliveryDate ? new Date(deliveryDate).toISOString() : "",
      deliveryTime: deliveryTime ? new Date(deliveryTime).toISOString() : "",
      cakeMessage,
      createdAt: editingOrder
        ? editingOrder.createdAt
        : new Date().toISOString(),
      orderStatus,
      fulfillmentType,
    };

    try {
      // UPDATE OR INSERT THE ORDER PACKET
      if (editingOrder && !duplicatingOrder) {
        const { error } = await supabase
          .from("orders")
          .update({
            customer_name: orderData.customerName,
            phone: orderData.phone,
            cake_type: orderData.cakeType,
            weight: orderData.weight,
            total_price: orderData.totalPrice,
            advance_payment: orderData.advancePayment,
            dues_payment: orderData.duesPayment,
            cake_message: orderData.cakeMessage,
            fulfillment_type: orderData.fulfillmentType,
            order_status: orderData.orderStatus,
            delivery_date: orderData.deliveryDate,
            delivery_time: orderData.deliveryTime,
          })
          .eq("order_number", editingOrder.orderNumber);

        if (error) throw error;
        toast.success("Order updated in cloud successfully!");
      } else {
        const { error } = await supabase.from("orders").insert([
          {
            order_number: orderData.orderNumber,
            customer_name: orderData.customerName,
            phone: orderData.phone,
            cake_type: orderData.cakeType,
            weight: orderData.weight,
            total_price: orderData.totalPrice,
            advance_payment: orderData.advancePayment,
            dues_payment: orderData.duesPayment,
            cake_message: orderData.cakeMessage,
            fulfillment_type: orderData.fulfillmentType,
            order_status: orderData.orderStatus,
            delivery_date: orderData.deliveryDate,
            delivery_time: orderData.deliveryTime,
          },
        ]);

        if (error) throw error;
        toast.success("New order saved to cloud!");
      }

      // AUTOMATIC CUSTOMER TRACKING MANAGEMENT
      if (orderData.phone && orderData.phone.trim().length === 10) {
        const cleanPhone = orderData.phone.trim();
        const cleanName = orderData.customerName.trim();

        // Check if phone number already exists in database
        const { data: existingCust, error: fetchErr } = await supabase
          .from("customers")
          .select("*")
          .eq("phone", cleanPhone)
          .maybeSingle();

        if (!fetchErr) {
          if (existingCust) {
            // Repeat customer! Increment their running order tally counter by 1
            await supabase
              .from("customers")
              .update({ total_orders: (existingCust.total_orders || 1) + 1 })
              .eq("id", existingCust.id);
          } else {
            // Brand new phone profile entry! Create their database record card
            await supabase
              .from("customers")
              .insert([
                { name: cleanName, phone: cleanPhone, total_orders: 1 },
              ]);
          }
        }
      }

      // Refresh data grids and views across dashboard
      if (onOrderSaved) onOrderSaved();

      // Clear all inputs
      setCustomerName("");
      setPhone("");
      setCakeType("");
      setWeight("");
      setTotalPrice("");
      setAdvancePayment("");
      setDeliveryDate("");
      setDeliveryTime("");
      setCakeMessage("");
      setIsPriceManuallySet(false);
      setOrderStatus("Pending");
      setFulfillmentType("Pickup");
    } catch (err) {
      console.error("Database Error:", err.message);
      toast.error("Failed to sync order data with cloud.");
    }
  };

  return (
    <>
      <div className="card w-full max-w-md lg:max-w-4xl mx-auto">
        <div className="bg-brand-surface border-b border-brand-border px-8 py-6">
          <h1 className="text-2xl md:text-3xl font-bold text-brand-primary">
            Create Order
          </h1>
        </div>

        <div className="p-6 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="label-text">
                <User className="w-4 h-4 text-brand-accent" /> Customer Name
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="Enter customer name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>

            <div>
              <label className="label-text">
                <Phone className="w-4 h-4 text-brand-accent" /> Phone Number
              </label>
              <input
                type="tel"
                className="input-field"
                placeholder="Enter phone number"
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                }
              />
            </div>

            <div>
              <label className="label-text">
                <Cake className="w-4 h-4 text-brand-accent" /> Cake Type
              </label>
              <CustomSelect
                value={cakeType}
                onChange={(val) => {
                  setCakeType(val);
                  setIsPriceManuallySet(false);
                }}
                placeholder="Select cake type"
                options={Object.keys(dbPrices).map((flavor) => ({
                  value: flavor,
                  label: flavor,
                }))}
              />
            </div>

            <div className="w-full">
              <label className="label-text">
                <Weight className="w-4 h-4 text-brand-accent" /> Weight
              </label>
              <WeightSelect
                value={weight}
                onChange={(val) => {
                  setWeight(val);
                  setIsPriceManuallySet(false);
                }}
                options={[
                  { value: "1 pound", label: "1 Pound" },
                  { value: "2 pound", label: "2 Pound" },
                  { value: "3 pound", label: "3 Pound" },
                  { value: "4 pound", label: "4 Pound" },
                ]}
              />
            </div>

            <div>
              <label className="label-text">
                <IndianRupee className="w-4 h-4 text-brand-accent" /> Total
                Price
              </label>
              <input
                type="number"
                className="input-field"
                value={totalPrice}
                onFocus={() => totalPrice === 0 && setTotalPrice("")}
                onBlur={() => totalPrice === "" && setTotalPrice(0)}
                onChange={(e) => {
                  setTotalPrice(e.target.value);
                  setIsPriceManuallySet(true);
                }}
              />
            </div>

            <div>
              <label className="label-text">
                <IndianRupee className="w-4 h-4 text-brand-success" /> Paid
              </label>
              <input
                type="number"
                className="input-field"
                value={advancePayment}
                onFocus={() => advancePayment === 0 && setAdvancePayment("")}
                onBlur={() => advancePayment === "" && setAdvancePayment(0)}
                onChange={(e) => {
                  if (e.target.value === "") {
                    setAdvancePayment("");
                  } else {
                    setAdvancePayment(
                      Math.min(
                        Math.max(0, Number(e.target.value)),
                        Number(totalPrice),
                      ),
                    );
                  }
                }}
              />
            </div>

            <div>
              <label className="label-text">
                <IndianRupee className="w-4 h-4 text-brand-error" /> Amount Due
              </label>
              <input
                type="number"
                className="input-field bg-brand-bg text-brand-secondary cursor-not-allowed border-none"
                value={duesPayment || 0}
                disabled
              />
            </div>

            <div>
              <label className="label-text">
                <Cake className="w-4 h-4 text-brand-accent" /> Message on Cake
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g., Happy Birthday!"
                value={cakeMessage}
                onChange={(e) => setCakeMessage(e.target.value)}
              />
            </div>

            <div className="w-full">
              <label className="label-text">
                <Calendar className="w-4 h-4 text-brand-accent" /> Pickup Date
              </label>
              <DatePicker
                selected={deliveryDate}
                onChange={(date) => setDeliveryDate(date)}
                dateFormat="dd-MM-yyyy"
                className="input-field cursor-pointer"
                wrapperClassName="w-full"
                placeholderText="Select date"
              />
            </div>

            <div className="w-full">
              <label className="label-text">
                <Clock className="w-4 h-4 text-brand-accent" /> Delivery Time
              </label>
              <DeliveryTimeSelect
                value={
                  deliveryTime
                    ? deliveryTime instanceof Date
                      ? (() => {
                          let h = deliveryTime.getHours();
                          const m = deliveryTime.getMinutes();
                          const ampm = h >= 12 ? "PM" : "AM";
                          h = h % 12 || 12;
                          return `${h < 10 ? "0" + h : h}:${m < 10 ? "0" + m : m} ${ampm}`;
                        })()
                      : deliveryTime
                    : ""
                }
                onChange={(timeStr) => {
                  if (!timeStr) {
                    setDeliveryTime("");
                    return;
                  }
                  const [time, modifier] = timeStr.split(" ");
                  let [hours, minutes] = time.split(":");
                  if (hours === "12") hours = "00";
                  if (modifier === "PM") hours = parseInt(hours, 10) + 12;
                  const targetDate = new Date();
                  targetDate.setHours(hours, minutes, 0, 0);
                  setDeliveryTime(targetDate);
                }}
              />
            </div>

            <div>
              <label className="label-text">
                <Package className="w-4 h-4 text-brand-accent" /> Order Status
              </label>
              <OrderStatusSelect
                value={orderStatus}
                onChange={setOrderStatus}
              />
            </div>

            <div>
              <label className="label-text">
                <Motorbike className="w-4 h-4 text-brand-accent" /> Fulfillment
                Method
              </label>
              <FulfillmentSelect
                value={fulfillmentType}
                onChange={setFulfillmentType}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-8 text-sm">
            <button
              className="btn-secondary flex-1"
              onClick={handleGenerateMessage}
            >
              Preview Details
            </button>
            <button className="btn-primary flex-1" onClick={handleSaveOrder}>
              {editingOrder && !duplicatingOrder
                ? "Update Order"
                : "Save Order"}
            </button>
          </div>
        </div>
      </div>
      {showPreview && (
        <MessagePreview
          orderData={{
            orderNumber,
            customerName,
            phone,
            cakeType,
            weight,
            totalPrice,
            advancePayment,
            duesPayment,
            deliveryDate,
            deliveryTime,
            cakeMessage,
            orderStatus,
            fulfillmentType,
          }}
          onClose={() => setShowPreview(false)}
        />
      )}
    </>
  );
};

export default OrderForm;

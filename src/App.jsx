import { useState, useEffect } from "react";
import OrderForm from "./components/OrderForm";
import OrderHistory from "./components/OrderHistory";
import Sidebar from "./components/Sidebar";
import CustomerDatabase from "./components/CustomerDatabase";
import PriceManager from "./components/PriceManager";
import QuickStats from "./components/QuickStats";
import { Toaster } from "react-hot-toast";
import { supabase } from "./supabase";
import Login from "./components/Login";

const App = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState("create");
  const [editingOrder, setEditingOrder] = useState(null);
  const [duplicatingOrder, setDuplicatingOrder] = useState(null);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading data:", error.message);
    } else {
      const formattedOrders = data.map((order) => ({
        id: order.id,
        orderNumber: order.order_number,
        customerName: order.customer_name,
        phone: order.phone,
        cakeType: order.cake_type,
        weight: order.weight,
        totalPrice: order.total_price,
        advancePayment: order.advance_payment,
        duesPayment: order.dues_payment,
        cakeMessage: order.cake_message,
        fulfillmentType: order.fulfillment_type,
        orderStatus: order.order_status,
        deliveryDate: order.delivery_date,
        deliveryTime: order.delivery_time,
        createdAt: order.created_at,
      }));
      setOrders(formattedOrders);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleEditOrder = (order) => {
    setEditingOrder(order);
    setDuplicatingOrder(null);
    setCurrentView("create");
  };

  const handleDuplicateOrder = (order) => {
    setDuplicatingOrder(order);
    setEditingOrder(null);
    setCurrentView("create");
  };

  const handleOrderSaved = () => {
    setEditingOrder(null);
    setDuplicatingOrder(null);
    fetchOrders();
  };

  // Render the correct screen based on the sidebar selection
  const renderView = () => {
    switch (currentView) {
      case "create":
        return (
          <div className="w-full max-w-md lg:max-w-4xl mx-auto space-y-6">
            <QuickStats orders={orders} />
            <OrderForm
              editingOrder={editingOrder}
              duplicatingOrder={duplicatingOrder}
              onOrderSaved={handleOrderSaved}
            />
          </div>
        );
      case "history":
        return (
          <OrderHistory
            orders={orders}
            onRefreshOrders={fetchOrders}
            onEditOrder={handleEditOrder}
            onDuplicateOrder={handleDuplicateOrder}
          />
        );
      case "customers":
        return <CustomerDatabase />;
      case "prices":
        return <PriceManager />;
      default:
        return (
          <div className="w-full max-w-md lg:max-w-4xl mx-auto space-y-6">
            <QuickStats orders={orders} />
            <OrderForm onOrderSaved={handleOrderSaved} />
          </div>
        );
    }
  };

  // If there is no active session, show the Login screen
  if (loading) {
    return <div className="min-h-screen bg-[#FDFBF7]" />; 
  }
  
  if (!session) {
    return <Login onLoginSuccess={() => console.log("Successfully Logged In!")} />;
  }

  // If logged in, show the main dashboard
  return (
    <div className="flex flex-col md:flex-row h-screen bg-brand-bg font-body overflow-hidden">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#FFFFFF",
            color: "#4A3422",
            padding: "16px",
            borderRadius: "8px",
            border: "1px solid #D8CFC3",
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          },
          success: {
            iconTheme: { primary: "#5F7D5A", secondary: "#FFFFFF" },
          },
          error: {
            iconTheme: { primary: "#B94A48", secondary: "#FFFFFF" },
          },
        }}
      />

      {/* Sidebar Layout */}
      <div className="flex-none z-20">
        <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 w-full">
        <div className="w-full max-w-md lg:max-w-4xl mx-auto">
          {renderView()}
        </div>
      </div>
    </div>
  );
};

export default App;
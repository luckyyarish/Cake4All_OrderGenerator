import { Package, TrendingUp, Sparkles } from "lucide-react";

const QuickStats = ({ orders = [] }) => {
  const today = new Date();

  // 1. Calculate Deliveries Today
  const todayDeliveries = orders.filter((order) => {
    if (!order.deliveryDate) return false;
    const deliveryDate = new Date(order.deliveryDate);
    return (
      deliveryDate.getDate() === today.getDate() &&
      deliveryDate.getMonth() === today.getMonth() &&
      deliveryDate.getFullYear() === today.getFullYear()
    );
  }).length;

  // 2. Calculate Pending Dues Amount
  const pendingAmount = orders.reduce(
    (sum, order) => sum + Number(order.duesPayment || 0),
    0
  );

  // 3. Track Recent Customer Name
  const recentCustomer = orders.length > 0 ? orders[0].customerName : "None";

  return (
    // Matches the identical card format wrapper used in Statistics.jsx
    <div className="card p-4 mb-6 w-full">
      <div className="grid grid-cols-3 gap-4 divide-x divide-brand-border">
        
        {/* Deliveries Today Block */}
        <div className="flex items-center justify-center gap-3 py-2">
          <div className="bg-brand-bg p-2 rounded-lg hidden sm:block">
            <Package className="w-5 h-5 text-brand-accent" />
          </div>
          <div className="text-center sm:text-left">
            <p className="text-xs text-brand-secondary font-medium">Today</p>
            <p className="text-lg md:text-xl font-bold text-brand-primary">
              {todayDeliveries}
            </p>
          </div>
        </div>

        {/* Pending Dues Block */}
        <div className="flex items-center justify-center gap-3 py-2">
          <div className="bg-brand-bg p-2 rounded-lg hidden sm:block">
            <TrendingUp className="w-5 h-5 text-brand-error" />
          </div>
          <div className="text-center sm:text-left">
            <p className="text-xs text-brand-secondary font-medium">Pending</p>
            <p className="text-lg md:text-xl font-bold text-brand-error">
              ₹{pendingAmount.toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        {/* Recent Activity Block */}
        <div className="flex items-center justify-center gap-3 py-2 px-1 min-w-0">
          <div className="bg-brand-bg p-2 rounded-lg hidden sm:block">
            <Sparkles className="w-5 h-5 text-brand-accent" />
          </div>
          <div className="text-center sm:text-left min-w-0 w-full">
            <p className="text-xs text-brand-secondary font-medium">Recent</p>
            <p className="text-sm md:text-base font-bold text-brand-primary truncate" title={recentCustomer}>
              {recentCustomer}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default QuickStats;
import {
  TrendingUp,
  ChartNoAxesCombined,
  Package,
  Calendar,
} from "lucide-react";

// Pass live orders directly into the component parameters
const Statistics = ({ orders = [] }) => {
  const today = new Date();

  // Calculate stats live on the fly from your state engine array
  const totalRevenue = orders.reduce(
    (sum, order) => sum + Number(order.totalPrice || 0),
    0,
  );
  const pendingAmount = orders.reduce(
    (sum, order) => sum + Number(order.duesPayment || 0),
    0,
  );
  const totalOrders = orders.length;

  const todayDeliveries = orders.filter((order) => {
    if (!order.deliveryDate) return false;
    const deliveryDate = new Date(order.deliveryDate);
    return (
      deliveryDate.getDate() === today.getDate() &&
      deliveryDate.getMonth() === today.getMonth() &&
      deliveryDate.getFullYear() === today.getFullYear()
    );
  }).length;

  return (
    <div className="card p-4 mb-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-0 lg:divide-x divide-brand-border">
        <div className="flex items-center justify-center gap-3 py-2 md:py-0">
          <div className="bg-brand-bg p-2 rounded-lg">
            <ChartNoAxesCombined className="w-5 h-5 text-brand-accent" />
          </div>
          <div>
            <p className="text-xs text-brand-secondary font-medium">Revenue</p>
            <p className="text-lg md:text-xl font-bold text-brand-primary">
              ₹{totalRevenue.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 py-2 md:py-0">
          <div className="bg-brand-bg p-2 rounded-lg">
            <TrendingUp className="w-5 h-5 text-brand-error" />
          </div>
          <div>
            <p className="text-xs text-brand-secondary font-medium">Pending</p>
            <p className="text-lg md:text-xl font-bold text-brand-error">
              ₹{pendingAmount.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 py-2 md:py-0">
          <div className="bg-brand-bg p-2 rounded-lg">
            <Package className="w-5 h-5 text-brand-accent" />
          </div>
          <div>
            <p className="text-xs text-brand-secondary font-medium">Orders</p>
            <p className="text-lg md:text-xl font-bold text-brand-primary">
              {totalOrders}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 py-2 md:py-0">
          <div className="bg-brand-bg p-2 rounded-lg">
            <Calendar className="w-5 h-5 text-brand-accent" />
          </div>
          <div>
            <p className="text-xs text-brand-secondary font-medium">Today</p>
            <p className="text-lg md:text-xl font-bold text-brand-primary">
              {todayDeliveries}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;

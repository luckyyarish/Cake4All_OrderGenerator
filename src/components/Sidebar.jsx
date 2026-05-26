import { useState } from "react";
import { PlusCircle, Clock, Users, IndianRupee, Menu, X } from "lucide-react";

const Sidebar = ({ currentView, setCurrentView }) => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { id: "create", label: "Create Order", icon: PlusCircle },
    { id: "history", label: "Order History", icon: Clock },
    { id: "customers", label: "Customers", icon: Users },
    { id: "prices", label: "Prices", icon: IndianRupee },
  ];

  const handleNav = (id) => {
    setCurrentView(id);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Top Header */}
      {/* Mobile Top Header */}
      <div className="md:hidden flex justify-between items-center bg-brand-surface p-4 border-b border-brand-border">
        {/* Grouping text in a flex-col so they stack perfectly on the left */}
        <div className="flex flex-col">
          <h1 className="font-bold text-3xl text-brand-primary font-heading2 leading-tight">
            Cake 4 All
          </h1>
          <p className="text-[10px] text-brand-secondary tracking-wider font-body mt-0.5">
            House of Designer Cakes
          </p>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-brand-secondary p-1 hover:text-brand-accent transition-colors"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="md:hidden flex flex-col bg-brand-surface border-b border-brand-border p-2 animate-fadeIn">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`flex items-center gap-3 p-3 rounded-lg font-semibold ${
                currentView === item.id
                  ? "bg-brand-accent text-white"
                  : "text-brand-secondary hover:bg-brand-bg"
              }`}
            >
              <item.icon size={18} /> {item.label}
            </button>
          ))}
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col w-64 bg-brand-surface border-r border-brand-border min-h-screen p-4">
        <div className="mb-8 px-2">
          <h1 className="text-3xl font-bold text-brand-primary font-heading2">
            Cake 4 All
          </h1>
          <p className="text-xs text-brand-secondary tracking-wider mt-1">
            Admin Dashboard
          </p>
        </div>
        <div className="flex flex-col gap-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`flex items-center gap-3 p-3 rounded-lg font-semibold transition-all ${
                currentView === item.id
                  ? "bg-brand-accent text-white shadow-md"
                  : "text-brand-secondary hover:bg-brand-bg hover:text-brand-primary"
              }`}
            >
              <item.icon size={18} /> {item.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default Sidebar;

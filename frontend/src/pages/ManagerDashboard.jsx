import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';

const TRANSACTIONS_KEY = "ims_transactions";

function loadTransactions() {
  try {
    const raw = localStorage.getItem(TRANSACTIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error("Failed to load transactions:", error);
    return [];
  }
}

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [transactions, setTransactions] = useState([]);

  const handleLogout = () => {
    navigate("/");
  };

  // Load transactions when Dashboard opens
  useEffect(() => {
    setTransactions(loadTransactions());

    // Updates when another tab/window changes localStorage
    const handleStorageChange = (event) => {
      if (event.key === TRANSACTIONS_KEY) {
        setTransactions(loadTransactions());
      }
    };

    // Updates immediately when Receive/Dispatch page
    // sends the custom event
    const handleTransactionUpdate = () => {
      setTransactions(loadTransactions());
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener(
      "ims_transactions_updated",
      handleTransactionUpdate
    );

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        "ims_transactions_updated",
        handleTransactionUpdate
      );
    };
  }, []);

  const menuItems = [
    { name: "Dashboard", icon: "🏠", path: "/manager-dashboard" },
    { name: "Inventory List", icon: "📋", path: "/inventory-list" },
    { name: "Reorder Points", icon: "🛒", path: "/reorder-points" },
    { name: "Users", icon: "👥", path: "/users" },
    { name: "Reports", icon: "📄", path: "/reports" }
  ];

  return (
    <div className="min-h-screen flex bg-[#ede9fe]/30 font-sans relative overflow-hidden">

      {/* BACKGROUND DIMMER */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/30 z-20 transition-opacity duration-300"
        />
      )}

      {/* SIDEBAR MENU */}
      <aside
        className={`fixed top-0 bottom-0 left-0 bg-[#8b7fd6] border-r border-[#ddd6fe] w-64 p-4 z-30 shadow-2xl flex flex-col transition-transform duration-300 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between mb-8 px-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0 shadow-sm">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2L21 7V17L12 22L3 17V7L12 2Z"
                  fill="url(#dashBoxGrad)"
                  stroke="#ffffff"
                  strokeWidth="0.5"
                />
                <path
                  d="M12 2L21 7L12 12L3 7L12 2Z"
                  fill="#ffffff"
                  fillOpacity="0.35"
                />
                <path
                  d="M12 12V22"
                  stroke="#ffffff"
                  strokeWidth="0.6"
                  strokeOpacity="0.5"
                />

                <defs>
                  <linearGradient
                    id="dashBoxGrad"
                    x1="3"
                    y1="2"
                    x2="21"
                    y2="22"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#8B7FD6" />
                    <stop offset="1" stopColor="#5B4FBF" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <span className="font-bold text-xl text-[#2e1065] tracking-wide">
              IMS
            </span>
          </div>

          <button
            onClick={() => setIsSidebarOpen(false)}
            className="btn btn-sm btn-ghost btn-circle text-[#2e1065]"
          >
            ✕
          </button>
        </div>

        <nav className="flex flex-col gap-4 flex-1">
          {menuItems.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                navigate(item.path);
                setIsSidebarOpen(false);
              }}
              className={`flex items-center gap-4 text-[#2e1065] font-medium py-2.5 px-4 rounded-xl text-left w-full transition-all duration-150 ${
                item.name === "Dashboard"
                  ? "bg-[#c4b5fd] shadow-xs"
                  : "bg-[#c4b5fd]/40 hover:bg-[#c4b5fd]/80"
              }`}
            >
              <span className="text-lg shrink-0">{item.icon}</span>
              <span className="text-sm font-semibold">{item.name}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* MAIN APPLICATION WORKSPACE */}
      <div className="flex-1 flex flex-col min-w-0 w-full">

        {/* TOP NAVBAR */}
        <div className="navbar bg-[#e9d5ff] border-b border-[#ddd6fe] px-4 sm:px-6 shadow-xs flex justify-between items-center relative z-10">

          <button
            onClick={() => setIsSidebarOpen(true)}
            className="btn btn-ghost btn-square text-[#2e1065] hover:bg-[#c4b5fd]/30"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="inline-block w-5 h-5"
              stroke="#6b5ba8"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          <div className="flex items-center gap-3">
            <div className="avatar">
              <div className="w-8 h-8 rounded-full ring ring-[#c4b5fd] ring-offset-base-100 ring-offset-2">
                <img src="https://daisyui.com" alt="Profile" />
              </div>
            </div>

            <span className="text-xs font-semibold text-[#2e1065]">
              Admin
            </span>

            <button
              onClick={handleLogout}
              className="btn btn-xs btn-outline border-[#c4b5fd] text-[#2e1065] hover:bg-[#ddd6fe] hover:border-[#c4b5fd] rounded-sm px-2"
            >
              Logout
            </button>
          </div>
        </div>

        {/* DASHBOARD CONTENT */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-8 relative z-10 w-full">

          <h1 className="text-xl sm:text-2xl font-bold text-[#2e1065] mb-6">
            Dashboard Summary
          </h1>

          {/* SUMMARY CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-8">

            <div className="bg-[#ede9fe] border border-[#ddd6fe]/70 shadow-xs rounded-xl p-4 flex flex-col items-center justify-center text-center">
              <span className="text-[11px] font-semibold text-[#4c1d95] tracking-wide mb-1">
                Total Products
              </span>
              <div className="text-2xl font-bold text-[#2e1065] bg-[#d8b4fe]/80 w-full py-1 rounded-lg mt-1">
                632
              </div>
            </div>

            <div className="bg-[#ede9fe] border border-[#ddd6fe]/70 shadow-xs rounded-xl p-4 flex flex-col items-center justify-center text-center">
              <span className="text-[11px] font-semibold text-[#4c1d95] tracking-wide mb-1">
                Low Stock Items
              </span>
              <div className="text-2xl font-bold text-[#2e1065] bg-[#d8b4fe]/80 w-full py-1 rounded-lg mt-1">
                199
              </div>
            </div>

            <div className="bg-[#ede9fe] border border-[#ddd6fe]/70 shadow-xs rounded-xl p-4 flex flex-col items-center justify-center text-center">
              <span className="text-[11px] font-semibold text-[#4c1d95] tracking-wide mb-1">
                Reorders Alerts
              </span>
              <div className="text-2xl font-bold text-[#2e1065] bg-[#d8b4fe]/80 w-full py-1 rounded-lg mt-1">
                39
              </div>
            </div>

            <div className="bg-[#ede9fe] border border-[#ddd6fe]/70 shadow-xs rounded-xl p-4 flex flex-col items-center justify-center text-center">
              <span className="text-[11px] font-semibold text-[#4c1d95] tracking-wide mb-1">
                Total Active User
              </span>
              <div className="text-2xl font-bold text-[#2e1065] bg-[#d8b4fe]/80 w-full py-1 rounded-lg mt-1">
                98
              </div>
            </div>

            <div className="bg-[#ede9fe] border border-[#ddd6fe]/70 shadow-xs rounded-xl p-4 flex flex-col items-center justify-center text-center col-span-2 sm:col-span-1">
              <span className="text-[11px] font-semibold text-[#4c1d95] tracking-wide mb-1">
                Today Reports
              </span>
              <div className="text-2xl font-bold text-[#2e1065] bg-[#d8b4fe]/80 w-full py-1 rounded-lg mt-1">
                31
              </div>
            </div>

          </div>

          {/* LOWER CONTENT */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* RECENT TRANSACTIONS */}
            <div className="lg:col-span-7 bg-[#ede9fe] border border-[#ddd6fe]/70 rounded-2xl p-4 sm:p-5 shadow-xs">

              <h2 className="text-sm sm:text-base font-bold text-[#2e1065] mb-4 px-1">
                Recent Transactions
              </h2>

              <div className="overflow-x-auto bg-[#ffffff] rounded-xl shadow-xs border border-[#d8b4fe]/50">

                <table className="table table-sm w-full text-left">

                  <thead>
                    <tr className="text-[#2e1065] border-b border-[#d8b4fe]/50 bg-[#ede9fe]/50">
                      <th className="py-2.5 text-[11px] font-bold">
                        Date & Time
                      </th>

                      <th className="py-2.5 text-[11px] font-bold">
                        Type
                      </th>

                      <th className="py-2.5 text-[11px] font-bold">
                        Product ID
                      </th>

                      <th className="py-2.5 text-[11px] font-bold">
                        Product Name
                      </th>

                      <th className="py-2.5 text-[11px] font-bold text-center">
                        Quantity
                      </th>

                      <th className="py-2.5 text-[11px] font-bold text-right">
                        Details
                      </th>
                    </tr>
                  </thead>

                  <tbody className="text-xs text-[#4c1d95]">

                    {transactions.length > 0 ? (

                      transactions.slice(0, 10).map((t, index) => {

                        // Supports the Receive/Dispatch transaction format
                        const type =
                          t.type === "Received"
                            ? "Receive"
                            : t.type === "Dispatched"
                            ? "Dispatch"
                            : t.type || "Transaction";

                        const productName =
                          t.productName ||
                          t.name ||
                          "Unknown Product";

                        const quantity = Number(t.quantity ?? t.qty ?? 0);

                        const date =
                          t.date ||
                          t.dateTime ||
                          new Date().toLocaleString();

                        const productId =
                          t.productId ||
                          t.id ||
                          "N/A";

                        const details =
                          t.details ||
                          t.supplier ||
                          t.customer ||
                          t.department ||
                          t.amount ||
                          "—";

                        return (
                          <tr
                            key={t.id || index}
                            className="border-b border-[#d8b4fe]/30 hover:bg-[#ede9fe]/30"
                          >

                            <td className="py-3 font-medium">
                              {date}
                            </td>

                            <td
                              className={`py-3 font-semibold ${
                                type === "Receive"
                                  ? "text-emerald-600"
                                  : "text-amber-500"
                              }`}
                            >
                              {type}
                            </td>

                            <td className="py-3 text-[#4c1d95]/80 font-mono">
                              {productId}
                            </td>

                            <td className="py-3 font-medium">
                              {productName}
                            </td>

                            <td
                              className={`py-3 text-center font-semibold ${
                                type === "Receive"
                                  ? "text-emerald-600"
                                  : "text-rose-500"
                              }`}
                            >
                              {type === "Receive"
                                ? `+${quantity}`
                                : `-${quantity}`}
                            </td>

                            <td className="py-3 text-right font-semibold text-[#2e1065]">
                              {details}
                            </td>

                          </tr>
                        );
                      })

                    ) : (

                      <tr>
                        <td
                          colSpan={6}
                          className="py-8 text-center text-[#2e1065]/60 text-sm font-medium"
                        >
                          No transactions yet.
                        </td>
                      </tr>

                    )}

                  </tbody>

                </table>

              </div>
            </div>

            {/* TOP CATEGORIES */}
            <div className="lg:col-span-5 bg-[#ede9fe] border border-[#ddd6fe]/70 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col">

              <h2 className="text-sm sm:text-base font-bold text-[#2e1065] mb-4">
                Top Categories
              </h2>

              <div className="bg-[#ffffff] rounded-xl p-6 flex flex-1 items-center justify-around border border-[#d8b4fe]/50 shadow-xs gap-4">

                <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center shrink-0">

                  <svg
                    className="w-full h-full transform -rotate-90"
                    viewBox="0 0 36 36"
                  >
                    <circle
                      cx="18"
                      cy="18"
                      r="15.91"
                      fill="none"
                      stroke="url(#dashGradient)"
                      strokeWidth="4.2"
                      strokeDasharray="40 100"
                      strokeDashoffset="0"
                    />

                    <circle
                      cx="18"
                      cy="18"
                      r="15.91"
                      fill="none"
                      stroke="#8b5cf6"
                      strokeWidth="4.2"
                      strokeDasharray="35 100"
                      strokeDashoffset="-40"
                    />

                    <circle
                      cx="18"
                      cy="18"
                      r="15.91"
                      fill="none"
                      stroke="#d8b4fe"
                      strokeWidth="4.2"
                      strokeDasharray="25 100"
                      strokeDashoffset="-75"
                    />

                    <circle
                      cx="18"
                      cy="18"
                      r="11.5"
                      fill="#ffffff"
                    />

                    <defs>
                      <linearGradient
                        id="dashGradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                      >
                        <stop
                          offset="0%"
                          stopColor="#8B7FD6"
                        />
                        <stop
                          offset="100%"
                          stopColor="#5B4FBF"
                        />
                      </linearGradient>
                    </defs>

                  </svg>

                </div>

                <div className="flex flex-col gap-3 text-xs font-semibold text-[#2e1065]">

                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-[#8B7FD6] shrink-0" />
                    <span>Category A</span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-[#8b5cf6] shrink-0" />
                    <span>Category B</span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-[#d8b4fe] shrink-0" />
                    <span>Category C</span>
                  </div>

                </div>

              </div>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router';

const PRODUCTS_KEY = "ims_products";
const TRANSACTIONS_KEY = "ims_transactions";

function loadProducts() {
  const raw = localStorage.getItem(PRODUCTS_KEY);
  return raw ? JSON.parse(raw) : [];
}
function loadTransactions() {
  const raw = localStorage.getItem(TRANSACTIONS_KEY);
  return raw ? JSON.parse(raw) : [];
}

function enrichTransaction(tx, products) {
  const product = products.find((p) => p.name === tx.productName);
  const price = product && product.price ? Number(product.price) : 0;
  const amount = price * (Number(tx.quantity) || 0);
  return {
    ...tx,
    user: tx.user || "Admin",
    productId: tx.productId || product?.id || "N/A",
    amount,
    typeLabel: tx.type === "Received" ? "Receive" : "Dispatch",
  };
}

function formatCurrency(amount) {
  return `₱${Number(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function ManagerSearchReport() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const products = loadProducts();
    const raw = loadTransactions();
    setTransactions(raw.map((tx) => enrichTransaction(tx, products)));
  }, []);

  const filteredTransactions = useMemo(() => {
    if (!searchTerm.trim()) return transactions;
    return transactions.filter((tx) =>
      tx.productName.toLowerCase().includes(searchTerm.trim().toLowerCase())
    );
  }, [transactions, searchTerm]);

  const handleLogout = () => navigate("/");

  const menuItems = [
    { name: "Dashboard", icon: "🏠", path: "/manager-dashboard" },
    { name: "Inventory List", icon: "📋", path: "/inventory-list" },
    { name: "Reorder Points", icon: "🛒", path: "/reorder-points" },
    { name: "Users", icon: "👥", path: "/users" },
    { name: "Reports", icon: "📄", path: "/reports" }
  ];

  return (
    <div className="min-h-screen flex bg-[#ede9fe]/30 font-sans relative overflow-hidden">

      {isSidebarOpen && (
        <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/30 z-20 transition-opacity duration-300" />
      )}

      <aside className={`fixed top-0 bottom-0 left-0 bg-[#8b7fd6] border-r border-[#ddd6fe] w-64 p-4 z-30 shadow-2xl flex flex-col transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between mb-8 px-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0 shadow-sm">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://w3.org">
                <path d="M12 2L21 7V17L12 22L3 17V7L12 2Z" fill="url(#invBoxGrad)" stroke="#ffffff" strokeWidth="0.5" />
                <path d="M12 2L21 7L12 12L3 7L12 2Z" fill="#ffffff" fillOpacity="0.35" />
                <path d="M12 12V22" stroke="#ffffff" strokeWidth="0.6" strokeOpacity="0.5" />
                <defs>
                  <linearGradient id="invBoxGrad" x1="3" y1="2" x2="21" y2="22" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#8B7FD6" />
                    <stop offset="1" stopColor="#5B4FBF" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <span className="font-bold text-xl text-[#2e1065] tracking-wide">IMS</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="btn btn-sm btn-ghost btn-circle text-[#2e1065]">✕</button>
        </div>

        <nav className="flex flex-col gap-4 flex-1">
          {menuItems.map((item, idx) => (
            <button
              key={idx}
              onClick={() => { navigate(item.path); setIsSidebarOpen(false); }}
              className={`flex items-center gap-4 text-[#2e1065] font-medium py-2.5 px-4 rounded-xl text-left w-full transition-all duration-150 ${
                item.name === "Reports" ? 'bg-[#c4b5fd] shadow-xs' : 'bg-[#c4b5fd]/40 hover:bg-[#c4b5fd]/80'
              }`}
            >
              <span className="text-lg shrink-0">{item.icon}</span>
              <span className="text-sm font-semibold">{item.name}</span>
            </button>
          ))}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 w-full">

        <div className="navbar bg-[#e9d5ff] border-b border-[#ddd6fe] px-4 sm:px-6 shadow-xs flex justify-between items-center relative z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className="btn btn-ghost btn-square text-[#2e1065] hover:bg-[#c4b5fd]/30">
              <svg xmlns="http://w3.org" fill="none" viewBox="0 0 24 24" className="inline-block w-5 h-5" stroke="#6b5ba8" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
            <span className="text-sm font-semibold text-[#2e1065]">Search Report</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="avatar">
              <div className="w-8 h-8 rounded-full ring ring-[#c4b5fd] ring-offset-base-100 ring-offset-2">
                <img src="https://daisyui.com" alt="Profile" />
              </div>
            </div>
            <span className="text-xs font-semibold text-[#2e1065]">Admin</span>
            <button onClick={handleLogout} className="btn btn-xs btn-outline border-[#c4b5fd] text-[#2e1065] hover:bg-[#ddd6fe] hover:border-[#c4b5fd] rounded-sm px-2">Logout</button>
          </div>
        </div>

        <main className="max-w-6xl mx-auto px-4 sm:px-6 mt-8 relative z-10 w-full pb-12 flex-1 flex flex-col">

          <button
            onClick={() => navigate("/reports")}
            className="flex items-center gap-1.5 text-sm font-semibold text-[#2e1065] hover:text-[#6b5ba8] mb-4 w-fit"
          >
            ← Back to Reports
          </button>

          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-[#2e1065]">Search Report</h1>
          </div>

          <div className="relative max-w-sm w-full mb-6">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search product..."
              className="input input-sm w-full bg-[#c4b5fd]/30 border border-[#8b7fd6]/50 rounded-lg pl-3 pr-8 text-xs font-medium text-[#2e1065] placeholder-[#2e1065]/60 focus:outline-none focus:border-[#8b7fd6]"
            />
            {searchTerm ? (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#2e1065]/70 hover:text-[#2e1065]"
                aria-label="Clear search"
              >
                ✕
              </button>
            ) : (
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#2e1065]/70 pointer-events-none">🔍</span>
            )}
          </div>

          <div className="bg-[#ede9fe]/40 border border-[#ddd6fe]/70 rounded-2xl p-4 sm:p-5 shadow-xs flex-1">
            <div className="overflow-x-auto bg-white rounded-xl shadow-xs border border-[#d8b4fe]/50">
              <table className="table table-md w-full text-left">
                <thead>
                  <tr className="text-[#2e1065] text-sm font-bold border-b border-[#d8b4fe]/50 bg-[#ede9fe]/30">
                    <th className="py-4 pl-6">Product</th>
                    <th className="py-4">User</th>
                    <th className="py-4">Transaction Type</th>
                    <th className="py-4">Product ID</th>
                    <th className="py-4">Date</th>
                    <th className="py-4">Quantity</th>
                    <th className="py-4 pr-6">Amount</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-medium text-[#2e1065]">
                  {filteredTransactions.length > 0 ? (
                    filteredTransactions.map((tx) => (
                      <tr key={tx.id} className="border-b border-[#d8b4fe]/30 hover:bg-[#ede9fe]/20 transition-colors">
                        <td className="py-4 pl-6">{tx.productName}</td>
                        <td className="py-4">{tx.user}</td>
                        <td className="py-4">
                          <span className={`font-semibold ${tx.typeLabel === "Receive" ? "text-emerald-600" : "text-rose-500"}`}>
                            {tx.typeLabel}
                          </span>
                        </td>
                        <td className="py-4 text-[#4c1d95]/80 font-mono">{tx.productId}</td>
                        <td className="py-4 text-[#4c1d95]/80">{tx.date}</td>
                        <td className="py-4 text-[#4c1d95]/90">{tx.quantity}</td>
                        <td className="py-4 pr-6 font-semibold">{formatCurrency(tx.amount)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-[#2e1065]/60 text-sm font-medium">
                        No matching transactions found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
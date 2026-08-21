import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';

const PRODUCTS_KEY = "ims_products";
const TRANSACTIONS_KEY = "ims_transactions";

function loadProducts() {
  const raw = localStorage.getItem(PRODUCTS_KEY);
  return raw ? JSON.parse(raw) : [];
}
function saveProducts(products) {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
}
function addTransaction(tx) {
  const raw = localStorage.getItem(TRANSACTIONS_KEY);
  const transactions = raw ? JSON.parse(raw) : [];
  const updated = [{ id: Date.now().toString(), ...tx }, ...transactions];
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(updated));
}

const DEPARTMENTS = ["Supplier A", "Supplier B", "Supplier C"];

export default function ManagerDispatchProduct() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [product, setProduct] = useState(null);
  const [department, setDepartment] = useState("");
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [confirmation, setConfirmation] = useState(null);

  useEffect(() => {
    const products = loadProducts();
    const found = products.find((p) => String(p.id) === String(id));
    setProduct(found || null);
  }, [id]);

  const handleLogout = () => navigate("/");

  const menuItems = [
    { name: "Dashboard", icon: "🏠", path: "/manager-dashboard" },
    { name: "Inventory List", icon: "📋", path: "/inventory-list" },
    { name: "Reorder Points", icon: "🛒", path: "/reorder-points" },
    { name: "Users", icon: "👥", path: "/users" },
    { name: "Reports", icon: "📄", path: "/reports" }
  ];

  const currentStock = Number(product?.stock) || 0;

  const handleDispatch = () => {
    setErrorMsg("");

    if (!department) {
      setErrorMsg("⚠ Please select a customer or department.");
      return;
    }

    const qty = Number(quantity);
    if (quantity.trim() === "" || isNaN(qty) || !Number.isFinite(qty)) {
      setErrorMsg("⚠ Please enter a valid quantity.");
      return;
    }
    if (qty <= 0) {
      setErrorMsg("⚠ Quantity must be greater than zero.");
      return;
    }
    if (!Number.isInteger(qty)) {
      setErrorMsg("⚠ Quantity must be a whole number.");
      return;
    }
    if (qty > currentStock) {
      setErrorMsg("⚠ Insufficient stock. Please enter a quantity within the available stock.");
      return;
    }

    const products = loadProducts();
    const updatedStock = currentStock - qty;

    const updatedProducts = products.map((p) =>
      String(p.id) === String(id) ? { ...p, stock: updatedStock } : p
    );
    saveProducts(updatedProducts);
    setProduct((prev) => ({ ...prev, stock: updatedStock }));

    addTransaction({
      type: "Dispatched",
      productName: product.name,
      quantity: qty,
      details: department,
      date: new Date().toLocaleString(),
    });

    setConfirmation({
      product: product.name,
      quantity: qty,
      department,
      remainingStock: updatedStock,
    });
  };

  const handleCloseConfirmation = () => {
    navigate("/inventory-list");
  };

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#ede9fe]/30">
        <p className="text-[#2e1065] font-medium">Product not found.</p>
      </div>
    );
  }

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
                item.name === "Inventory List" ? 'bg-[#c4b5fd] shadow-xs' : 'bg-[#c4b5fd]/40 hover:bg-[#c4b5fd]/80'
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
            <span className="text-sm font-semibold text-[#2e1065]">Dispatch Product</span>
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

        <main className="max-w-3xl mx-auto px-4 sm:px-6 mt-8 relative z-10 w-full pb-12 flex-1 flex flex-col">

          <div className="bg-[#ede9fe]/40 border border-[#ddd6fe]/70 rounded-2xl p-5 sm:p-6 shadow-xs flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-5">

              <div className="sm:col-span-2 bg-[#c4b5fd]/40 border border-[#8b7fd6]/40 rounded-xl p-3 flex flex-col justify-center">
                <label className="block text-sm font-bold text-[#2e1065] mb-2">Product</label>
                <input
                  type="text"
                  value={product.name}
                  readOnly
                  className="input input-sm w-full bg-white/70 border border-[#8b7fd6]/40 rounded-lg text-xs font-medium text-[#2e1065] cursor-not-allowed"
                />
              </div>

              <div className="bg-white border border-[#8b7fd6]/30 rounded-xl p-4 flex items-center gap-3 shadow-xs">
                <div className="w-10 h-10 rounded-full bg-[#ede9fe] flex items-center justify-center shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://w3.org">
                    <path d="M12 2L21 7V17L12 22L3 17V7L12 2Z" stroke="#8b7fd6" strokeWidth="1.5" />
                    <path d="M12 2L21 7L12 12L3 7L12 2Z" fill="#c4b5fd" fillOpacity="0.6" />
                  </svg>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-[#2e1065]/60">Current Stock</p>
                  <p className="text-lg font-bold text-[#2e1065]">{currentStock}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-5">
              <div className="bg-[#c4b5fd]/40 border border-[#8b7fd6]/40 rounded-xl p-3">
                <label className="block text-sm font-bold text-[#2e1065] mb-2">Customer / Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="select select-sm w-full bg-white border border-[#8b7fd6]/40 rounded-lg text-xs font-medium text-[#2e1065] focus:outline-none focus:border-[#8b7fd6]"
                >
                  <option value="">Select customer or department</option>
                  {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div className="bg-[#c4b5fd]/40 border border-[#8b7fd6]/40 rounded-xl p-3">
                <label className="block text-sm font-bold text-[#2e1065] mb-2">Quantity</label>
                <input
                  type="number"
                  min="1"
                  max={currentStock}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="Enter Quantity"
                  className="input input-sm w-full bg-white border border-[#8b7fd6]/40 rounded-lg text-xs font-medium text-[#2e1065] placeholder-[#2e1065]/40 focus:outline-none focus:border-[#8b7fd6]"
                />
              </div>

              <div className="bg-[#c4b5fd]/40 border border-[#8b7fd6]/40 rounded-xl p-3">
                <label className="block text-sm font-bold text-[#2e1065] mb-2">Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter notes"
                  className="input input-sm w-full bg-white border border-[#8b7fd6]/40 rounded-lg text-xs font-medium text-[#2e1065] placeholder-[#2e1065]/40 focus:outline-none focus:border-[#8b7fd6]"
                />
              </div>

              {errorMsg && (
                <p className="text-xs font-semibold text-rose-600">{errorMsg}</p>
              )}

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => navigate("/inventory-list")}
                  className="btn btn-sm bg-white hover:bg-gray-50 border border-gray-300 text-[#2e1065] font-medium px-6 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDispatch}
                  className="btn btn-sm bg-emerald-600 hover:bg-emerald-700 border-0 text-white font-medium px-8 rounded-lg"
                >
                  Dispatch
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Confirmation Modal */}
      {confirmation && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-emerald-600 text-xl">✓</span>
              <h2 className="text-lg font-bold text-[#2e1065]">Product dispatched successfully!</h2>
            </div>

            <div className="space-y-1.5 text-sm text-[#2e1065]/90 mb-5">
              <p><span className="font-semibold">Product:</span> {confirmation.product}</p>
              <p><span className="font-semibold">Quantity Dispatched:</span> {confirmation.quantity}</p>
              <p><span className="font-semibold">Customer/Department:</span> {confirmation.department}</p>
              <p><span className="font-semibold">Remaining Stock:</span> {confirmation.remainingStock}</p>
            </div>

            <button
              onClick={handleCloseConfirmation}
              className="btn btn-sm w-full bg-emerald-600 hover:bg-emerald-700 border-0 text-white font-medium rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
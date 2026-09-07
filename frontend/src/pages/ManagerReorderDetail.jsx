import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';

const STORAGE_KEY = "ims_products";

function ensureRopFields(p) {
  const safetyStock = p.safetyStock ?? 10;
  const leadTimeDemand = p.leadTimeDemand ?? Math.max(0, (Number(p.reorderPoint) || 20) - safetyStock);
  const reorderPoint = leadTimeDemand + safetyStock;
  return {
    ...p,
    safetyStock,
    leadTimeDemand,
    reorderPoint,
    supplier: p.supplier || "N/A",
    lastReorderDate: p.lastReorderDate || "N/A",
  };
}

function loadProducts() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function getRopStatus(stock, rop) {
  const s = Number(stock) || 0;
  const r = Number(rop) || 1;
  if (s <= r) return "Low";
  if (s <= r * 1.5) return "Medium";
  return "High";
}

export default function ManagerReorderDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [product, setProduct] = useState(null);

  useEffect(() => {
    const products = loadProducts();
    const found = products.find((p) => String(p.id) === String(id));
    setProduct(found ? ensureRopFields(found) : null);
  }, [id]);

  const handleLogout = () => navigate("/");

  const menuItems = [
    { name: "Dashboard", icon: "🏠", path: "/manager-dashboard" },
    { name: "Inventory List", icon: "📋", path: "/inventory-list" },
    { name: "Reorder Points", icon: "🛒", path: "/reorder-points" },
    { name: "Users", icon: "👥", path: "/users" },
    { name: "Reports", icon: "📄", path: "/reports" }
  ];

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#ede9fe]/30">
        <p className="text-[#2e1065] font-medium">Product not found.</p>
      </div>
    );
  }

  const status = getRopStatus(product.stock, product.reorderPoint);
  const statusBadgeClass =
    status === "Low" ? "bg-rose-500 text-white" :
    status === "Medium" ? "bg-amber-400 text-white" :
    "bg-emerald-500 text-white";

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
                item.name === "Reorder Points" ? 'bg-[#c4b5fd] shadow-xs' : 'bg-[#c4b5fd]/40 hover:bg-[#c4b5fd]/80'
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
          <button onClick={() => setIsSidebarOpen(true)} className="btn btn-ghost btn-square text-[#2e1065] hover:bg-[#c4b5fd]/30">
            <svg xmlns="http://w3.org" fill="none" viewBox="0 0 24 24" className="inline-block w-5 h-5" stroke="#6b5ba8" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>

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

        <main className="max-w-2xl mx-auto px-4 sm:px-6 mt-8 relative z-10 w-full pb-12 flex-1 flex flex-col">

          <button
            onClick={() => navigate("/reorder-points")}
            className="flex items-center gap-1.5 text-sm font-semibold text-[#2e1065] hover:text-[#6b5ba8] mb-4 w-fit"
          >
            ← Back to ROP management
          </button>

          <div className="bg-[#c4b5fd]/40 border border-[#8b7fd6]/40 rounded-2xl p-5 sm:p-6 flex flex-col gap-5">

            <div className="flex flex-col items-center gap-2">
              <div className="w-28 h-28 rounded-xl bg-white border border-[#d8b4fe]/60 flex items-center justify-center overflow-hidden">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-full h-full object-contain" />
                ) : (
                  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://w3.org">
                    <circle cx="8" cy="8" r="1.7" stroke="#8b7fd6" strokeWidth="1.5" />
                    <path d="M3 17L8.5 11.5C9.3 10.7 10.5 10.7 11.3 11.5L17 17" stroke="#8b7fd6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M13 15L15.5 12.5C16.3 11.7 17.5 11.7 18.3 12.5L21 15" stroke="#8b7fd6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-[#2e1065]">{product.name}</p>
                <p className="text-xs text-[#2e1065]/60">{product.category || "—"}</p>
              </div>
            </div>

            <div className="bg-[#8b7fd6] text-white font-bold text-sm text-center rounded-lg py-2.5">
              {product.name}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-3 border border-[#d8b4fe]/50">
                <p className="text-[11px] font-bold text-[#2e1065]/60 uppercase tracking-wide mb-1">Current Stock</p>
                <p className="text-lg font-bold text-[#2e1065]">{product.stock}</p>
              </div>
              <div className="bg-white rounded-xl p-3 border border-[#d8b4fe]/50">
                <p className="text-[11px] font-bold text-[#2e1065]/60 uppercase tracking-wide mb-1">ROP Level</p>
                <p className="text-lg font-bold text-[#2e1065]">{product.reorderPoint}</p>
              </div>
              <div className="bg-white rounded-xl p-3 border border-[#d8b4fe]/50">
                <p className="text-[11px] font-bold text-[#2e1065]/60 uppercase tracking-wide mb-1">Safety Stock</p>
                <p className="text-lg font-bold text-[#2e1065]">{product.safetyStock}</p>
              </div>
              <div className="bg-white rounded-xl p-3 border border-[#d8b4fe]/50">
                <p className="text-[11px] font-bold text-[#2e1065]/60 uppercase tracking-wide mb-1">Status</p>
                <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${statusBadgeClass}`}>
                  {status}
                </span>
              </div>
              <div className="bg-white rounded-xl p-3 border border-[#d8b4fe]/50">
                <p className="text-[11px] font-bold text-[#2e1065]/60 uppercase tracking-wide mb-1">Last Reorder Date</p>
                <p className="text-sm font-bold text-[#2e1065]">{product.lastReorderDate}</p>
              </div>
              <div className="bg-white rounded-xl p-3 border border-[#d8b4fe]/50">
                <p className="text-[11px] font-bold text-[#2e1065]/60 uppercase tracking-wide mb-1">Supplier</p>
                <p className="text-sm font-bold text-[#2e1065]">{product.supplier}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 mt-2">
              <button
                onClick={() => navigate(`/product-details/${product.id}`)}
                className="btn btn-sm bg-white hover:bg-gray-50 border border-gray-300 text-[#2e1065] font-medium px-5 rounded-lg"
              >
                View Product Details
              </button>
              <button
                onClick={() => navigate(`/reorder-points/${product.id}/edit-safety-stock`)}
                className="btn btn-sm bg-[#8b7fd6] hover:bg-[#8b7fd6]/90 border-0 text-white font-medium px-5 rounded-lg"
              >
                Edit Safety Stock
              </button>
              <button
                onClick={() => navigate("/reorder-points")}
                className="btn btn-sm bg-white hover:bg-gray-50 border border-gray-300 text-[#2e1065] font-medium px-5 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
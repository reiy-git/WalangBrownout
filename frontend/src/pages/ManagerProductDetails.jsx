import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';

export default function ManagerProductDetails() {
  const navigate = useNavigate();
  const { name } = useParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [product, setProduct] = useState(null);

  const baseProducts = [
    { name: "Air Condition", category: "Appliances", stock: 67, status: "In stock" },
    { name: "Air Purifiers", category: "Appliances", stock: 50, status: "In stock" },
    { name: "Air Filters", category: "Accessories", stock: 30, status: "In stock" },
    { name: "Air Condition Split Type", category: "Appliances", stock: 12, status: "Low Stock" },
    { name: "Air Condition (Premium)", category: "Appliances", stock: 0, status: "Out Of Stock" }
  ];

  useEffect(() => {
    const customProducts = JSON.parse(localStorage.getItem("customProducts") || "[]");
    const allProducts = [...baseProducts, ...customProducts];
    const decodedName = decodeURIComponent(name);
    const found = allProducts.find((p) => p.name === decodedName);
    setProduct(found || null);
  }, [name]);

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
        <div className="text-center">
          <p className="text-[#2e1065] font-medium mb-4">Product not found.</p>
          <button
            onClick={() => navigate("/inventory-list")}
            className="btn btn-sm bg-[#8b7fd6] hover:bg-[#8b7fd6]/90 border-0 text-white font-medium px-6 rounded-lg"
          >
            Back to Inventory List
          </button>
        </div>
      </div>
    );
  }

  const statusColor =
    product.status === 'In stock' ? 'bg-emerald-100 text-emerald-700' :
    product.status === 'Low Stock' ? 'bg-amber-100 text-amber-700' :
    'bg-rose-100 text-rose-700';

  return (
    <div className="min-h-screen flex bg-[#ede9fe]/30 font-sans relative overflow-hidden">

      {/* BACKGROUND DIMMER */}
      {isSidebarOpen && (
        <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/30 z-20 transition-opacity duration-300" />
      )}

      {/* SIDEBAR MENU */}
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

      {/* MAIN APPLICATION WORKSPACE AREA */}
      <div className="flex-1 flex flex-col min-w-0 w-full">

        {/* Top Navbar */}
        <div className="navbar bg-[#e9d5ff] border-b border-[#ddd6fe] px-4 sm:px-6 shadow-xs flex justify-between items-center relative z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className="btn btn-ghost btn-square text-[#2e1065] hover:bg-[#c4b5fd]/30">
              <svg xmlns="http://w3.org" fill="none" viewBox="0 0 24 24" className="inline-block w-5 h-5" stroke="#6b5ba8" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
            <span className="text-sm font-semibold text-[#2e1065]">Product Details</span>
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

        {/* WORKSPACE WRAPPER */}
        <main className="max-w-5xl mx-auto px-4 sm:px-6 mt-8 relative z-10 w-full pb-12 flex-1 flex flex-col">

          {/* Top Row: Image + Name/Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div className="bg-[#c4b5fd]/40 border border-[#8b7fd6]/40 rounded-2xl p-4 flex items-center justify-center h-56 overflow-hidden">
              {product.image ? (
                <img src={product.image} alt={product.name} className="max-h-full max-w-full object-contain" />
              ) : (
                <span className="text-[#2e1065]/50 text-sm font-medium">No image uploaded</span>
              )}
            </div>

            <div className="bg-[#c4b5fd]/40 border border-[#8b7fd6]/40 rounded-2xl p-5 flex flex-col justify-center gap-3">
              <h1 className="text-xl font-bold text-[#2e1065]">{product.name}</h1>
              <span className={`inline-block w-fit px-3 py-1 rounded-full text-xs font-semibold ${statusColor}`}>
                {product.status}
              </span>
            </div>
          </div>

          {/* Details Card */}
          <div className="bg-[#c4b5fd]/40 border border-[#8b7fd6]/40 rounded-2xl p-5 sm:p-6 flex-1">
            <div className="bg-white rounded-xl p-5 sm:p-6 space-y-3">
              <DetailRow label="Category" value={product.category || "—"} />
              <DetailRow label="Stock" value={`${product.stock} pcs`} />
              <DetailRow label="Reorder Point" value={product.reorderPoint ? `${product.reorderPoint} pcs` : "—"} />
              <DetailRow label="Price" value={product.price ? `₱${Number(product.price).toLocaleString()}` : "—"} />
              <DetailRow label="Date" value={product.dateAdded || "—"} />

              <div className="pt-3">
                <p className="text-sm font-bold text-[#2e1065] mb-1">Description</p>
                <p className="text-sm text-[#2e1065]/80 whitespace-pre-line">
                  {product.description || "No description provided."}
                </p>
              </div>
            </div>

            {/* Back button only, replacing Cancel/Save */}
            <div className="flex justify-end mt-5">
              <button
                onClick={() => navigate("/inventory-list")}
                className="btn btn-sm bg-white hover:bg-gray-50 border border-gray-300 text-[#2e1065] font-medium px-8 rounded-lg"
              >
                ← Back
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between items-center border-b border-gray-100 pb-2">
      <span className="text-sm font-bold text-[#2e1065]">{label}</span>
      <span className="text-sm text-[#2e1065]/80">{value}</span>
    </div>
  );
}
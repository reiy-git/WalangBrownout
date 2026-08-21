import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';

const STORAGE_KEY = "ims_products";

function computeStatus(stock, reorderPoint) {
  const s = Number(stock) || 0;
  const r = Number(reorderPoint) || 0;
  if (s <= 0) return "Out Of Stock";
  if (s <= r) return "Low Stock";
  return "In stock";
}

function loadProducts() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try { return JSON.parse(raw); } catch { /* reseed */ }
  }
  
  const legacyCustom = JSON.parse(localStorage.getItem("customProducts") || "[]");
  const baseProducts = [
    { name: "Air Condition", category: "Appliances", stock: 67, reorderPoint: 20, price: "", description: "", image: null },
    { name: "Air Purifiers", category: "Appliances", stock: 50, reorderPoint: 15, price: "", description: "", image: null },
    { name: "Air Filters", category: "Accessories", stock: 30, reorderPoint: 10, price: "", description: "", image: null },
    { name: "Air Condition Split Type", category: "Appliances", stock: 12, reorderPoint: 15, price: "26500", description: "1.5HP Split Type Air Conditioner\nEnergy efficient cooling for homes and offices.", image: null },
    { name: "Air Condition (Premium)", category: "Appliances", stock: 0, reorderPoint: 10, price: "", description: "", image: null }
  ];
  const merged = [...baseProducts, ...legacyCustom].map((p, idx) => ({
    id: p.id || `p${idx + 1}`,
    name: p.name,
    category: p.category || "",
    stock: Number(p.stock) || 0,
    reorderPoint: Number(p.reorderPoint) || 0,
    price: p.price || "",
    description: p.description || "",
    image: p.image || null,
  }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  return merged;
}

function saveProducts(products) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}
// ------------------------------------------------------

export default function ManagerInventoryList() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef(null);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [rawProducts, setRawProducts] = useState([]);

  // Receive/Dispatch modal state
  const [activeProduct, setActiveProduct] = useState(null);
  const [quantityInput, setQuantityInput] = useState("");

  const refresh = () => setRawProducts(loadProducts());

  useEffect(() => {
    refresh();
  }, []);

  const products = useMemo(
    () => rawProducts.map((p) => ({ ...p, status: computeStatus(p.stock, p.reorderPoint) })),
    [rawProducts]
  );

  const categoryOptions = useMemo(
    () => ["All", ...new Set(products.map((p) => p.category).filter(Boolean))],
    [products]
  );
  const statusOptions = useMemo(
    () => ["All", ...new Set(products.map((p) => p.status))],
    [products]
  );

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.trim().toLowerCase());
      const matchesCategory = categoryFilter === "All" || p.category === categoryFilter;
      const matchesStatus = statusFilter === "All" || p.status === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, searchTerm, categoryFilter, statusFilter]);

  const activeFilterCount = (categoryFilter !== "All" ? 1 : 0) + (statusFilter !== "All" ? 1 : 0);
  const clearFilters = () => { setCategoryFilter("All"); setStatusFilter("All"); };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) setIsFilterOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => navigate("/");

  const menuItems = [
    { name: "Dashboard", icon: "🏠", path: "/manager-dashboard" },
    { name: "Inventory List", icon: "📋", path: "/inventory-list" },
    { name: "Reorder Points", icon: "🛒", path: "/reorder-points" },
    { name: "Users", icon: "👥", path: "/users" },
    { name: "Reports", icon: "📄", path: "/reports" }
  ];

  const openReceiveDispatch = (product) => {
    setActiveProduct(product);
    setQuantityInput("");
  };
  const closeModal = () => { setActiveProduct(null); setQuantityInput(""); };

  const applyStockChange = (direction) => {
    const qty = Number(quantityInput);
    if (!qty || qty <= 0) return;
    const currentStock = Number(activeProduct.stock) || 0;
    const newStock = direction === "receive" ? currentStock + qty : Math.max(0, currentStock - qty);

    const updated = rawProducts.map((p) =>
      p.id === activeProduct.id ? { ...p, stock: newStock } : p
    );
    saveProducts(updated);
    setRawProducts(updated);
    closeModal();
  };

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

        <main className="max-w-7xl mx-auto px-4 sm:px-6 mt-8 relative z-10 w-full pb-12 flex-1 flex flex-col">

          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-[#2e1065]">Inventory List</h1>
            <button
              onClick={() => navigate("/manager-inventory-add-product")}
              className="btn btn-sm bg-[#8b7fd6] hover:bg-[#8b7fd6]/90 border-0 text-white font-medium gap-1 px-3.5 rounded-lg shadow-sm text-xs"
            >
              ✦ Add New Product
            </button>
          </div>

          <div className="flex gap-4 items-center mb-6 relative">
            <div className="relative max-w-xs w-full">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search Product..."
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

            <div className="relative" ref={filterRef}>
              <button
                onClick={() => setIsFilterOpen((prev) => !prev)}
                className="btn btn-sm bg-[#c4b5fd]/40 hover:bg-[#c4b5fd]/60 border border-[#8b7fd6]/40 text-[#2e1065] gap-1 px-3.5 rounded-lg text-xs font-medium"
              >
                <span>⏳</span> Filters
                {activeFilterCount > 0 && (
                  <span className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#8b7fd6] text-white text-[10px] font-bold">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {isFilterOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-[#d8b4fe]/60 rounded-xl shadow-lg p-4 z-40">
                  <div className="mb-3">
                    <label className="block text-[11px] font-bold text-[#2e1065] mb-1.5 uppercase tracking-wide">Category</label>
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="select select-sm w-full bg-[#ede9fe]/50 border border-[#8b7fd6]/40 rounded-lg text-xs font-medium text-[#2e1065] focus:outline-none focus:border-[#8b7fd6]"
                    >
                      {categoryOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="block text-[11px] font-bold text-[#2e1065] mb-1.5 uppercase tracking-wide">Status</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="select select-sm w-full bg-[#ede9fe]/50 border border-[#8b7fd6]/40 rounded-lg text-xs font-medium text-[#2e1065] focus:outline-none focus:border-[#8b7fd6]"
                    >
                      {statusOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>

                  <div className="flex justify-between items-center">
                    <button onClick={clearFilters} className="text-[11px] font-semibold text-[#8b7fd6] hover:text-[#6b5ba8]">
                      Clear Filters
                    </button>
                    <button
                      onClick={() => setIsFilterOpen(false)}
                      className="btn btn-xs bg-[#8b7fd6] hover:bg-[#8b7fd6]/90 border-0 text-white font-medium px-4 rounded-md"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-[#ede9fe]/40 border border-[#ddd6fe]/70 rounded-2xl p-4 sm:p-5 shadow-xs flex-1 flex flex-col justify-between">
            <div className="overflow-x-auto bg-[#ffffff] rounded-xl shadow-xs border border-[#d8b4fe]/50">
              <table className="table table-md w-full text-left">
                <thead>
                  <tr className="text-[#2e1065] text-sm font-bold border-b border-[#d8b4fe]/50 bg-[#ede9fe]/30">
                    <th className="py-4 pl-6">Product</th>
                    <th className="py-4">Category</th>
                    <th className="py-4">Stock</th>
                    <th className="py-4">Status</th>
                    <th className="py-4 text-center">Receive/Dispatch</th>
                    <th className="py-4 text-center pr-6">Edit/View</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-medium text-[#2e1065]">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((p) => (
                      <tr key={p.id} className="border-b border-[#d8b4fe]/30 hover:bg-[#ede9fe]/20 transition-colors">
                        <td className="py-4 pl-6 text-[#2e1065]">{p.name}</td>
                        <td className="py-4 text-[#4c1d95]/80">{p.category}</td>
                        <td className="py-4 text-[#4c1d95]/90">{p.stock}</td>
                        <td className="py-4">
                          <span className={`font-semibold ${
                            p.status === 'In stock' ? 'text-emerald-600' :
                            p.status === 'Low Stock' ? 'text-amber-500' : 'text-rose-500'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="py-4 text-center">
                          <button
                            onClick={() => openReceiveDispatch(p)}
                            className="btn btn-xs bg-[#c4b5fd] hover:bg-[#b4a5ed] border-0 text-[#2e1065] font-semibold px-4 rounded-md"
                          >
                            Receive/Dispatch
                          </button>
                        </td>
                        <td className="py-4 text-center pr-6">
                         <div className="flex justify-center gap-2">
                            <button
                              onClick={() => navigate(`/edit-product/${p.id}`)}
                              className="btn btn-square btn-xs bg-[#c4b5fd] hover:bg-[#b4a5ed] border-0 text-sm flex items-center justify-center text-[#2e1065] antialiased"
                            >
                              🖋︎
                            </button>
                            <button
                              onClick={() => navigate(`/product-details/${p.id}`)}
                              className="btn btn-square btn-xs bg-[#c4b5fd] hover:bg-[#b4a5ed] border-0 text-sm flex items-center justify-center text-[#2e1065] antialiased"
                            >
                              👁︎
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-[#2e1065]/60 text-sm font-medium">
                        No products match your search or filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-1.5 mt-5">
              <button className="btn btn-square btn-xs bg-[#c4b5fd]/40 hover:bg-[#c4b5fd]/70 border border-[#8b7fd6]/30 text-xs text-[#2e1065]">‹</button>
              <button className="btn btn-square btn-xs bg-[#c4b5fd] border-0 text-xs text-[#2e1065] font-bold">1</button>
              <button className="btn btn-square btn-xs bg-[#c4b5fd]/40 hover:bg-[#c4b5fd]/70 border border-[#8b7fd6]/30 text-xs text-[#2e1065]">2</button>
              <button className="btn btn-square btn-xs bg-[#c4b5fd]/40 hover:bg-[#c4b5fd]/70 border border-[#8b7fd6]/30 text-xs text-[#2e1065]">3</button>
              <button className="btn btn-square btn-xs bg-[#c4b5fd]/40 hover:bg-[#c4b5fd]/70 border border-[#8b7fd6]/30 text-xs text-[#2e1065]">›</button>
            </div>
          </div>
        </main>
      </div>

      {activeProduct && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-bold text-[#2e1065] mb-1">Receive / Dispatch Stock</h2>
            <p className="text-xs text-[#2e1065]/60 mb-4">{activeProduct.name} — current stock: {activeProduct.stock}</p>

            <label className="block text-[11px] font-bold text-[#2e1065] mb-1.5 uppercase tracking-wide">Quantity</label>
            <input
              type="number"
              min="1"
              value={quantityInput}
              onChange={(e) => setQuantityInput(e.target.value)}
              placeholder="Enter quantity"
              className="input input-sm w-full bg-[#ede9fe]/50 border border-[#8b7fd6]/40 rounded-lg text-xs font-medium text-[#2e1065] mb-5 focus:outline-none focus:border-[#8b7fd6]"
            />

            <div className="flex gap-3 mb-3">
              <button
                onClick={() => applyStockChange("receive")}
                className="btn btn-sm flex-1 bg-emerald-600 hover:bg-emerald-700 border-0 text-white font-medium rounded-lg"
              >
                + Receive
              </button>
              <button
                onClick={() => applyStockChange("dispatch")}
                className="btn btn-sm flex-1 bg-rose-500 hover:bg-rose-600 border-0 text-white font-medium rounded-lg"
              >
                − Dispatch
              </button>
            </div>

            <button
              onClick={closeModal}
              className="btn btn-sm w-full bg-white hover:bg-gray-50 border border-gray-300 text-[#2e1065] font-medium rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
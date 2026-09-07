import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';

const STORAGE_KEY = "ims_products";
const PAGE_SIZE = 5;

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
  let products = raw ? JSON.parse(raw) : [];
  let changed = false;
  products = products.map((p) => {
    if (p.safetyStock === undefined || p.leadTimeDemand === undefined || p.supplier === undefined || p.lastReorderDate === undefined) {
      changed = true;
      return ensureRopFields(p);
    }
    return p;
  });
  if (changed) localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  return products;
}

function getRopStatus(stock, rop) {
  const s = Number(stock) || 0;
  const r = Number(rop) || 1;
  if (s <= r) return "Low";
  if (s <= r * 1.5) return "Medium";
  return "High";
}

export default function ManagerReorderManagement() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef(null);
  const [statusFilter, setStatusFilter] = useState("All");

  const [rawProducts, setRawProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setRawProducts(loadProducts());
  }, []);

  const products = useMemo(
    () => rawProducts.map((p) => ({ ...p, ropStatus: getRopStatus(p.stock, p.reorderPoint) })),
    [rawProducts]
  );

  const lowCount = products.filter((p) => p.ropStatus === "Low").length;
  const mediumCount = products.filter((p) => p.ropStatus === "Medium").length;
  const highCount = products.filter((p) => p.ropStatus === "High").length;

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.trim().toLowerCase());
      const matchesStatus = statusFilter === "All" || p.ropStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [products, searchTerm, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

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

  const statusBadgeClass = (status) =>
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

        <main className="max-w-7xl mx-auto px-4 sm:px-6 mt-8 relative z-10 w-full pb-12 flex-1 flex flex-col">

          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-[#2e1065]">Reorder</h1>
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
                {statusFilter !== "All" && (
                  <span className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#8b7fd6] text-white text-[10px] font-bold">1</span>
                )}
              </button>

              {isFilterOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-[#d8b4fe]/60 rounded-xl shadow-lg p-4 z-40">
                  <label className="block text-[11px] font-bold text-[#2e1065] mb-1.5 uppercase tracking-wide">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="select select-sm w-full bg-[#ede9fe]/50 border border-[#8b7fd6]/40 rounded-lg text-xs font-medium text-[#2e1065] mb-4 focus:outline-none focus:border-[#8b7fd6]"
                  >
                    <option value="All">All</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>

                  <div className="flex justify-between items-center">
                    <button onClick={() => setStatusFilter("All")} className="text-[11px] font-semibold text-[#8b7fd6] hover:text-[#6b5ba8]">
                      Clear Filter
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

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <button
              onClick={() => setStatusFilter(statusFilter === "Low" ? "All" : "Low")}
              className={`flex items-center gap-3 bg-white border rounded-xl p-4 shadow-xs text-left transition-all ${
                statusFilter === "Low" ? "border-rose-400 ring-2 ring-rose-200" : "border-[#d8b4fe]/50 hover:border-rose-300"
              }`}
            >
              <div className="w-9 h-9 rounded-full bg-rose-500 flex items-center justify-center text-white text-sm shrink-0">⚠</div>
              <div>
                <p className="text-[11px] font-bold text-[#2e1065]/70 uppercase tracking-wide">Low</p>
                <p className="text-lg font-bold text-[#2e1065]">{lowCount} items</p>
              </div>
            </button>

            <button
              onClick={() => setStatusFilter(statusFilter === "Medium" ? "All" : "Medium")}
              className={`flex items-center gap-3 bg-white border rounded-xl p-4 shadow-xs text-left transition-all ${
                statusFilter === "Medium" ? "border-amber-400 ring-2 ring-amber-200" : "border-[#d8b4fe]/50 hover:border-amber-300"
              }`}
            >
              <div className="w-9 h-9 rounded-full bg-amber-400 flex items-center justify-center text-white text-sm shrink-0">⚠</div>
              <div>
                <p className="text-[11px] font-bold text-[#2e1065]/70 uppercase tracking-wide">Medium</p>
                <p className="text-lg font-bold text-[#2e1065]">{mediumCount} items</p>
              </div>
            </button>

            <button
              onClick={() => setStatusFilter(statusFilter === "High" ? "All" : "High")}
              className={`flex items-center gap-3 bg-white border rounded-xl p-4 shadow-xs text-left transition-all ${
                statusFilter === "High" ? "border-emerald-400 ring-2 ring-emerald-200" : "border-[#d8b4fe]/50 hover:border-emerald-300"
              }`}
            >
              <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center text-white text-sm shrink-0">✓</div>
              <div>
                <p className="text-[11px] font-bold text-[#2e1065]/70 uppercase tracking-wide">High</p>
                <p className="text-lg font-bold text-[#2e1065]">{highCount} items</p>
              </div>
            </button>
          </div>

          {/* Table Card */}
          <div className="bg-[#ede9fe]/40 border border-[#ddd6fe]/70 rounded-2xl p-4 sm:p-5 shadow-xs flex-1 flex flex-col justify-between">
            <div className="overflow-x-auto bg-[#ffffff] rounded-xl shadow-xs border border-[#d8b4fe]/50">
              <table className="table table-md w-full text-left">
                <thead>
                  <tr className="text-[#2e1065] text-sm font-bold border-b border-[#d8b4fe]/50 bg-[#ede9fe]/30">
                    <th className="py-4 pl-6">Product</th>
                    <th className="py-4">Last Reorder Date</th>
                    <th className="py-4">Current Stock</th>
                    <th className="py-4">ROP Level</th>
                    <th className="py-4">Status</th>
                    <th className="py-4 text-center pr-6">View</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-medium text-[#2e1065]">
                  {paginatedProducts.length > 0 ? (
                    paginatedProducts.map((p) => (
                      <tr key={p.id} className="border-b border-[#d8b4fe]/30 hover:bg-[#ede9fe]/20 transition-colors">
                        <td className="py-4 pl-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-md bg-[#ede9fe] border border-[#d8b4fe]/60 flex items-center justify-center overflow-hidden shrink-0">
                              {p.image ? (
                                <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-[10px] text-[#8b7fd6]">🖼</span>
                              )}
                            </div>
                            <span className="text-[#2e1065]">{p.name}</span>
                          </div>
                        </td>
                        <td className="py-4 text-[#4c1d95]/80">{p.lastReorderDate}</td>
                        <td className="py-4 text-[#4c1d95]/90">{p.stock}</td>
                        <td className="py-4 text-[#4c1d95]/90">{p.reorderPoint}</td>
                        <td className="py-4">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusBadgeClass(p.ropStatus)}`}>
                            {p.ropStatus}
                          </span>
                        </td>
                        <td className="py-4 text-center pr-6">
                          <button
                            onClick={() => navigate(`/reorder-points/${p.id}`)}
                            className="btn btn-square btn-xs bg-[#c4b5fd] hover:bg-[#b4a5ed] border-0 text-sm flex items-center justify-center text-[#2e1065] antialiased mx-auto"
                          >
                            👁︎
                          </button>
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

            {/* Functional Pagination */}
            <div className="flex justify-end gap-1.5 mt-5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="btn btn-square btn-xs bg-[#c4b5fd]/40 hover:bg-[#c4b5fd]/70 border border-[#8b7fd6]/30 text-xs text-[#2e1065] disabled:opacity-40"
              >
                ‹
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`btn btn-square btn-xs border-0 text-xs font-bold ${
                    currentPage === pageNum ? 'bg-[#c4b5fd] text-[#2e1065]' : 'bg-[#c4b5fd]/40 hover:bg-[#c4b5fd]/70 text-[#2e1065]'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="btn btn-square btn-xs bg-[#c4b5fd]/40 hover:bg-[#c4b5fd]/70 border border-[#8b7fd6]/30 text-xs text-[#2e1065] disabled:opacity-40"
              >
                ›
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
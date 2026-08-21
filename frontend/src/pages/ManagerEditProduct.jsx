import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router';

const STORAGE_KEY = "ims_products";

function loadProducts() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}
function saveProducts(products) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

export default function ManagerEditProduct() {
  const navigate = useNavigate();
  const { id } = useParams();
  const fileInputRef = useRef(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [loaded, setLoaded] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");
  const [reorderPoint, setReorderPoint] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");

  const categoryOptions = ["Appliances", "Accessories", "Electronics", "Furniture"];

  useEffect(() => {
    const products = loadProducts();
    const product = products.find((p) => String(p.id) === String(id));
    if (product) {
      setImagePreview(product.image || null);
      setProductName(product.name || "");
      setCategory(product.category || "");
      setStockQuantity(String(product.stock ?? ""));
      setReorderPoint(String(product.reorderPoint ?? ""));
      setPrice(String(product.price ?? ""));
      setDescription(product.description || "");
    }
    setLoaded(true);
  }, [id]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setImagePreview(URL.createObjectURL(file));
  };

  const handleLogout = () => navigate("/");
  const handleCancel = () => navigate("/inventory-list");

  const handleUpdate = () => {
    if (!productName.trim()) {
      alert("Please enter a product name.");
      return;
    }
    const products = loadProducts();
    const updated = products.map((p) =>
      String(p.id) === String(id)
        ? {
            ...p,
            name: productName,
            category,
            stock: Number(stockQuantity) || 0,
            reorderPoint: Number(reorderPoint) || 0,
            price,
            description,
            image: imagePreview,
          }
        : p
    );
    saveProducts(updated);
    navigate("/inventory-list");
  };

  const handleDelete = () => {
    const confirmed = window.confirm(`Delete "${productName}"? This cannot be undone.`);
    if (!confirmed) return;
    const products = loadProducts();
    const updated = products.filter((p) => String(p.id) !== String(id));
    saveProducts(updated);
    navigate("/inventory-list");
  };

  const menuItems = [
    { name: "Dashboard", icon: "🏠", path: "/manager-dashboard" },
    { name: "Inventory List", icon: "📋", path: "/inventory-list" },
    { name: "Reorder Points", icon: "🛒", path: "/reorder-points" },
    { name: "Users", icon: "👥", path: "/users" },
    { name: "Reports", icon: "📄", path: "/reports" }
  ];

  if (!loaded) return null;

  return (
    <div className="min-h-screen flex bg-[#ede9fe]/30 font-sans relative overflow-hidden">

      {/* BACKGROUND DIMMER */}
      {isSidebarOpen && (
        <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/30 z-20 transition-opacity duration-300" />
      )}

      {/* SIDEBAR MENU — hidden off-screen until hamburger is clicked */}
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
            <span className="text-sm font-semibold text-[#2e1065]">Edit Product</span>
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

          <div className="bg-[#ede9fe]/40 border border-[#ddd6fe]/70 rounded-2xl p-5 sm:p-6 shadow-xs flex-1">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

              {/* LEFT COLUMN: image, Price, Reorder Point, Delete */}
              <div className="flex flex-col gap-5">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-[#f4f2fb] border border-[#d8b4fe]/60 rounded-xl h-52 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-[#efeaf8] transition-colors overflow-hidden"
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <div className="w-14 h-14 rounded-lg border-2 border-[#2e1065]/70 flex items-center justify-center">
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://w3.org">
                          <circle cx="8" cy="8" r="1.7" stroke="#2e1065" strokeWidth="1.5" />
                          <path d="M3 17L8.5 11.5C9.3 10.7 10.5 10.7 11.3 11.5L17 17" stroke="#2e1065" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M13 15L15.5 12.5C16.3 11.7 17.5 11.7 18.3 12.5L21 15" stroke="#2e1065" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <span className="font-bold text-[#2e1065] text-sm">Upload Image</span>
                      <span className="text-xs text-[#2e1065]/60">PNG, JPG up to 2MB</span>
                    </>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/png, image/jpeg" onChange={handleImageChange} className="hidden" />
                </div>

                <div className="bg-[#c4b5fd]/40 border border-[#8b7fd6]/40 rounded-xl p-3">
                  <label className="block text-sm font-bold text-[#2e1065] mb-2">Price</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Enter Price"
                    className="input input-sm w-full bg-white border border-[#8b7fd6]/40 rounded-lg text-xs font-medium text-[#2e1065] placeholder-[#2e1065]/40 focus:outline-none focus:border-[#8b7fd6]"
                  />
                </div>

                <div className="bg-[#c4b5fd]/40 border border-[#8b7fd6]/40 rounded-xl p-3">
                  <label className="block text-sm font-bold text-[#2e1065] mb-2">Reorder Point</label>
                  <input
                    type="number"
                    min="0"
                    value={reorderPoint}
                    onChange={(e) => setReorderPoint(e.target.value)}
                    placeholder="Enter Reorder Point"
                    className="input input-sm w-full bg-white border border-[#8b7fd6]/40 rounded-lg text-xs font-medium text-[#2e1065] placeholder-[#2e1065]/40 focus:outline-none focus:border-[#8b7fd6]"
                  />
                </div>

                {/* Functional Delete button */}
                <button
                  onClick={handleDelete}
                  className="btn btn-sm bg-rose-600 hover:bg-rose-700 border-0 text-white font-medium rounded-lg mt-1"
                >
                  🗑 Delete Product
                </button>
              </div>

              {/* RIGHT COLUMN: Product Name, Category, Stock Quantity, Description */}
              <div className="flex flex-col gap-5">
                <div className="bg-[#c4b5fd]/40 border border-[#8b7fd6]/40 rounded-xl p-3">
                  <label className="block text-sm font-bold text-[#2e1065] mb-2">Product Name</label>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="Enter Product Name"
                    className="input input-sm w-full bg-white border border-[#8b7fd6]/40 rounded-lg text-xs font-medium text-[#2e1065] placeholder-[#2e1065]/40 focus:outline-none focus:border-[#8b7fd6]"
                  />
                </div>

                <div className="bg-[#c4b5fd]/40 border border-[#8b7fd6]/40 rounded-xl p-3">
                  <label className="block text-sm font-bold text-[#2e1065] mb-2">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="select select-sm w-full bg-white border border-[#8b7fd6]/40 rounded-lg text-xs font-medium text-[#2e1065] focus:outline-none focus:border-[#8b7fd6]"
                  >
                    <option value="" disabled>Select Category</option>
                    {categoryOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>

                <div className="bg-[#c4b5fd]/40 border border-[#8b7fd6]/40 rounded-xl p-3">
                  <label className="block text-sm font-bold text-[#2e1065] mb-2">Stock Quantity</label>
                  <input
                    type="number"
                    min="0"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    placeholder="Enter Stock Quantity"
                    className="input input-sm w-full bg-white border border-[#8b7fd6]/40 rounded-lg text-xs font-medium text-[#2e1065] placeholder-[#2e1065]/40 focus:outline-none focus:border-[#8b7fd6]"
                  />
                </div>

                <div className="bg-[#c4b5fd]/40 border border-[#8b7fd6]/40 rounded-xl p-3 flex-1 flex flex-col">
                  <label className="block text-sm font-bold text-[#2e1065] mb-2">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter description"
                    rows={5}
                    className="textarea textarea-sm w-full bg-white border border-[#8b7fd6]/40 rounded-lg text-xs font-medium text-[#2e1065] placeholder-[#2e1065]/40 focus:outline-none focus:border-[#8b7fd6] resize-y flex-1"
                  />
                </div>

                <div className="flex justify-end gap-3 mt-2">
                  <button onClick={handleCancel} className="btn btn-sm bg-white hover:bg-gray-50 border border-gray-300 text-[#2e1065] font-medium px-6 rounded-lg">
                    Cancel
                  </button>
                  <button onClick={handleUpdate} className="btn btn-sm bg-emerald-600 hover:bg-emerald-700 border-0 text-white font-medium px-6 rounded-lg">
                    Update
                  </button>
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveProduct } from '../services/dataService';

export default function ManagerInventoryAddProduct() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Form state
  const [imagePreview, setImagePreview] = useState(null);
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");
  const [reorderPoint, setReorderPoint] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const categoryOptions = ["Appliances", "Accessories", "Electronics", "Furniture"];

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleCancel = () => {
    navigate("/inventory-list");
  };

  const handleSave = async () => {
    if (!productName.trim()) {
      alert("Please enter a product name.");
      return;
    }
    setIsSaving(true);
    try {
      await saveProduct({
        name: productName.trim(),
        category: category || "Appliances",
        stock: Number(stockQuantity) || 0,
        reorderPoint: Number(reorderPoint) || 0,
        price: price || "0",
        description: description || "",
        image: imagePreview,
      });
      navigate("/inventory-list");
    } catch (err) {
      alert(err.message || "Failed to save product.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 mt-8 relative z-10 w-full pb-12 flex-1 flex flex-col font-sans">
      <div className="bg-[#ede9fe]/40 border border-[#ddd6fe]/70 rounded-2xl p-5 sm:p-6 shadow-xs flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">


              {/* LEFT COLUMN */}
              <div className="flex flex-col gap-5">

                {/* Upload Image Box */}
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
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png, image/jpeg"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>

                {/* Product Name */}
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

                {/* Category */}
                <div className="bg-[#c4b5fd]/40 border border-[#8b7fd6]/40 rounded-xl p-3">
                  <label className="block text-sm font-bold text-[#2e1065] mb-2">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="select select-sm w-full bg-white border border-[#8b7fd6]/40 rounded-lg text-xs font-medium text-[#2e1065] focus:outline-none focus:border-[#8b7fd6]"
                  >
                    <option value="" disabled>Select Category</option>
                    {categoryOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                {/* Stock Quantity */}
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

                {/* Reorder Point */}
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
              </div>

              {/* DIVIDER (desktop only) */}
              <div className="hidden lg:block relative">
                <div className="absolute left-[-16px] top-0 bottom-0 w-px bg-[#d8b4fe]/60"></div>

                {/* RIGHT COLUMN */}
                <div className="flex flex-col gap-5 pl-2">

                  {/* Price */}
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

                  {/* Description */}
                  <div className="bg-[#c4b5fd]/40 border border-[#8b7fd6]/40 rounded-xl p-3 flex-1 flex flex-col">
                    <label className="block text-sm font-bold text-[#2e1065] mb-2">Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Enter description"
                      rows={6}
                      className="textarea textarea-sm w-full bg-white border border-[#8b7fd6]/40 rounded-lg text-xs font-medium text-[#2e1065] placeholder-[#2e1065]/40 focus:outline-none focus:border-[#8b7fd6] resize-y flex-1"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-3 mt-2">
                    <button
                      onClick={handleCancel}
                      className="btn btn-sm bg-white hover:bg-gray-50 border border-gray-300 text-[#2e1065] font-medium px-6 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="btn btn-sm bg-emerald-600 hover:bg-emerald-700 border-0 text-white font-medium px-6 rounded-lg"
                    >
                      Save Product
                    </button>
                  </div>
                </div>
              </div>

              {/* Mobile-only buttons */}
              <div className="flex lg:hidden justify-end gap-3 mt-2">
                <button
                  onClick={handleCancel}
                  className="btn btn-sm bg-white hover:bg-gray-50 border border-gray-300 text-[#2e1065] font-medium px-6 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="btn btn-sm bg-emerald-600 hover:bg-emerald-700 border-0 text-white font-medium px-6 rounded-lg"
                >
                  Save Product
                </button>
              </div>

            </div>
          </div>
        </main>
  );
}
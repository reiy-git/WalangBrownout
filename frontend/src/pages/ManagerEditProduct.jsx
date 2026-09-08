// Manager product edit page allowing updates to metadata, thresholds, and imagery
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getProductById, saveProduct, deleteProductById } from '../services/dataService';

export default function ManagerEditProduct() {
  const navigate = useNavigate();
  const { id } = useParams();
  const fileInputRef = useRef(null);

  const [loaded, setLoaded] = useState(false);
  const [product, setProduct] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");
  const [reorderPoint, setReorderPoint] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categoryOptions = ["Appliances", "Accessories", "Electronics", "Furniture"];

  // Fetch existing product data on mount
  useEffect(() => {
    getProductById(id).then((p) => {
      if (p) {
        setProduct(p);
        setImagePreview(p.image || null);
        setProductName(p.name || "");
        setCategory(p.category || "");
        setStockQuantity(String(p.stock ?? ""));
        setReorderPoint(String(p.reorderPoint ?? ""));
        setPrice(String(p.price ?? ""));
        setDescription(p.description || "");
      }
      setLoaded(true);
    });
  }, [id]);

  // Handle uploaded file preview
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setImagePreview(URL.createObjectURL(file));
  };

  // Return to inventory list
  const handleCancel = () => navigate("/inventory-list");

  // Save changes and navigate back
  const handleUpdate = async () => {
    if (!productName.trim()) {
      alert("Please enter a product name.");
      return;
    }
    setIsSubmitting(true);
    try {
      await saveProduct({
        ...product,
        id,
        name: productName.trim(),
        category,
        stock: Number(stockQuantity) || 0,
        reorderPoint: Number(reorderPoint) || 0,
        price,
        description,
        image: imagePreview,
      });
      navigate("/inventory-list");
    } catch (err) {
      alert(err.message || "Failed to update product.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(`Delete "${productName}"? This cannot be undone.`);
    if (!confirmed) return;
    setIsSubmitting(true);
    try {
      await deleteProductById(id);
      navigate("/inventory-list");
    } catch (err) {
      alert(err.message || "Failed to delete product.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!loaded) return null;

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 mt-8 relative z-10 w-full pb-12 flex-1 flex flex-col font-sans">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-[#2e1065]">Edit Product</h1>
      </div>

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
              <label className="block text-sm font-bold text-[#2e1065] mb-2">Price (₱)</label>
              <input
                type="text"
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

            <button
              type="button"
              onClick={handleDelete}
              disabled={isSubmitting}
              className="btn btn-sm bg-rose-600 hover:bg-rose-700 border-0 text-white font-medium rounded-lg mt-1 text-xs"
            >
              🗑 Delete Product
            </button>
          </div>

          {/* RIGHT COLUMN */}
          <div className="flex flex-col gap-5 justify-between">
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
                  {categoryOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
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
                  rows="4"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter Product Description"
                  className="textarea textarea-sm w-full bg-white border border-[#8b7fd6]/40 rounded-lg text-xs font-medium text-[#2e1065] placeholder-[#2e1065]/40 focus:outline-none focus:border-[#8b7fd6] resize-none grow"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button
                type="button"
                onClick={handleCancel}
                className="btn btn-sm bg-[#c4b5fd]/60 hover:bg-[#c4b5fd]/90 border border-[#8b7fd6]/40 text-[#2e1065] font-semibold px-6 rounded-lg text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdate}
                disabled={isSubmitting}
                className="btn btn-sm bg-[#8b7fd6] hover:bg-[#8b7fd6]/90 border-0 text-white font-semibold px-8 rounded-lg shadow-sm text-xs"
              >
                {isSubmitting ? "Updating..." : "Update"}
              </button>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Image as ImageIcon, X } from "lucide-react";

const DEFAULT_CATEGORIES = ["Appliances", "Electronics", "Furniture", "Office Supplies"];

export default function AddProduct({ categories = DEFAULT_CATEGORIES, onCancel = () => {}, onSubmit = () => {} }) {
  const navigate = useNavigate();
  const [photo, setPhoto] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [form, setForm] = useState({ name: "", category: "", price: "", stock: "" });
  const [customCategory, setCustomCategory] = useState(false);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  const handleFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPhoto(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files?.[0]);
  };

  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((err) => ({ ...err, [field]: undefined }));
  };

  const handleCategorySelect = (e) => {
    const value = e.target.value;
    if (value === "__other__") {
      setCustomCategory(true);
      setForm((f) => ({ ...f, category: "" }));
    } else {
      setCustomCategory(false);
      setForm((f) => ({ ...f, category: value }));
    }
    setErrors((err) => ({ ...err, category: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Enter a product name";
    if (!form.category.trim()) next.category = "Enter a category";
    if (form.stock === "" || Number(form.stock) < 0) next.stock = "Enter a valid quantity";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      name: form.name.trim(),
      category: form.category.trim(),
      price: form.price,
      stock: form.stock,
      photo: photoFile,
    });
    navigate("/inventory");
  };

  const handleCancel = () => {
    onCancel();
    navigate("/inventory");
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <h1 className="text-lg sm:text-xl font-semibold text-gray-900 mb-5">Add New Product</h1>

      <form onSubmit={handleSubmit} className="card card-sm bg-purple-200 shadow-md rounded-xl">
        <div className="card-body p-4">
          <div className="bg-white rounded-lg p-5 space-y-4">
            {/* Photo upload */}
            <div>
              <label className="text-xs text-gray-500 block mb-1">Product Photo</label>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="relative w-full h-40 rounded-lg border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center cursor-pointer hover:border-purple-400 hover:bg-purple-50/40 transition-colors overflow-hidden"
              >
                {photo ? (
                  <>
                    <img src={photo} alt="Product preview" className="absolute inset-0 w-full h-full object-contain bg-white" />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPhoto(null);
                        setPhotoFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full bg-white/90 hover:bg-white shadow"
                      aria-label="Remove photo"
                    >
                      <X size={13} className="text-gray-600" />
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-1 text-center">
                    <ImageIcon size={22} className="text-gray-300" />
                    <p className="text-xs font-medium text-gray-500">Click or drag image to upload</p>
                    <p className="text-[10px] text-gray-400">PNG, JPG up to 2MB</p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files?.[0])}
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-500 block mb-1">Product Name</label>
              <input
                type="text"
                value={form.name}
                onChange={handleChange("name")}
                placeholder="e.g. Wireless Mouse"
                className={`w-full h-9 px-3 text-xs border rounded-lg outline-none focus:border-purple-400 ${
                  errors.name ? "border-red-300" : "border-gray-200"
                }`}
              />
              {errors.name && <p className="text-[11px] text-red-500 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="text-xs text-gray-500 block mb-1">Category</label>
              {!customCategory ? (
                <select
                  value={form.category}
                  onChange={handleCategorySelect}
                  className={`w-full h-9 px-3 text-xs border rounded-lg outline-none bg-white focus:border-purple-400 ${
                    errors.category ? "border-red-300" : "border-gray-200"
                  }`}
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                  <option value="__other__">Other…</option>
                </select>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    autoFocus
                    value={form.category}
                    onChange={handleChange("category")}
                    placeholder="Enter new category"
                    className={`w-full h-9 px-3 text-xs border rounded-lg outline-none focus:border-purple-400 ${
                      errors.category ? "border-red-300" : "border-gray-200"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setCustomCategory(false);
                      setForm((f) => ({ ...f, category: "" }));
                    }}
                    className="text-xs text-gray-500 hover:text-gray-700 px-2 whitespace-nowrap"
                  >
                    Choose existing
                  </button>
                </div>
              )}
              {errors.category && <p className="text-[11px] text-red-500 mt-1">{errors.category}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Price</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={handleChange("price")}
                  placeholder="0.00"
                  className="w-full h-9 px-3 text-xs border border-gray-200 rounded-lg outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 block mb-1">Stock Quantity</label>
                <input
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={handleChange("stock")}
                  placeholder="0"
                  className={`w-full h-9 px-3 text-xs border rounded-lg outline-none focus:border-purple-400 ${
                    errors.stock ? "border-red-300" : "border-gray-200"
                  }`}
                />
                {errors.stock && <p className="text-[11px] text-red-500 mt-1">{errors.stock}</p>}
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="btn btn-sm btn-outline border-gray-300 text-gray-600 rounded-full flex-1 h-9 min-h-[36px] text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-sm bg-purple-600 hover:bg-purple-700 text-white rounded-full flex-1 h-9 min-h-[36px] text-xs border-0"
            >
              Add Product
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
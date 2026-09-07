import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Image as ImageIcon, Trash2, Pencil } from "lucide-react";

const statusStyles = {
  "In Stock": "bg-emerald-50 text-emerald-600",
  "Low Stock": "bg-amber-50 text-amber-500",
  "Out Of Stock": "bg-red-50 text-red-500",
};

function Section({ children, className = "" }) {
  return (
    <div className={`card card-sm bg-purple-200 rounded-xl ${className}`}>
      <div className="card-body p-3">
        <div className="bg-white rounded-lg h-full p-4">{children}</div>
      </div>
    </div>
  );
}

export default function ViewProduct({ products = [], onClose, onUpdate }) {
  const { name } = useParams();
  const navigate = useNavigate();
  const product = products.find((item) => item.name === decodeURIComponent(name)) || {};

  const [photoPreview, setPhotoPreview] = useState(product.photo || null);
  const [isDirty, setIsDirty] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setPhotoPreview(product.photo || null);
    setIsDirty(false);
  }, [product.photo, name]);

  const handleClose = onClose || (() => navigate("/inventory"));

  const handleEditPhoto = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPhotoPreview(ev.target.result);
      setIsDirty(true);
    };
    reader.readAsDataURL(file);
  };

  const handleDeletePhoto = () => {
    setPhotoPreview(null);
    setIsDirty(true);
  };

  const handleCancelPhotoChange = () => {
    setPhotoPreview(product.photo || null);
    setIsDirty(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSavePhoto = () => {
    if (onUpdate) {
      onUpdate(product.name, { photo: photoPreview || undefined });
    }
    setIsDirty(false);
  };

  const rows = [
    ["Category", product.category],
    ["Stock", product.stock !== undefined ? `${product.stock} pcs` : undefined],
    ["Reorder Point", product.reorderPoint],
    ["Price", product.price],
  ].filter(([, value]) => value !== undefined && value !== null && value !== "");

  return (
    <div className="w-full max-w-3xl">
      <h1 className="text-lg sm:text-xl font-semibold text-gray-900 mb-5">Product Details</h1>

      <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-4 items-start">
        <Section>
          <div className="w-full h-56 rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden">
            {photoPreview ? (
              <img src={photoPreview} alt={product.name} className="w-full h-full object-contain" />
            ) : (
              <ImageIcon size={40} className="text-gray-300" />
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg"
            className="hidden"
            onChange={handleFileChange}
          />

          <div className="flex gap-2 mt-3">
            <button
              type="button"
              onClick={handleEditPhoto}
              className="btn btn-xs btn-outline border-gray-300 text-gray-700 rounded-full flex-1 h-8 min-h-[32px] text-[11px] gap-1"
            >
              <Pencil size={12} />
              Edit
            </button>
            <button
              type="button"
              onClick={handleDeletePhoto}
              disabled={!photoPreview}
              className="btn btn-xs btn-outline border-red-200 text-red-500 rounded-full flex-1 h-8 min-h-[32px] text-[11px] gap-1 disabled:opacity-40"
            >
              <Trash2 size={12} />
              Delete
            </button>
          </div>

          {isDirty && (
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={handleCancelPhotoChange}
                className="btn btn-xs btn-outline border-gray-300 text-gray-600 rounded-full flex-1 h-8 min-h-[32px] text-[11px]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePhoto}
                className="btn btn-xs bg-purple-600 hover:bg-purple-700 text-white rounded-full flex-1 h-8 min-h-[32px] text-[11px] border-0"
              >
                Save
              </button>
            </div>
          )}
        </Section>

        <Section>
          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-gray-900">{product.name}</h2>
            {product.status && (
              <span
                className={`inline-block w-fit text-xs font-medium px-3 py-1.5 rounded-full ${
                  statusStyles[product.status] || "bg-gray-50 text-gray-600"
                }`}
              >
                {product.status}
              </span>
            )}
          </div>
        </Section>
      </div>

      <div className="mt-4">
        <Section>
          <dl className="space-y-2.5 text-sm">
            {rows.map(([label, value]) => (
              <div className="flex justify-between" key={label}>
                <dt className="text-gray-500">{label}</dt>
                <dd className="text-gray-800 font-medium">{value}</dd>
              </div>
            ))}
          </dl>

          {product.description && (
            <div className="mt-5 pt-4 border-t border-gray-100">
              <p className="text-sm font-medium text-gray-800 mb-1">Description</p>
              <p className="text-xs text-gray-500 leading-relaxed">{product.description}</p>
            </div>
          )}
        </Section>
      </div>

      <div className="flex justify-end mt-4">
        <button
          type="button"
          onClick={handleClose}
          className="btn btn-sm btn-outline border-gray-300 text-gray-600 rounded-lg h-9 min-h-[36px] text-xs px-6"
        >
          Close
        </button>
      </div>
    </div>
  );
}
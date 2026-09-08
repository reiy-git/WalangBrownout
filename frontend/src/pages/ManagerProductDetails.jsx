// Manager product details overview page showing specification, batch info, and stock levels
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getProductById } from '../services/dataService';

export default function ManagerProductDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load product on mount or route param change
  useEffect(() => {
    getProductById(id).then((found) => {
      setProduct(found);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <main className="max-w-5xl mx-auto px-4 sm:px-6 mt-8 relative z-10 w-full flex-1 flex items-center justify-center font-sans">
        <span className="loading loading-spinner text-[#8b7fd6]"></span>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="max-w-5xl mx-auto px-4 sm:px-6 mt-8 relative z-10 w-full flex-1 flex items-center justify-center font-sans">
        <div className="text-center">
          <p className="text-[#2e1065] font-medium mb-4">Product not found.</p>
          <button
            type="button"
            onClick={() => navigate("/inventory-list")}
            className="btn btn-sm bg-[#8b7fd6] hover:bg-[#8b7fd6]/90 border-0 text-white font-medium px-6 rounded-lg text-xs"
          >
            ← Back to Inventory List
          </button>
        </div>
      </main>
    );
  }

  const statusColor =
    product.status === 'In Stock' ? 'bg-emerald-100 text-emerald-700' :
    product.status === 'Low Stock' ? 'bg-amber-100 text-amber-700' :
    'bg-rose-100 text-rose-700';

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 mt-8 relative z-10 w-full pb-12 flex-1 flex flex-col font-sans">
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
        <div className="bg-white rounded-xl p-5 sm:p-6 space-y-3 shadow-xs">
          <DetailRow label="Category" value={product.category || "—"} />
          <DetailRow label="Stock" value={`${product.stock} pcs`} />
          <DetailRow label="Reorder Point" value={product.reorderPoint ? `${product.reorderPoint} pcs` : "—"} />
          <DetailRow label="Price" value={product.price ? `₱${Number(product.price).toLocaleString()}` : "—"} />

          <div className="pt-3">
            <p className="text-sm font-bold text-[#2e1065] mb-1">Description</p>
            <p className="text-sm text-[#2e1065]/80 whitespace-pre-line">
              {product.description || "No description provided."}
            </p>
          </div>
        </div>

        <div className="flex justify-end mt-5">
          <button
            type="button"
            onClick={() => navigate("/inventory-list")}
            className="btn btn-sm bg-white hover:bg-gray-50 border border-gray-300 text-[#2e1065] font-medium px-8 rounded-lg text-xs"
          >
            ← Back
          </button>
        </div>
      </div>
    </main>
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

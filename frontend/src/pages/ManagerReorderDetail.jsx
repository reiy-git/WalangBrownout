// Manager detail page displaying ROP calculations and stock status
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getProductById } from '../services/dataService';

// Ensure required safety stock and lead time fields exist
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

// Compute ROP risk level based on current stock vs threshold
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
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load product on mount
  useEffect(() => {
    getProductById(id).then((found) => {
      setProduct(found ? ensureRopFields(found) : null);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <main className="max-w-2xl mx-auto px-4 sm:px-6 mt-8 relative z-10 w-full flex-1 flex items-center justify-center font-sans">
        <span className="loading loading-spinner text-[#8b7fd6]"></span>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="max-w-2xl mx-auto px-4 sm:px-6 mt-8 relative z-10 w-full flex-1 flex items-center justify-center font-sans">
        <p className="text-[#2e1065] font-medium">Product not found.</p>
      </main>
    );
  }

  const status = getRopStatus(product.stock, product.reorderPoint);
  const statusBadgeClass =
    status === "Low" ? "bg-rose-500 text-white" :
    status === "Medium" ? "bg-amber-400 text-white" :
    "bg-emerald-500 text-white";

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 mt-8 relative z-10 w-full pb-12 flex-1 flex flex-col font-sans">
      <button
        type="button"
        onClick={() => navigate("/reorder-points")}
        className="flex items-center gap-1.5 text-sm font-semibold text-[#2e1065] hover:text-[#6b5ba8] mb-4 w-fit"
      >
        ← Back to ROP management
      </button>

      <div className="bg-[#c4b5fd]/40 border border-[#8b7fd6]/40 rounded-2xl p-5 sm:p-6 flex flex-col gap-5 shadow-xs">
        <div className="flex flex-col items-center gap-2">
          <div className="w-28 h-28 rounded-xl bg-white border border-[#d8b4fe]/60 flex items-center justify-center overflow-hidden shadow-xs">
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

        <div className="bg-[#8b7fd6] text-white font-bold text-sm text-center rounded-lg py-2.5 shadow-xs">
          {product.name}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-3 border border-[#d8b4fe]/50 shadow-xs">
            <p className="text-[11px] font-bold text-[#2e1065]/60 uppercase tracking-wide mb-1">Current Stock</p>
            <p className="text-lg font-bold text-[#2e1065]">{product.stock}</p>
          </div>
          <div className="bg-white rounded-xl p-3 border border-[#d8b4fe]/50 shadow-xs">
            <p className="text-[11px] font-bold text-[#2e1065]/60 uppercase tracking-wide mb-1">ROP Level</p>
            <p className="text-lg font-bold text-[#2e1065]">{product.reorderPoint}</p>
          </div>
          <div className="bg-white rounded-xl p-3 border border-[#d8b4fe]/50 shadow-xs">
            <p className="text-[11px] font-bold text-[#2e1065]/60 uppercase tracking-wide mb-1">Safety Stock</p>
            <p className="text-lg font-bold text-[#2e1065]">{product.safetyStock}</p>
          </div>
          <div className="bg-white rounded-xl p-3 border border-[#d8b4fe]/50 shadow-xs">
            <p className="text-[11px] font-bold text-[#2e1065]/60 uppercase tracking-wide mb-1">Status</p>
            <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${statusBadgeClass}`}>
              {status}
            </span>
          </div>
          <div className="bg-white rounded-xl p-3 border border-[#d8b4fe]/50 shadow-xs">
            <p className="text-[11px] font-bold text-[#2e1065]/60 uppercase tracking-wide mb-1">Last Reorder Date</p>
            <p className="text-sm font-bold text-[#2e1065]">{product.lastReorderDate}</p>
          </div>
          <div className="bg-white rounded-xl p-3 border border-[#d8b4fe]/50 shadow-xs">
            <p className="text-[11px] font-bold text-[#2e1065]/60 uppercase tracking-wide mb-1">Supplier</p>
            <p className="text-sm font-bold text-[#2e1065]">{product.supplier}</p>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-2">
          <button
            type="button"
            onClick={() => navigate(`/reorder-points/${id}/edit-safety-stock`)}
            className="btn btn-sm bg-[#8b7fd6] hover:bg-[#8b7fd6]/90 border-0 text-white font-semibold px-6 rounded-lg text-xs"
          >
            Edit Safety Stock
          </button>
        </div>
      </div>
    </main>
  );
}


 
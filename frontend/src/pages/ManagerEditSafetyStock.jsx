// Manager page to modify safety stock levels and recalculate ROP
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getProductById, saveProduct } from '../services/dataService';

export default function ManagerEditSafetyStock() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [safetyStockInput, setSafetyStockInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load product to edit on mount
  useEffect(() => {
    getProductById(id).then((found) => {
      if (found) {
        setProduct(found);
        setSafetyStockInput(String(found.safetyStock ?? 10));
      }
    });
  }, [id]);

  if (!product) {
    return (
      <main className="max-w-2xl mx-auto px-4 sm:px-6 mt-8 relative z-10 w-full flex-1 flex items-center justify-center font-sans">
        <p className="text-[#2e1065] font-medium">Product not found.</p>
      </main>
    );
  }

  const leadTimeDemand = Number(product.leadTimeDemand) || 0;
  const previewSafetyStock = Number(safetyStockInput) || 0;
  const livePreviewRop = leadTimeDemand + previewSafetyStock;

  // Validate safety stock value and update ROP
  const handleUpdate = async () => {
    setErrorMsg("");
    const val = Number(safetyStockInput);

    if (safetyStockInput.trim() === "" || isNaN(val)) {
      setErrorMsg("⚠ Please enter a valid safety stock value.");
      return;
    }
    if (val < 0) {
      setErrorMsg("⚠ Safety stock cannot be negative.");
      return;
    }
    if (!Number.isInteger(val)) {
      setErrorMsg("⚠ Safety stock must be a whole number.");
      return;
    }

    setIsSubmitting(true);
    try {
      const newRop = leadTimeDemand + val;
      await saveProduct({
        ...product,
        safetyStock: val,
        reorderPoint: newRop,
      });
      navigate(`/reorder-points/${id}`);
    } catch (err) {
      setErrorMsg(err.message || "Failed to update safety stock.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => navigate(`/reorder-points/${id}`);

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 mt-8 relative z-10 w-full pb-12 flex-1 flex flex-col font-sans">
      <button
        type="button"
        onClick={handleCancel}
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
          <p className="text-sm font-bold text-[#2e1065]">{product.name}</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-[#d8b4fe]/50 flex items-center justify-between shadow-xs">
          <div>
            <p className="text-[11px] font-bold text-[#2e1065]/60 uppercase tracking-wide mb-1">Current ROP</p>
            <p className="text-2xl font-bold text-[#2e1065] flex items-center gap-2">
              📦 {livePreviewRop}
            </p>
          </div>
          <span className="text-[10px] font-bold text-[#8b7fd6] bg-[#ede9fe] px-2.5 py-1 rounded-full uppercase tracking-wide">
            Auto-calculated
          </span>
        </div>

        <div>
          <label className="block text-sm font-bold text-[#2e1065] mb-1">Safety Stock (SS)</label>
          <p className="text-xs text-[#2e1065]/60 mb-2">
            This is the only value you can edit. ROP updates automatically once SS changes.
          </p>
          <input
            type="number"
            min="0"
            value={safetyStockInput}
            onChange={(e) => setSafetyStockInput(e.target.value)}
            className="input input-sm w-full bg-white border border-[#8b7fd6]/40 rounded-lg text-sm font-medium text-[#2e1065] focus:outline-none focus:border-[#8b7fd6]"
          />
        </div>

        {errorMsg && (
          <p className="text-xs font-semibold text-rose-600">{errorMsg}</p>
        )}

        <div className="flex justify-end gap-3 mt-2">
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
    </main>
  );
}


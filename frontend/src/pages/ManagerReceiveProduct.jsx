import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getProductById, recordReceiveStock } from '../services/dataService';

const SUPPLIERS = ["Supplier A", "Supplier B", "Supplier C"];

export default function ManagerReceiveProduct() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [supplier, setSupplier] = useState("");
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState(null);

  // Load product to receive on mount
  useEffect(() => {
    getProductById(id).then(setProduct);
  }, [id]);

  // Validate stock receipt and record ledger entry
  const handleApply = async () => {
    setErrorMsg("");

    if (!supplier) {
      setErrorMsg("⚠ Please select a supplier.");
      return;
    }

    const qty = Number(quantity);
    if (quantity.trim() === "" || isNaN(qty) || !Number.isFinite(qty)) {
      setErrorMsg("⚠ Please enter a valid quantity.");
      return;
    }
    if (qty <= 0) {
      setErrorMsg("⚠ Quantity must be greater than zero.");
      return;
    }
    if (!Number.isInteger(qty)) {
      setErrorMsg("⚠ Quantity must be a whole number.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await recordReceiveStock({
        productId: id,
        quantity: qty,
        supplier,
        notes,
      });

      setConfirmation({
        product: product.name,
        quantity: qty,
        supplier,
        updatedStock: result.product.stock,
      });
    } catch (err) {
      setErrorMsg(err.message || "Failed to receive stock.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseConfirmation = () => {
    navigate("/inventory-list");
  };

  if (!product) {
    return (
      <main className="max-w-2xl mx-auto px-4 sm:px-6 mt-8 relative z-10 w-full flex-1 flex items-center justify-center font-sans">
        <p className="text-[#2e1065] font-medium">Product not found.</p>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 mt-8 relative z-10 w-full pb-12 flex-1 flex flex-col font-sans">
      <div className="bg-[#ede9fe]/40 border border-[#ddd6fe]/70 rounded-2xl p-5 sm:p-6 shadow-xs flex-1 flex flex-col gap-5">
        <div className="flex justify-between items-center mb-1">
          <h1 className="text-xl font-bold text-[#2e1065]">Receive Stock</h1>
        </div>

        <div className="bg-[#c4b5fd]/40 border border-[#8b7fd6]/40 rounded-xl p-3">
          <label className="block text-sm font-bold text-[#2e1065] mb-2">Product</label>
          <input
            type="text"
            value={product.name}
            readOnly
            className="input input-sm w-full bg-white/70 border border-[#8b7fd6]/40 rounded-lg text-xs font-medium text-[#2e1065] cursor-not-allowed"
          />
        </div>

        <div className="bg-[#c4b5fd]/40 border border-[#8b7fd6]/40 rounded-xl p-3">
          <label className="block text-sm font-bold text-[#2e1065] mb-2">Supplier</label>
          <select
            value={supplier}
            onChange={(e) => setSupplier(e.target.value)}
            className="select select-sm w-full bg-white border border-[#8b7fd6]/40 rounded-lg text-xs font-medium text-[#2e1065] focus:outline-none focus:border-[#8b7fd6]"
          >
            <option value="">Select Supplier</option>
            {SUPPLIERS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="bg-[#c4b5fd]/40 border border-[#8b7fd6]/40 rounded-xl p-3">
          <label className="block text-sm font-bold text-[#2e1065] mb-2">Quantity</label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Enter Quantity"
            className="input input-sm w-full bg-white border border-[#8b7fd6]/40 rounded-lg text-xs font-medium text-[#2e1065] placeholder-[#2e1065]/40 focus:outline-none focus:border-[#8b7fd6]"
          />
        </div>

        <div className="bg-[#c4b5fd]/40 border border-[#8b7fd6]/40 rounded-xl p-3">
          <label className="block text-sm font-bold text-[#2e1065] mb-2">Notes</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Enter notes"
            className="input input-sm w-full bg-white border border-[#8b7fd6]/40 rounded-lg text-xs font-medium text-[#2e1065] placeholder-[#2e1065]/40 focus:outline-none focus:border-[#8b7fd6]"
          />
        </div>

        {errorMsg && (
          <p className="text-xs font-semibold text-rose-600">{errorMsg}</p>
        )}

        <div className="flex justify-end gap-3 mt-3">
          <button
            type="button"
            onClick={() => navigate("/inventory-list")}
            className="btn btn-sm bg-[#c4b5fd]/60 hover:bg-[#c4b5fd]/90 border border-[#8b7fd6]/40 text-[#2e1065] font-semibold px-6 rounded-lg text-xs"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={isSubmitting}
            className="btn btn-sm bg-[#8b7fd6] hover:bg-[#8b7fd6]/90 border-0 text-white font-semibold px-8 rounded-lg shadow-sm text-xs"
          >
            {isSubmitting ? "Applying..." : "Apply"}
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmation && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[#8b7fd6]/40 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3 text-xl">
              ✓
            </div>
            <h3 className="font-bold text-[#2e1065] text-base mb-1">Stock Received!</h3>
            <p className="text-xs text-[#2e1065]/70 mb-4">
              Successfully received {confirmation.quantity} units of {confirmation.product}.
              New stock level is {confirmation.updatedStock} units.
            </p>
            <button
              type="button"
              onClick={handleCloseConfirmation}
              className="btn btn-sm bg-[#8b7fd6] hover:bg-[#8b7fd6]/90 border-0 text-white font-semibold w-full rounded-lg text-xs"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </main>
  );
}


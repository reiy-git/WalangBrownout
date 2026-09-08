// Manager page to record outgoing product dispatches/orders
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getProductById, recordDispatchStock } from '../services/dataService';

const DEPARTMENTS = ["Operations", "Sales", "Showroom", "Customer Fulfillment"];

export default function ManagerDispatchProduct() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [department, setDepartment] = useState("");
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState(null);

  // Fetch the active product on load/ID change
  useEffect(() => {
    getProductById(id).then(setProduct);
  }, [id]);

  const currentStock = Number(product?.stock) || 0;

  // Validate and submit dispatch transaction
  const handleDispatch = async () => {
    setErrorMsg("");

    if (!department) {
      setErrorMsg("⚠ Please select a customer or department.");
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
    if (qty > currentStock) {
      setErrorMsg("⚠ Insufficient stock. Please enter a quantity within the available stock.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await recordDispatchStock({
        productId: id,
        quantity: qty,
        department,
        notes,
      });

      setProduct(result.product);
      setConfirmation({
        product: product.name,
        quantity: qty,
        department,
        remainingStock: result.product.stock,
      });
    } catch (err) {
      setErrorMsg(err.message || "Failed to dispatch stock.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Close popup and return to list
  const handleCloseConfirmation = () => {
    navigate("/inventory-list");
  };

  if (!product) {
    return (
      <main className="max-w-3xl mx-auto px-4 sm:px-6 mt-8 relative z-10 w-full flex-1 flex items-center justify-center font-sans">
        <p className="text-[#2e1065] font-medium">Product not found.</p>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 mt-8 relative z-10 w-full pb-12 flex-1 flex flex-col font-sans">
      <div className="bg-[#ede9fe]/40 border border-[#ddd6fe]/70 rounded-2xl p-5 sm:p-6 shadow-xs flex-1">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold text-[#2e1065]">Dispatch Stock</h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-5">
          <div className="sm:col-span-2 bg-[#c4b5fd]/40 border border-[#8b7fd6]/40 rounded-xl p-3 flex flex-col justify-center">
            <label className="block text-sm font-bold text-[#2e1065] mb-2">Product</label>
            <input
              type="text"
              value={product.name}
              readOnly
              className="input input-sm w-full bg-white/70 border border-[#8b7fd6]/40 rounded-lg text-xs font-medium text-[#2e1065] cursor-not-allowed"
            />
          </div>

          <div className="bg-white border border-[#8b7fd6]/30 rounded-xl p-4 flex items-center gap-3 shadow-xs">
            <div className="w-10 h-10 rounded-full bg-[#ede9fe] flex items-center justify-center shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://w3.org">
                <path d="M12 2L21 7V17L12 22L3 17V7L12 2Z" stroke="#8b7fd6" strokeWidth="1.5" />
                <path d="M12 2L21 7L12 12L3 7L12 2Z" fill="#c4b5fd" fillOpacity="0.6" />
              </svg>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-[#2e1065]/60">Current Stock</p>
              <p className="text-lg font-bold text-[#2e1065]">{currentStock}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="bg-[#c4b5fd]/40 border border-[#8b7fd6]/40 rounded-xl p-3">
            <label className="block text-sm font-bold text-[#2e1065] mb-2">Customer / Department</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="select select-sm w-full bg-white border border-[#8b7fd6]/40 rounded-lg text-xs font-medium text-[#2e1065] focus:outline-none focus:border-[#8b7fd6]"
            >
              <option value="">Select customer or department</option>
              {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div className="bg-[#c4b5fd]/40 border border-[#8b7fd6]/40 rounded-xl p-3">
            <label className="block text-sm font-bold text-[#2e1065] mb-2">Quantity</label>
            <input
              type="number"
              min="1"
              max={currentStock}
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
              onClick={handleDispatch}
              disabled={isSubmitting}
              className="btn btn-sm bg-[#8b7fd6] hover:bg-[#8b7fd6]/90 border-0 text-white font-semibold px-8 rounded-lg shadow-sm text-xs"
            >
              {isSubmitting ? "Dispatching..." : "Dispatch"}
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmation && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[#8b7fd6]/40 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3 text-xl">
              ✓
            </div>
            <h3 className="font-bold text-[#2e1065] text-base mb-1">Stock Dispatched!</h3>
            <p className="text-xs text-[#2e1065]/70 mb-4">
              Successfully dispatched {confirmation.quantity} units of {confirmation.product} to {confirmation.department}.
              Remaining stock is {confirmation.remainingStock} units.
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


import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PackageMinus } from "lucide-react";

const defaultRecipients = ["Sales Department", "IT Department", "Warehouse B", "Client - Acme Corp"];

export default function DispatchProduct({ products = [], recipients = defaultRecipients, onCancel, onApply, onViewAll }) {
  const { name } = useParams();
  const navigate = useNavigate();
  const product = products.find((item) => item.name === decodeURIComponent(name)) || {};

  const [recipient, setRecipient] = useState("");
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");

  const handleCancel = () => {
    if (onCancel) onCancel();
    navigate("/inventory");
  };

  const handleViewAll = () => {
    if (onViewAll) onViewAll();
    navigate("/inventory");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const qty = Number(quantity);
    if (!qty || qty <= 0) return;
    onApply && onApply(product.name, qty);
    navigate("/inventory");
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-t-xl px-4 py-3">
        <span className="w-6 h-6 flex items-center justify-center rounded bg-purple-100 text-purple-600">
          <PackageMinus size={14} />
        </span>
        <h1 className="text-sm font-semibold text-gray-900">Dispatch Product</h1>
      </div>

      <div className="card card-sm bg-purple-200 shadow-md rounded-b-xl rounded-t-none">
        <form onSubmit={handleSubmit} className="card-body p-5 flex flex-col gap-4">
          <div className="bg-purple-100 rounded-lg p-3">
            <label className="text-xs font-semibold text-gray-700 block mb-1.5">Product:</label>
            <input
              type="text"
              value={product?.name || ""}
              readOnly
              className="w-full h-9 px-3 text-xs bg-white border border-gray-200 rounded-lg outline-none text-gray-700"
            />
          </div>

          <div className="bg-purple-100 rounded-lg p-3">
            <label className="text-xs font-semibold text-gray-700 block mb-1.5">Customer / Department</label>
            <select
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              required
              className="w-full h-9 px-3 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:border-purple-400 text-gray-700"
            >
              <option value="" disabled>Select customer or department</option>
              {recipients.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div className="bg-purple-100 rounded-lg p-3">
            <label className="text-xs font-semibold text-gray-700 block mb-1.5">Quantity</label>
            <input
              type="number"
              min="1"
              max={product?.stock}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Enter Quantity"
              required
              className="w-full h-9 px-3 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:border-purple-400 text-gray-700 placeholder:text-gray-400"
            />
            {product?.stock != null && (
              <p className="text-[10px] text-gray-500 mt-1">Available stock: {product.stock}</p>
            )}
          </div>

          <div className="bg-purple-100 rounded-lg p-3">
            <label className="text-xs font-semibold text-gray-700 block mb-1.5">Notes</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter notes"
              className="w-full h-9 px-3 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:border-purple-400 text-gray-700 placeholder:text-gray-400"
            />
          </div>

          <div className="flex items-center justify-between gap-2 mt-1">
            <button type="button" onClick={handleCancel} className="btn btn-sm btn-outline border-gray-300 text-gray-600 rounded-full h-9 min-h-[36px] text-xs px-5">
              Cancel
            </button>
            <div className="flex gap-2">
              <button type="button" onClick={handleViewAll} className="btn btn-sm btn-outline border-gray-300 text-gray-700 bg-white rounded-full h-9 min-h-[36px] text-xs px-5">
                View All
              </button>
              <button type="submit" className="btn btn-sm bg-emerald-500 hover:bg-emerald-600 text-white rounded-full h-9 min-h-[36px] text-xs px-6 border-0">
                Dispatch
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
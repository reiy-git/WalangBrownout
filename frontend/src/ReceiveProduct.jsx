import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PackagePlus } from "lucide-react";

const defaultSuppliers = ["Supplier A", "Supplier B", "Supplier C", "Local Vendor"];

export default function ReceiveProduct({ products = [], suppliers = defaultSuppliers, onCancel, onApply }) {
  const { name } = useParams();
  const navigate = useNavigate();
  const product = products.find((item) => item.name === decodeURIComponent(name)) || {};

  const [supplier, setSupplier] = useState("");
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");

  const handleCancel = () => {
    if (onCancel) onCancel();
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
          <PackagePlus size={14} />
        </span>
        <h1 className="text-sm font-semibold text-gray-900">Receive Product</h1>
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
            <label className="text-xs font-semibold text-gray-700 block mb-1.5">Supplier</label>
            <select
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              required
              className="w-full h-9 px-3 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:border-purple-400 text-gray-700"
            >
              <option value="" disabled>Select Supplier</option>
              {suppliers.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="bg-purple-100 rounded-lg p-3">
            <label className="text-xs font-semibold text-gray-700 block mb-1.5">Quantity</label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Enter Quantity"
              required
              className="w-full h-9 px-3 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:border-purple-400 text-gray-700 placeholder:text-gray-400"
            />
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

          <div className="flex justify-end gap-2 mt-1">
            <button type="button" onClick={handleCancel} className="btn btn-sm btn-outline border-gray-300 text-gray-600 rounded-full h-9 min-h-[36px] text-xs px-5">
              Cancel
            </button>
            <button type="submit" className="btn btn-sm bg-emerald-500 hover:bg-emerald-600 text-white rounded-full h-9 min-h-[36px] text-xs px-6 border-0">
              Apply
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
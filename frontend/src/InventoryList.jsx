import { useState } from "react";
import { Search, SlidersHorizontal, Eye, Plus, ChevronLeft, ChevronRight } from "lucide-react";

const products = [
  { name: "Product A", category: "Electronics", stock: 109, status: "In Stock" },
  { name: "Product B", category: "Electronics", stock: 99, status: "In Stock" },
  { name: "Product C", category: "Electronics", stock: 32, status: "Low Stock" },
  { name: "Product D", category: "Electronics", stock: 0, status: "Out Of Stock" },
  { name: "Product E", category: "Electronics", stock: 67, status: "In Stock" },
];

const statusStyles = {
  "In Stock": "text-emerald-600",
  "Low Stock": "text-amber-500",
  "Out Of Stock": "text-red-500",
};

export default function InventoryList({ items = products, onAddProduct, onView, onReceiveDispatch }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const totalPages = 3;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Inventory List</h1>
        <button
          type="button"
          onClick={onAddProduct}
          className="btn btn-sm bg-purple-600 hover:bg-purple-700 text-white rounded-full gap-1 h-8 min-h-[32px] text-xs px-4 border-0"
        >
          <Plus size={14} />
          Add New Product
        </button>
      </div>

      {/* Search + filters */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="input input-sm flex items-center gap-2 h-9 px-3 bg-white border border-gray-200 rounded-lg w-full sm:w-72">
          <Search size={14} className="text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Search product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="grow min-w-0 text-xs outline-none"
          />
        </div>
        <button
          type="button"
          className="btn btn-sm btn-outline border-gray-200 text-gray-700 rounded-lg gap-1.5 h-9 min-h-[36px] text-xs px-3"
        >
          <SlidersHorizontal size={14} />
          Filters
        </button>
      </div>

      {/* Table card */}
      <div className="card card-sm bg-purple-200 shadow-md rounded-xl">
        <div className="card-body p-4">
          <div className="bg-white rounded-lg overflow-x-auto">
            <table className="table table-sm w-full">
              <thead>
                <tr className="text-purple-950 text-[11px]">
                  <th className="font-semibold py-3 pl-3">Product</th>
                  <th className="font-semibold py-3">Category</th>
                  <th className="font-semibold py-3">Stock</th>
                  <th className="font-semibold py-3">Status</th>
                  <th className="font-semibold py-3">Receive/Dispatch</th>
                  <th className="font-semibold py-3 pr-3 text-right">View</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={i} className="text-gray-800 text-xs border-t border-purple-100">
                    <td className="py-3 pl-3 uppercase">{item.name}</td>
                    <td className="py-3 uppercase">{item.category}</td>
                    <td className="py-3">{item.stock}</td>
                    <td className={`py-3 font-medium ${statusStyles[item.status] || "text-gray-600"}`}>
                      {item.status}
                    </td>
                    <td className="py-3">
                      <button
                        type="button"
                        onClick={() => onReceiveDispatch && onReceiveDispatch(item)}
                        className="btn btn-xs bg-purple-400 hover:bg-purple-500 text-white rounded-full h-6 min-h-[24px] text-[10px] px-3 border-0"
                      >
                        Receive/Dispatch
                      </button>
                    </td>
                    <td className="py-3 pr-3 text-right">
                      <button
                        type="button"
                        onClick={() => onView && onView(item)}
                        className="w-7 h-7 inline-flex items-center justify-center rounded-full bg-purple-400 hover:bg-purple-500 text-white"
                        aria-label={`View ${item.name}`}
                      >
                        <Eye size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-end gap-1.5 mt-4">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="w-7 h-7 flex items-center justify-center rounded-full text-purple-700 hover:bg-purple-100 disabled:opacity-40"
              disabled={page === 1}
              aria-label="Previous page"
            >
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPage(p)}
                className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-medium
                  ${p === page ? "bg-purple-400 text-white" : "text-purple-700 hover:bg-purple-100"}`}
              >
                {p}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="w-7 h-7 flex items-center justify-center rounded-full text-purple-700 hover:bg-purple-100 disabled:opacity-40"
              disabled={page === totalPages}
              aria-label="Next page"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
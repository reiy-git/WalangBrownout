import { useState } from "react";
import { Search, SlidersHorizontal, Eye, Plus, ChevronLeft, ChevronRight, X, Image as ImageIcon } from "lucide-react";

const products = [
  { name: "Aircon Split Type 1.5HP", category: "Appliances", stock: 24, status: "In Stock" },
  { name: "Laptop Dell Version", category: "Electronics", stock: 15, status: "In Stock" },
  { name: "Canon PIXMA G3010", category: "Electronics", stock: 8, status: "Low Stock" },
  { name: "Office Chair Ergonomic", category: "Furniture", stock: 0, status: "Out Of Stock" },
];

const statusStyles = {
  "In Stock": "text-emerald-600",
  "Low Stock": "text-amber-500",
  "Out Of Stock": "text-red-500",
};

const getStatus = (stock) => {
  if (stock <= 0) return "Out Of Stock";
  if (stock <= 10) return "Low Stock";
  return "In Stock";
};

const emptyForm = { name: "", category: "", stock: "" };
const statusOptions = ["In Stock", "Low Stock", "Out Of Stock"];

export default function InventoryList({ items = products, onAddProduct, onView, onReceiveDispatch }) {
  const [productList, setProductList] = useState(items);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [showFilters, setShowFilters] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const totalPages = 3;

  const categoryOptions = [...new Set(productList.map((p) => p.category))];

  const filteredItems = productList.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !categoryFilter || item.category === categoryFilter;
    const matchesStatus = !statusFilter || item.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const clearFilters = () => {
    setCategoryFilter("");
    setStatusFilter("");
  };

  const hasActiveFilters = categoryFilter || statusFilter;

  const handleView = (item) => {
    setSelectedProduct(item);
    onView && onView(item);
  };

  const closeModal = () => setSelectedProduct(null);

  const openAddModal = () => {
    setForm(emptyForm);
    setShowAddModal(true);
  };

  const closeAddModal = () => setShowAddModal(false);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.category.trim()) return;

    const stockNum = Number(form.stock) || 0;
    const newProduct = {
      name: form.name.trim(),
      category: form.category.trim(),
      stock: stockNum,
      status: getStatus(stockNum),
    };

    setProductList((prev) => [...prev, newProduct]);
    onAddProduct && onAddProduct(newProduct);
    setShowAddModal(false);
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Inventory List</h1>
        <button
          type="button"
          onClick={openAddModal}
          className="btn btn-sm bg-purple-600 hover:bg-purple-700 text-white rounded-full gap-1 h-8 min-h-[32px] text-xs px-4 border-0"
        >
          <Plus size={14} />
          Add New Product
        </button>
      </div>

      {/* Search + filters */}
      <div className="flex items-center gap-3 mb-4 flex-wrap relative">
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
          onClick={() => setShowFilters((v) => !v)}
          className={`btn btn-sm btn-outline rounded-lg gap-1.5 h-9 min-h-[36px] text-xs px-3
            ${hasActiveFilters ? "border-purple-400 text-purple-700 bg-purple-50" : "border-gray-200 text-gray-700"}`}
        >
          <SlidersHorizontal size={14} />
          Filters
          {hasActiveFilters && (
            <span className="w-4 h-4 flex items-center justify-center bg-purple-600 text-white rounded-full text-[9px]">
              {(categoryFilter ? 1 : 0) + (statusFilter ? 1 : 0)}
            </span>
          )}
        </button>

        {showFilters && (
          <div className="absolute top-11 left-0 z-20 bg-white border border-gray-200 rounded-lg shadow-md p-4 w-64 flex flex-col gap-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full h-9 px-2 text-xs border border-gray-200 rounded-lg outline-none focus:border-purple-400"
              >
                <option value="">All Categories</option>
                {categoryOptions.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-500 block mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full h-9 px-2 text-xs border border-gray-200 rounded-lg outline-none focus:border-purple-400"
              >
                <option value="">All Statuses</option>
                {statusOptions.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 mt-1">
              <button
                type="button"
                onClick={clearFilters}
                className="btn btn-xs btn-outline border-gray-200 text-gray-600 rounded-full flex-1 h-8 min-h-[32px] text-[11px]"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setShowFilters(false)}
                className="btn btn-xs bg-purple-600 hover:bg-purple-700 text-white rounded-full flex-1 h-8 min-h-[32px] text-[11px] border-0"
              >
                Apply
              </button>
            </div>
          </div>
        )}
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
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-gray-400 text-xs">
                      No products found.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item, i) => (
                    <tr key={i} className="text-gray-800 text-xs border-t border-purple-100">
                      <td className="py-3 pl-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 shrink-0 rounded-md border border-gray-200 bg-gray-50 flex items-center justify-center">
                            <ImageIcon size={13} className="text-gray-300" />
                          </div>
                          <span className="uppercase">{item.name}</span>
                        </div>
                      </td>
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
                          onClick={() => handleView(item)}
                          className="w-7 h-7 inline-flex items-center justify-center rounded-full bg-purple-400 hover:bg-purple-500 text-white"
                          aria-label={`View ${item.name}`}
                        >
                          <Eye size={13} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
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

      {/* View Product Modal */}
      {selectedProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-xl shadow-lg w-full max-w-sm p-5 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeModal}
              className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              aria-label="Close"
            >
              <X size={16} />
            </button>

            <div className="w-16 h-16 mx-auto mb-4 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center">
              <ImageIcon size={24} className="text-gray-300" />
            </div>

            <h2 className="text-base font-semibold text-gray-900 mb-4 text-center uppercase">
              {selectedProduct.name}
            </h2>

            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Category</dt>
                <dd className="text-gray-800 font-medium uppercase">{selectedProduct.category}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Stock</dt>
                <dd className="text-gray-800 font-medium">{selectedProduct.stock}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Status</dt>
                <dd className={`font-medium ${statusStyles[selectedProduct.status] || "text-gray-600"}`}>
                  {selectedProduct.status}
                </dd>
              </div>
            </dl>

            <button
              type="button"
              onClick={closeModal}
              className="btn btn-sm bg-purple-600 hover:bg-purple-700 text-white rounded-full w-full mt-5 h-9 min-h-[36px] text-xs border-0"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Add New Product Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={closeAddModal}
        >
          <div
            className="bg-white rounded-xl shadow-lg w-full max-w-sm p-5 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeAddModal}
              className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              aria-label="Close"
            >
              <X size={16} />
            </button>

            <h2 className="text-base font-semibold text-gray-900 mb-4">Add New Product</h2>

            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Product Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleFormChange}
                  required
                  className="w-full h-9 px-3 text-xs border border-gray-200 rounded-lg outline-none focus:border-purple-400"
                  placeholder="e.g. Wireless Mouse"
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 block mb-1">Category</label>
                <input
                  type="text"
                  name="category"
                  value={form.category}
                  onChange={handleFormChange}
                  required
                  className="w-full h-9 px-3 text-xs border border-gray-200 rounded-lg outline-none focus:border-purple-400"
                  placeholder="e.g. Electronics"
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 block mb-1">Stock Quantity</label>
                <input
                  type="number"
                  name="stock"
                  value={form.stock}
                  onChange={handleFormChange}
                  min="0"
                  required
                  className="w-full h-9 px-3 text-xs border border-gray-200 rounded-lg outline-none focus:border-purple-400"
                  placeholder="0"
                />
              </div>

              <button
                type="submit"
                className="btn btn-sm bg-purple-600 hover:bg-purple-700 text-white rounded-full w-full mt-2 h-9 min-h-[36px] text-xs border-0"
              >
                Add Product
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}